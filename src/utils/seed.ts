import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import Outage from '../models/Outage';
import Admin from '../models/Admin';
import { resolveRegion } from './regionMap';
import { OutageData, Provider, Severity, CsvRow } from '../types';

const CSV_PATH = path.join(__dirname, '../../data/outages.csv');

function parseDate(dateStr: string | undefined, timeStr?: string): Date | null {
  if (!dateStr) return null;
  try {
    const combined = timeStr ? `${dateStr} ${timeStr}` : dateStr;
    const d = new Date(combined);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function normalizeProvider(p: string | undefined): Provider {
  if (!p) return 'Other';
  const upper = p.toUpperCase();
  if (upper.includes('AWS')) return 'AWS';
  if (upper.includes('AZURE')) return 'Azure';
  if (upper.includes('GCP') || upper.includes('GOOGLE')) return 'GCP';
  return 'Other';
}

function normalizeSeverity(s: string | undefined): Severity {
  if (!s) return '';
  const lower = s.toLowerCase();
  if (lower.includes('full')) return 'Full';
  if (lower.includes('partial')) return 'Partial';
  return '';
}

function parseOutageRow(row: CsvRow): OutageData | null {
  if (!row.provider || !row.start_date) return null;
  if (row.provider === 'AWS / Azure / GCP') return null; // header description row

  const startDate = parseDate(row.start_date, row.start_time);
  const endDate = parseDate(row.end_date, row.end_time);

  if (!startDate) return null;

  let duration: number | null = parseFloat(row.duration_hours) || null;
  if (!duration && endDate) {
    const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    duration = diff > 0 ? diff : null;
  }

  const regionInfo = resolveRegion(row.region);

  const outage: OutageData = {
    description: row.Column ?? '',
    event_type: row.event_type || 'Outage',
    provider: normalizeProvider(row.provider),
    service: row.service || '',
    region: row.region || '',
    timezone: row.timezone || 'UTC',
    start_date: startDate,
    end_date: endDate ?? null,
    source: row.source || '',
    outage_id: row.outage_id || '',
    duration_hours: duration,
    root_cause: row.root_cause || '',
    severity: normalizeSeverity(row.severity),
    downstream_apps: row.downstream_apps || '',
    estimated_users_affected: parseInt(row.estimated_users_affected) || null,
    region_key: regionInfo ? regionInfo.region_key : (row.region ?? '').toLowerCase().trim(),
  };

  if (regionInfo) {
    outage.coordinates = { lat: regionInfo.lat, lng: regionInfo.lng };
  }

  return outage;
}

async function seed(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not set in environment');

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    await Outage.deleteMany({});
    await Admin.deleteMany({});
    console.log('✓ Cleared existing data');

    const admin = new Admin({
      username: process.env.ADMIN_USERNAME ?? 'admin',
      password: process.env.ADMIN_PASSWORD ?? 'admin123',
    });
    await admin.save();
    console.log(`✓ Created admin user: ${admin.username}`);

    let csvContent: string;
    try {
      csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    } catch {
      console.warn(`CSV not found at ${CSV_PATH}, skipping outage import`);
      await mongoose.disconnect();
      return;
    }

    const rawRecords: Record<string, string>[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    });

    const outages: OutageData[] = [];

    for (const record of rawRecords) {
      const keys = Object.keys(record);

      const row: CsvRow = {
        Column:                    record[keys[0]] ?? record['Column'] ?? '',
        event_type:                record['event_type'] ?? '',
        provider:                  record['provider'] ?? '',
        service:                   record['service'] ?? '',
        region:                    record['region'] ?? '',
        timezone:                  record['timezone'] ?? '',
        start_date:                record['start_date'] ?? '',
        start_time:                record['start_time'] ?? '',
        end_date:                  record['end_date'] ?? '',
        end_time:                  record['end_time'] ?? '',
        source:                    record['source'] ?? '',
        outage_id:                 record['outage_id'] ?? '',
        duration_hours:            record['duration_hours'] ?? '',
        root_cause:                record['root_cause'] ?? '',
        severity:                  record['severity'] ?? '',
        downstream_apps:           record['downstream_apps'] ?? '',
        estimated_users_affected:  record['estimated_users_affected'] ?? '',
      };

      const parsed = parseOutageRow(row);
      if (parsed) outages.push(parsed);
    }

    if (outages.length > 0) {
      await Outage.insertMany(outages);
      console.log(`✓ Seeded ${outages.length} outages`);
    } else {
      console.log('No outages parsed from CSV');
    }

    await mongoose.disconnect();
    console.log('✓ Seed complete');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();

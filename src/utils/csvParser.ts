import { parse } from 'csv-parse/sync';
import { resolveRegion } from './regionMap';
import { OutageData, Provider, Severity, CsvRow } from '../types';

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

function parseDate(dateStr: string | undefined, timeStr: string | undefined): Date | null {
  if (!dateStr) return null;
  try {
    const combined = timeStr ? `${dateStr} ${timeStr}` : dateStr;
    const d = new Date(combined);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function parseCSVBuffer(buffer: Buffer): OutageData[] {
  const records: CsvRow[] = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

  const outages: OutageData[] = [];

  for (const record of records) {
    const keys = Object.keys(record);
    const description = record[keys[0]] ?? record.Column ?? record.description ?? '';
    const provider = record.provider;
    const startDate = parseDate(record.start_date, record.start_time);

    if (!provider || !startDate) continue;

    const normalizedProvider = normalizeProvider(provider);

    const endDate = parseDate(record.end_date, record.end_time);

    let duration: number | null = parseFloat(record.duration_hours) || null;
    if (!duration && endDate) {
      const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      duration = diff > 0 ? diff : null;
    }

    const regionInfo = resolveRegion(record.region);

    const outage: OutageData = {
      description,
      event_type: record.event_type || 'Outage',
      provider: normalizedProvider,
      service: record.service || '',
      region: record.region || '',
      timezone: record.timezone || 'UTC',
      start_date: startDate,
      end_date: endDate,
      source: record.source || '',
      outage_id: record.outage_id || '',
      duration_hours: duration,
      root_cause: record.root_cause || '',
      severity: normalizeSeverity(record.severity),
      downstream_apps: record.downstream_apps || '',
      estimated_users_affected: parseInt(record.estimated_users_affected) || null,
      region_key: regionInfo ? regionInfo.region_key : (record.region || '').toLowerCase().trim(),
    };

    if (regionInfo) {
      outage.coordinates = { lat: regionInfo.lat, lng: regionInfo.lng };
    }

    outages.push(outage);
  }

  return outages;
}

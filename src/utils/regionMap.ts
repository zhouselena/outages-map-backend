import { RegionInfo } from '../types';

interface RegionEntry {
  lat: number;
  lng: number;
  label: string;
  country: string;
}

const REGION_MAP: Record<string, RegionEntry> = {
  // ── AWS Regions ────────────────────────────────────────────────────────────
  'us-east-1':      { lat: 38.9519,   lng: -77.4480,   label: 'US East (N. Virginia)',          country: 'US' },
  'us-east-2':      { lat: 40.4173,   lng: -82.9071,   label: 'US East (Ohio)',                  country: 'US' },
  'us-west-1':      { lat: 37.7749,   lng: -122.4194,  label: 'US West (N. California)',         country: 'US' },
  'us-west-2':      { lat: 45.5231,   lng: -122.6765,  label: 'US West (Oregon)',                country: 'US' },
  'eu-west-1':      { lat: 53.3498,   lng: -6.2603,    label: 'EU West (Ireland)',               country: 'IE' },
  'eu-west-2':      { lat: 51.5074,   lng: -0.1278,    label: 'EU West (London)',                country: 'GB' },
  'eu-west-3':      { lat: 48.8566,   lng: 2.3522,     label: 'EU West (Paris)',                 country: 'FR' },
  'eu-central-1':   { lat: 50.1109,   lng: 8.6821,     label: 'EU Central (Frankfurt)',          country: 'DE' },
  'eu-north-1':     { lat: 59.3293,   lng: 18.0686,    label: 'EU North (Stockholm)',            country: 'SE' },
  'eu-south-1':     { lat: 45.4654,   lng: 9.1859,     label: 'EU South (Milan)',                country: 'IT' },
  'ap-northeast-1': { lat: 35.6762,   lng: 139.6503,   label: 'Asia Pacific (Tokyo)',            country: 'JP' },
  'ap-northeast-2': { lat: 37.5665,   lng: 126.9780,   label: 'Asia Pacific (Seoul)',            country: 'KR' },
  'ap-northeast-3': { lat: 34.6937,   lng: 135.5023,   label: 'Asia Pacific (Osaka)',            country: 'JP' },
  'ap-southeast-1': { lat: 1.3521,    lng: 103.8198,   label: 'Asia Pacific (Singapore)',        country: 'SG' },
  'ap-southeast-2': { lat: -33.8688,  lng: 151.2093,   label: 'Asia Pacific (Sydney)',           country: 'AU' },
  'ap-south-1':     { lat: 19.0760,   lng: 72.8777,    label: 'Asia Pacific (Mumbai)',           country: 'IN' },
  'sa-east-1':      { lat: -23.5505,  lng: -46.6333,   label: 'South America (São Paulo)',       country: 'BR' },
  'ca-central-1':   { lat: 45.4215,   lng: -75.6972,   label: 'Canada (Central)',                country: 'CA' },
  'me-south-1':     { lat: 26.0667,   lng: 50.5577,    label: 'Middle East (Bahrain)',           country: 'BH' },
  'af-south-1':     { lat: -33.9249,  lng: 18.4241,    label: 'Africa (Cape Town)',              country: 'ZA' },

  // ── Azure Regions ──────────────────────────────────────────────────────────
  'east us':              { lat: 37.3719,   lng: -79.8164,  label: 'Azure East US',                   country: 'US' },
  'east us 2':            { lat: 36.6681,   lng: -78.3889,  label: 'Azure East US 2',                 country: 'US' },
  'west us':              { lat: 37.7833,   lng: -122.4167, label: 'Azure West US',                   country: 'US' },
  'west us 2':            { lat: 47.233,    lng: -119.852,  label: 'Azure West US 2',                 country: 'US' },
  'central us':           { lat: 41.5908,   lng: -93.6208,  label: 'Azure Central US',                country: 'US' },
  'north central us':     { lat: 41.8819,   lng: -87.6278,  label: 'Azure North Central US',          country: 'US' },
  'south central us':     { lat: 29.4167,   lng: -98.5,     label: 'Azure South Central US',          country: 'US' },
  'west central us':      { lat: 40.890,    lng: -110.234,  label: 'Azure West Central US',           country: 'US' },
  'north europe':         { lat: 53.3478,   lng: -6.2597,   label: 'Azure North Europe (Ireland)',    country: 'IE' },
  'west europe':          { lat: 52.3667,   lng: 4.9,       label: 'Azure West Europe (Netherlands)', country: 'NL' },
  'uk south':             { lat: 50.941,    lng: -0.799,    label: 'Azure UK South',                  country: 'GB' },
  'uk west':              { lat: 53.427,    lng: -3.084,    label: 'Azure UK West',                   country: 'GB' },
  'france central':       { lat: 46.3772,   lng: 2.3730,    label: 'Azure France Central',            country: 'FR' },
  'germany west central': { lat: 50.110924, lng: 8.682127,  label: 'Azure Germany West Central',      country: 'DE' },
  'japan east':           { lat: 35.68,     lng: 139.77,    label: 'Azure Japan East',                country: 'JP' },
  'japan west':           { lat: 34.6939,   lng: 135.5022,  label: 'Azure Japan West',                country: 'JP' },
  'southeast asia':       { lat: 1.283,     lng: 103.833,   label: 'Azure Southeast Asia (Singapore)', country: 'SG' },
  'east asia':            { lat: 22.267,    lng: 114.188,   label: 'Azure East Asia (Hong Kong)',      country: 'HK' },
  'australia east':       { lat: -33.86,    lng: 151.2094,  label: 'Azure Australia East',            country: 'AU' },
  'australia southeast':  { lat: -37.8136,  lng: 144.9631,  label: 'Azure Australia Southeast',       country: 'AU' },
  'brazil south':         { lat: -23.55,    lng: -46.633,   label: 'Azure Brazil South',              country: 'BR' },
  'canada central':       { lat: 43.653,    lng: -79.383,   label: 'Azure Canada Central',            country: 'CA' },
  'canada east':          { lat: 46.817,    lng: -71.217,   label: 'Azure Canada East',               country: 'CA' },
  'south africa north':   { lat: -25.73134, lng: 28.21837,  label: 'Azure South Africa North',        country: 'ZA' },

  // ── Geographic fallbacks ───────────────────────────────────────────────────
  'global':    { lat: 20,       lng: 0,       label: 'Global',    country: 'GLOBAL' },
  'ireland':   { lat: 53.3498,  lng: -6.2603, label: 'Ireland',   country: 'IE' },
  'argentina': { lat: -34.6037, lng: -58.3816, label: 'Argentina', country: 'AR' },
  'uruguay':   { lat: -34.9011, lng: -56.1645, label: 'Uruguay',   country: 'UY' },
  'europe':    { lat: 50.0,     lng: 10.0,    label: 'Europe',    country: 'EU' },
};

/**
 * Normalises a region string and returns coordinate + metadata.
 * Handles comma-separated multi-region values by taking the first entry.
 */
export function resolveRegion(regionStr: string | undefined | null): RegionInfo | null {
  if (!regionStr) return null;

  const normalized = regionStr.toLowerCase().trim();
  const firstRegion = normalized.split(',')[0].trim();

  // Direct match
  if (REGION_MAP[firstRegion]) {
    return { ...REGION_MAP[firstRegion], region_key: firstRegion };
  }

  // Partial match
  for (const [key, val] of Object.entries(REGION_MAP)) {
    if (firstRegion.includes(key) || key.includes(firstRegion)) {
      return { ...val, region_key: key };
    }
  }

  return null;
}

export { REGION_MAP };

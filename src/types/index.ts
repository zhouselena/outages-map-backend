export type Provider = 'AWS' | 'Azure' | 'GCP' | 'Other';
export type EventType = 'Outage' | 'Service Disruption' | 'Security Attack' | 'Data Loss' | string;
export type Severity = 'Partial' | 'Full' | '';

export interface Coordinates {
  lat: number;
  lng: number;
}

/** Shape of a parsed outage document (used for insertion / responses) */
export interface OutageData {
  description: string;
  event_type: EventType;
  provider: Provider;
  service: string;
  region: string;
  timezone: string;
  start_date: Date;
  end_date?: Date | null;
  source: string;
  outage_id: string;
  duration_hours?: number | null;
  root_cause: string;
  severity: Severity;
  downstream_apps: string;
  estimated_users_affected?: number | null;
  coordinates?: Coordinates;
  region_key: string;
}

/** Shape returned by resolveRegion */
export interface RegionInfo extends Coordinates {
  label: string;
  country: string;
  region_key: string;
}

/** JWT payload stored in req.admin */
export interface JwtPayload {
  id: string;
  username: string;
  iat?: number;
  exp?: number;
}

/** Raw CSV row from csv-parse */
export interface CsvRow {
  [key: string]: string;
  Column?: string;
  event_type: string;
  provider: string;
  service: string;
  region: string;
  timezone: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  source: string;
  outage_id: string;
  duration_hours: string;
  root_cause: string;
  severity: string;
  downstream_apps: string;
  estimated_users_affected: string;
}

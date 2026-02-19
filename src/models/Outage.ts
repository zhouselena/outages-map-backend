import mongoose, { Document, Model, Schema } from 'mongoose';
import { Provider, Severity, Coordinates } from '../types';

export interface IOutage extends Document {
  description: string;
  event_type: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const outageSchema = new Schema<IOutage>(
  {
    description:              { type: String, default: '' },
    event_type:               { type: String, default: 'Outage' },
    provider:                 { type: String, required: true, enum: ['AWS', 'Azure', 'GCP', 'Other'] },
    service:                  { type: String, default: '' },
    region:                   { type: String, default: '' },
    timezone:                 { type: String, default: 'UTC' },
    start_date:               { type: Date,   required: true },
    end_date:                 { type: Date },
    source:                   { type: String, default: '' },
    outage_id:                { type: String, default: '' },
    duration_hours:           { type: Number },
    root_cause:               { type: String, default: '' },
    severity:                 { type: String, enum: ['Partial', 'Full', ''], default: '' },
    downstream_apps:          { type: String, default: '' },
    estimated_users_affected: { type: Number },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    region_key: { type: String, default: '' },
  },
  { timestamps: true }
);

outageSchema.index({ start_date: 1 });
outageSchema.index({ provider: 1 });
outageSchema.index({ region: 1 });

const Outage: Model<IOutage> = mongoose.model<IOutage>('Outage', outageSchema);
export default Outage;

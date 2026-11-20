import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const partyFields = {
  name: { type: String, required: true, trim: true, maxlength: 200 },
  address: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  postalCode: { type: String, trim: true, default: '' },
  country: { type: String, trim: true, default: '' },
  taxId: { type: String, trim: true, default: '' },
  registrationNumber: { type: String, trim: true, default: '' },
  vatNumber: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
} as const;

const clientSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    ...partyFields,
  },
  { timestamps: true },
);

export type Client = InferSchemaType<typeof clientSchema>;
export type ClientDocument = HydratedDocument<Client>;

export const ClientModel = model('Client', clientSchema);

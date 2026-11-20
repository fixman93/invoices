import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const CURRENCIES = ['EUR', 'RSD', 'BAM', 'USD', 'CHF', 'GBP'] as const;

const imageSchema = new Schema(
  {
    key: { type: String, required: true },
    url: { type: String, required: true },
    name: { type: String, trim: true, maxlength: 100, default: '' },
  },
  { _id: true },
);

const companySchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    /** PIB */
    taxId: { type: String, trim: true, default: '' },
    /** Matični broj */
    registrationNumber: { type: String, trim: true, default: '' },
    /** PDV broj (if different from PIB) */
    vatNumber: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    bankName: { type: String, trim: true, default: '' },
    bankAccount: { type: String, trim: true, default: '' },

    /** Default VAT rate (%) for products that don't define their own. */
    vatRate: { type: Number, required: true, min: 0, max: 100, default: 21 },
    currency: { type: String, enum: CURRENCIES, required: true, default: 'EUR' },
    paymentTermDays: { type: Number, min: 0, max: 365, default: 15 },
    invoicePrefix: { type: String, trim: true, maxlength: 20, default: '' },
    /** Default note printed on every invoice (e.g. payment instructions). */
    invoiceNote: { type: String, trim: true, maxlength: 2000, default: '' },
    /** Default name printed under "Fakturu izdao". */
    issuedBy: { type: String, trim: true, maxlength: 100, default: '' },

    logo: { type: imageSchema, default: null },
    stamps: { type: [imageSchema], default: [] },

    /** Invoice numbering restarts every year. */
    invoiceCounter: {
      year: { type: Number, default: () => new Date().getFullYear() },
      value: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export type Company = InferSchemaType<typeof companySchema>;
export type CompanyDocument = HydratedDocument<Company>;
export type CompanyImage = { _id: Types.ObjectId; key: string; url: string; name: string };

export const CompanyModel = model('Company', companySchema);

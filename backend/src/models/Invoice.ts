import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { CURRENCIES } from './Company.js';
import { partyFields } from './Client.js';

export const INVOICE_STATUSES = ['unpaid', 'paid', 'cancelled'] as const;

/** Snapshot of party data at the time of issuing – later edits of the company/client don't change old invoices. */
const partySnapshotSchema = new Schema(
  {
    ...partyFields,
    bankName: { type: String, trim: true, default: '' },
    bankAccount: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const invoiceItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    code: { type: String, default: '' },
    unit: { type: String, default: 'kom' },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    vatRate: { type: Number, required: true, min: 0, max: 100 },
    netAmount: { type: Number, required: true },
    vatAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  { _id: true },
);

const invoiceSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', default: null },
    number: { type: String, required: true },
    status: { type: String, enum: INVOICE_STATUSES, default: 'unpaid' },
    issueDate: { type: Date, required: true },
    /** Datum prometa */
    serviceDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    placeOfIssue: { type: String, trim: true, default: '' },
    currency: { type: String, enum: CURRENCIES, required: true },
    seller: { type: partySnapshotSchema, required: true },
    buyer: { type: partySnapshotSchema, required: true },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    vatTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    /** Person who issued the invoice ("Fakturu izdao"). */
    issuedBy: { type: String, trim: true, maxlength: 100, default: '' },
    /** Which company stamps to print at the bottom of the invoice. */
    stampIds: { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true },
);

invoiceSchema.index({ company: 1, number: 1 }, { unique: true });
invoiceSchema.index({ company: 1, issueDate: -1 });

export type Invoice = InferSchemaType<typeof invoiceSchema>;
export type InvoiceDocument = HydratedDocument<Invoice>;

export const InvoiceModel = model('Invoice', invoiceSchema);

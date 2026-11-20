import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    code: { type: String, trim: true, maxlength: 50, default: '' },
    unit: { type: String, trim: true, maxlength: 20, default: 'kom' },
    /** Unit price without VAT. */
    price: { type: Number, required: true, min: 0 },
    /** Overrides the company VAT rate when set. `null` = use company default. */
    vatRate: { type: Number, min: 0, max: 100, default: null },
  },
  { timestamps: true },
);

export type Product = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<Product>;

export const ProductModel = model('Product', productSchema);

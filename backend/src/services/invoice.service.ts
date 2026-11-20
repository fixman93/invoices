import { Types } from 'mongoose';
import { ClientModel } from '../models/Client.js';
import { CompanyModel, type CompanyDocument } from '../models/Company.js';
import { ProductModel } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { calculateLine, round2 } from '../utils/money.js';
import type { InvoiceInput } from '../validators/invoice.validator.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Atomically reserves the next invoice number for the company, e.g. "INV-7/2026". Numbering restarts each year. */
export const reserveInvoiceNumber = async (company: CompanyDocument, issueDate: Date): Promise<string> => {
  const year = issueDate.getFullYear();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const sameYear = await CompanyModel.findOneAndUpdate(
      { _id: company._id, 'invoiceCounter.year': year },
      { $inc: { 'invoiceCounter.value': 1 } },
      { returnDocument: 'after', projection: { invoiceCounter: 1 } },
    );
    if (sameYear) {
      return `${company.invoicePrefix}${sameYear.invoiceCounter?.value ?? 1}/${year}`;
    }

    // First invoice in a new year: reset the counter (only if nobody else already did).
    const reset = await CompanyModel.findOneAndUpdate(
      { _id: company._id, 'invoiceCounter.year': { $ne: year } },
      { $set: { invoiceCounter: { year, value: 1 } } },
      { returnDocument: 'after', projection: { invoiceCounter: 1 } },
    );
    if (reset) {
      return `${company.invoicePrefix}1/${year}`;
    }
  }

  throw new ApiError(409, 'Nije moguće dodijeliti broj fakture, pokušajte ponovo');
};

const sellerSnapshot = (company: CompanyDocument) => ({
  name: company.name,
  address: company.address,
  city: company.city,
  postalCode: company.postalCode,
  country: company.country,
  taxId: company.taxId,
  registrationNumber: company.registrationNumber,
  vatNumber: company.vatNumber,
  email: company.email,
  phone: company.phone,
  website: company.website,
  bankName: company.bankName,
  bankAccount: company.bankAccount,
});

/**
 * Turns validated input into the invoice fields that get stored: buyer/seller snapshots,
 * line items priced from the company's products, and totals. All amounts are computed on the server.
 */
export const buildInvoiceData = async (company: CompanyDocument, input: InvoiceInput) => {
  const client = await ClientModel.findOne({ _id: input.clientId, company: company._id }).lean();
  if (!client) {
    throw new ApiError(400, 'Kupac nije pronađen');
  }

  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await ProductModel.find({ _id: { $in: productIds }, company: company._id }).lean();
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const items = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new ApiError(400, 'Jedan od proizvoda više ne postoji');
    }

    const unitPrice = round2(item.unitPrice ?? product.price);
    const vatRate = item.vatRate ?? product.vatRate ?? company.vatRate;

    return {
      product: product._id,
      name: product.name,
      description: product.description,
      code: product.code,
      unit: product.unit,
      quantity: item.quantity,
      unitPrice,
      vatRate,
      ...calculateLine(item.quantity, unitPrice, vatRate),
    };
  });

  const subtotal = round2(items.reduce((sum, item) => sum + item.netAmount, 0));
  const vatTotal = round2(items.reduce((sum, item) => sum + item.vatAmount, 0));

  const validStampIds = new Set(company.stamps.map((stamp) => stamp._id.toString()));
  const stampIds = (input.stampIds ?? [...validStampIds])
    .filter((id) => validStampIds.has(id))
    .map((id) => new Types.ObjectId(id));

  const dueDate =
    input.dueDate === undefined
      ? new Date(input.issueDate.getTime() + company.paymentTermDays * DAY_MS)
      : input.dueDate;

  return {
    client: client._id,
    issueDate: input.issueDate,
    serviceDate: input.serviceDate,
    dueDate,
    placeOfIssue: input.placeOfIssue || company.city,
    status: input.status,
    notes: input.notes ?? company.invoiceNote,
    issuedBy: input.issuedBy ?? company.issuedBy,
    currency: company.currency,
    seller: sellerSnapshot(company),
    buyer: {
      name: client.name,
      address: client.address,
      city: client.city,
      postalCode: client.postalCode,
      country: client.country,
      taxId: client.taxId,
      registrationNumber: client.registrationNumber,
      vatNumber: client.vatNumber,
      email: client.email,
      phone: client.phone,
    },
    items,
    subtotal,
    vatTotal,
    total: round2(subtotal + vatTotal),
    stampIds,
  };
};

/** VAT totals grouped by rate, for the invoice summary. */
export const vatBreakdown = (items: { vatRate: number; netAmount: number; vatAmount: number }[]) => {
  const groups = new Map<number, { rate: number; base: number; vat: number }>();
  for (const item of items) {
    const group = groups.get(item.vatRate) ?? { rate: item.vatRate, base: 0, vat: 0 };
    group.base = round2(group.base + item.netAmount);
    group.vat = round2(group.vat + item.vatAmount);
    groups.set(item.vatRate, group);
  }
  return [...groups.values()].sort((a, b) => b.rate - a.rate);
};

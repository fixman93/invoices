import type { Request, Response } from 'express';
import { getCompany } from '../middleware/loadCompany.js';
import { InvoiceModel } from '../models/Invoice.js';
import { buildInvoiceData, reserveInvoiceNumber } from '../services/invoice.service.js';
import { generateInvoicePdf, invoiceFileName } from '../services/pdf.service.js';
import { ApiError } from '../utils/ApiError.js';
import type { InvoiceInput } from '../validators/invoice.validator.js';

const findInvoice = async (req: Request) => {
  const invoice = await InvoiceModel.findOne({ _id: req.params.invoiceId, company: getCompany(req)._id });
  if (!invoice) {
    throw new ApiError(404, 'Faktura nije pronađena');
  }
  return invoice;
};

export const listInvoices = async (req: Request, res: Response): Promise<void> => {
  const invoices = await InvoiceModel.find({ company: getCompany(req)._id })
    .select('number status issueDate dueDate currency buyer.name subtotal vatTotal total createdAt')
    .sort({ issueDate: -1, createdAt: -1 });
  res.json({ success: true, message: 'OK', data: invoices });
};

export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'OK', data: await findInvoice(req) });
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  const company = getCompany(req);
  const input = req.body as InvoiceInput;

  const data = await buildInvoiceData(company, input);
  const number = await reserveInvoiceNumber(company, input.issueDate);
  const invoice = await InvoiceModel.create({ ...data, number, company: company._id });

  res.status(201).json({ success: true, message: 'Faktura je kreirana', data: invoice });
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  const company = getCompany(req);
  const invoice = await findInvoice(req);
  const data = await buildInvoiceData(company, req.body as InvoiceInput);

  // Keep the seller as it was when the invoice was issued.
  const { seller: _seller, ...rest } = data;
  invoice.set(rest);
  await invoice.save();

  res.json({ success: true, message: 'Faktura je sačuvana', data: invoice });
};

export const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
  const invoice = await findInvoice(req);
  invoice.status = (req.body as { status: typeof invoice.status }).status;
  await invoice.save();
  res.json({ success: true, message: 'Status je promijenjen', data: invoice });
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  const invoice = await findInvoice(req);
  await invoice.deleteOne();
  res.json({ success: true, message: 'Faktura je obrisana' });
};

export const downloadInvoicePdf = async (req: Request, res: Response): Promise<void> => {
  const invoice = await findInvoice(req);
  const pdf = await generateInvoicePdf(invoice, getCompany(req));
  const fileName = invoiceFileName(invoice);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', pdf.length);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.send(pdf);
};

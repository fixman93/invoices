import type { Request, Response } from 'express';
import { getCompany } from '../middleware/loadCompany.js';
import { ClientModel } from '../models/Client.js';
import { CompanyModel } from '../models/Company.js';
import { InvoiceModel } from '../models/Invoice.js';
import { ProductModel } from '../models/Product.js';
import { deleteFile, uploadImage } from '../services/storage.service.js';
import { ApiError } from '../utils/ApiError.js';

const MAX_STAMPS = 4;

export const listCompanies = async (req: Request, res: Response): Promise<void> => {
  const companies = await CompanyModel.find({ owner: req.userId }).sort({ name: 1 });
  res.json({ success: true, message: 'OK', data: companies });
};

export const createCompany = async (req: Request, res: Response): Promise<void> => {
  const company = await CompanyModel.create({ ...req.body, owner: req.userId });
  res.status(201).json({ success: true, message: 'Firma je kreirana', data: company });
};

export const getCompanyById = (req: Request, res: Response): void => {
  res.json({ success: true, message: 'OK', data: getCompany(req) });
};

export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  const company = getCompany(req);
  company.set(req.body);
  await company.save();
  res.json({ success: true, message: 'Firma je sačuvana', data: company });
};

export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  const company = getCompany(req);

  await Promise.all([
    ProductModel.deleteMany({ company: company._id }),
    ClientModel.deleteMany({ company: company._id }),
    InvoiceModel.deleteMany({ company: company._id }),
  ]);
  await company.deleteOne();
  await Promise.all([deleteFile(company.logo?.key), ...company.stamps.map((stamp) => deleteFile(stamp.key))]);

  res.json({ success: true, message: 'Firma je obrisana' });
};

const requireFile = (req: Request): Buffer => {
  if (!req.file) {
    throw new ApiError(400, 'Slika nije poslata');
  }
  return req.file.buffer;
};

export const uploadLogo = async (req: Request, res: Response): Promise<void> => {
  const company = getCompany(req);
  const stored = await uploadImage(requireFile(req), `companies/${company.id as string}/logo`);

  const previousKey = company.logo?.key;
  company.set('logo', { ...stored, name: 'logo' });
  await company.save();
  await deleteFile(previousKey);

  res.json({ success: true, message: 'Logo je sačuvan', data: company });
};

export const deleteLogo = async (req: Request, res: Response): Promise<void> => {
  const company = getCompany(req);
  const key = company.logo?.key;
  company.set('logo', null);
  await company.save();
  await deleteFile(key);
  res.json({ success: true, message: 'Logo je obrisan', data: company });
};

export const addStamp = async (req: Request, res: Response): Promise<void> => {
  const company = getCompany(req);
  if (company.stamps.length >= MAX_STAMPS) {
    throw new ApiError(400, `Najviše ${MAX_STAMPS} pečata po firmi`);
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 100) : '';
  const stored = await uploadImage(requireFile(req), `companies/${company.id as string}/stamps`);
  company.stamps.push({ ...stored, name: name || `Pečat ${company.stamps.length + 1}` });
  await company.save();

  res.status(201).json({ success: true, message: 'Pečat je dodat', data: company });
};

export const deleteStamp = async (req: Request, res: Response): Promise<void> => {
  const company = getCompany(req);
  const stamp = company.stamps.id(String(req.params.stampId));
  if (!stamp) {
    throw new ApiError(404, 'Pečat nije pronađen');
  }

  const key = stamp.key;
  stamp.deleteOne();
  await company.save();
  await deleteFile(key);

  res.json({ success: true, message: 'Pečat je obrisan', data: company });
};

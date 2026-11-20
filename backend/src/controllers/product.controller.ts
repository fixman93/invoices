import type { Request, Response } from 'express';
import { getCompany } from '../middleware/loadCompany.js';
import { ProductModel } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

const findProduct = async (req: Request) => {
  const product = await ProductModel.findOne({ _id: req.params.productId, company: getCompany(req)._id });
  if (!product) {
    throw new ApiError(404, 'Proizvod nije pronađen');
  }
  return product;
};

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  const products = await ProductModel.find({ company: getCompany(req)._id }).sort({ name: 1 });
  res.json({ success: true, message: 'OK', data: products });
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await ProductModel.create({ ...req.body, company: getCompany(req)._id });
  res.status(201).json({ success: true, message: 'Proizvod je dodat', data: product });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await findProduct(req);
  product.set(req.body);
  await product.save();
  res.json({ success: true, message: 'Proizvod je sačuvan', data: product });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await findProduct(req);
  await product.deleteOne();
  res.json({ success: true, message: 'Proizvod je obrisan' });
};

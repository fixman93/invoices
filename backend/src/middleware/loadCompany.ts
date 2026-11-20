import type { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { CompanyModel } from '../models/Company.js';
import { ApiError } from '../utils/ApiError.js';

/** Loads `req.params.companyId` and makes sure it belongs to the logged-in user. */
export const loadCompany = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const { companyId } = req.params;

  if (typeof companyId !== 'string' || !isValidObjectId(companyId)) {
    throw new ApiError(404, 'Firma nije pronađena');
  }

  const company = await CompanyModel.findOne({ _id: companyId, owner: req.userId });
  if (!company) {
    throw new ApiError(404, 'Firma nije pronađena');
  }

  req.company = company;
  next();
};

/** Returns `req.company`, guaranteed by `loadCompany`. */
export const getCompany = (req: Request) => {
  if (!req.company) {
    throw new ApiError(500, 'Company not loaded');
  }
  return req.company;
};

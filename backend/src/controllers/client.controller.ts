import type { Request, Response } from 'express';
import { getCompany } from '../middleware/loadCompany.js';
import { ClientModel } from '../models/Client.js';
import { ApiError } from '../utils/ApiError.js';

const findClient = async (req: Request) => {
  const client = await ClientModel.findOne({ _id: req.params.clientId, company: getCompany(req)._id });
  if (!client) {
    throw new ApiError(404, 'Kupac nije pronađen');
  }
  return client;
};

export const listClients = async (req: Request, res: Response): Promise<void> => {
  const clients = await ClientModel.find({ company: getCompany(req)._id }).sort({ name: 1 });
  res.json({ success: true, message: 'OK', data: clients });
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  const client = await ClientModel.create({ ...req.body, company: getCompany(req)._id });
  res.status(201).json({ success: true, message: 'Kupac je dodat', data: client });
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const client = await findClient(req);
  client.set(req.body);
  await client.save();
  res.json({ success: true, message: 'Kupac je sačuvan', data: client });
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  const client = await findClient(req);
  await client.deleteOne();
  res.json({ success: true, message: 'Kupac je obrisan' });
};

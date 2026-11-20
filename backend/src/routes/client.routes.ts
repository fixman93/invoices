import { Router } from 'express';
import { createClient, deleteClient, listClients, updateClient } from '../controllers/client.controller.js';
import { validate } from '../middleware/validate.js';
import { clientSchema, clientUpdateSchema } from '../validators/client.validator.js';

const router = Router({ mergeParams: true });

router.get('/', listClients);
router.post('/', validate(clientSchema), createClient);
router.patch('/:clientId', validate(clientUpdateSchema), updateClient);
router.delete('/:clientId', deleteClient);

export default router;

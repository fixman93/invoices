import { Router } from 'express';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/product.controller.js';
import { validate } from '../middleware/validate.js';
import { productSchema, productUpdateSchema } from '../validators/product.validator.js';

const router = Router({ mergeParams: true });

router.get('/', listProducts);
router.post('/', validate(productSchema), createProduct);
router.patch('/:productId', validate(productUpdateSchema), updateProduct);
router.delete('/:productId', deleteProduct);

export default router;

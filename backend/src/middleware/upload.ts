import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

/** PNG and JPEG only – these are the formats the PDF renderer can embed. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Dozvoljene su samo PNG i JPG slike'));
    }
  },
});

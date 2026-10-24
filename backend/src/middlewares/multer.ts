import multer from 'multer';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Only image uploads are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

export const singleUpload = upload.single('image');
export const multipleUpload = upload.array('images', 5);

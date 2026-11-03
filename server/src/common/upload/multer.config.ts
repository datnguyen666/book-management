import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

import * as fs from 'fs';
import * as path from 'path';

let uploadPath = path.join(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
      recursive: true,
    });
  }
} catch {
  // Trên môi trường Serverless (Vercel/Lambda), filesystem có thể là read-only.
  // Fallback sang /tmp/uploads
  uploadPath = path.join('/tmp', 'uploads');
  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, {
        recursive: true,
      });
    }
  } catch {
    // Bỏ qua lỗi nếu không thể tạo thư mục
  }
}

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      callback(null, uploadPath);
    },

    filename: (req, file, callback) => {
      const uniqueName =
        Date.now() + '-' + Math.round(Math.random() * 1_000_000);

      const extension = path.extname(file.originalname);

      callback(null, `${uniqueName}${extension}`);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const allowedExtensions = /\.(jpg|jpeg|png|webp|jfif)$/i;

    if (!allowedExtensions.test(file.originalname)) {
      return callback(
        new BadRequestException(
          'Only jpg, jpeg, png, webp and jfif files are allowed',
        ),
        false,
      );
    }

    callback(null, true);
  },
};

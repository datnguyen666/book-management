import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

import * as fs from 'fs';
import * as path from 'path';

const uploadPath = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

export const multerOptions = {
  storage: diskStorage({
    destination: uploadPath,

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
    const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;

    if (!allowedExtensions.test(file.originalname)) {
      return callback(
        new BadRequestException(
          'Only jpg, jpeg, png and webp files are allowed',
        ),
        false,
      );
    }

    callback(null, true);
  },
};

import * as path from 'path';

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class UploadImagesValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const max_mb = Number(process.env.MAX_SIZE_FILE_UPLOAD_MB) || 1;
      const MAX_SIZE = max_mb * 1024 * 1024;
      const allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.bmp',
        '.webp',
        '.avif',
      ];

      // Nếu chỉ upload 1 file, NestJS vẫn có thể trả về 1 object thay vì array
      const files = Array.isArray(value) ? value : [value];

      for (const file of files) {
        if (
          !file?.originalname ||
          typeof file.originalname !== 'string' ||
          typeof file.mimetype !== 'string'
        ) {
          throw new BadRequestException('Invalid file format.');
        }

        if (file.size > MAX_SIZE) {
          throw new BadRequestException(
            `File size is too large. Max size is ${max_mb}MB.`,
          );
        }

        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          throw new BadRequestException(
            `Invalid file type: ${fileExtension}. Only image files are allowed.`,
          );
        }
      }

      return value;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

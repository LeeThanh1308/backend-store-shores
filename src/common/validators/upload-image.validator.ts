import * as path from 'path'; // Optional if you need to validate dimensions

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class UploadImageValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (
      value &&
      typeof value.originalname === 'string' &&
      typeof value.mimetype === 'string'
    ) {
      // Validate file size (less than 1MB, for example)
      const max_mb = Number(process.env.MAX_SIZE_FILE_UPLOAD_MB);
      const MAX_SIZE = max_mb * 1024 * 1024; // 1 MB
      if (value?.size > MAX_SIZE) {
        throw new BadRequestException(
          `File size is too large. Max size is ${max_mb}MB.`,
        );
      }

      // Validate file type (must be an image)
      const fileExtension = path.extname(value?.originalname).toLowerCase();
      const allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.bmp',
        '.webp',
        '.avif',
      ];
      if (!allowedExtensions.includes(fileExtension)) {
        throw new BadRequestException(
          'Invalid file type. Only images are allowed.',
        );
      }
      return value;
    } else {
      console.log('Dạng upload không phải là file.');
    }
  }
}

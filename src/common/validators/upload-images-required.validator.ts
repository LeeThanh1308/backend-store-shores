import * as path from 'path'; // Optional if you need to validate dimensions

import {
  ArgumentMetadata,
  BadRequestException,
  ConflictException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class UploadImagesRequiredValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Kiểm tra nếu value không phải là mảng hoặc mảng rỗng
    if (!value || !Array.isArray(value) || value.length === 0) {
      throw new ConflictException({
        validators: {
          files: 'Trường này không được để trống.',
        },
      });
    }

    const max_mb = Number(process.env.MAX_SIZE_FILE_UPLOAD_MB) || 1;
    const MAX_SIZE = max_mb * 1024 * 1024; // Quy đổi MB sang byte
    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.bmp',
      '.webp',
      '.avif',
    ];

    // Duyệt qua từng file trong mảng để validate
    for (const file of value) {
      if (file?.size > MAX_SIZE) {
        throw new BadRequestException(
          `File size is too large. Max size is ${max_mb}MB.`,
        );
      }

      const fileExtension = path
        .extname(file?.originalname || '')
        .toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        throw new BadRequestException(
          'Invalid file type. Only images are allowed.',
        );
      }
    }

    return value;
  }
}

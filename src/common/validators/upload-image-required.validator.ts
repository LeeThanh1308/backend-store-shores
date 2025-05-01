import * as path from 'path'; // Optional if you need to validate dimensions

import {
  ArgumentMetadata,
  BadRequestException,
  ConflictException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class UploadImageRequiredValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
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
    // Kiểm tra nếu value không phải là mảng hoặc mảng rỗng
    if (!value) {
      throw new ConflictException({
        validators: {
          file: 'Trường này không được để trống.',
        },
      });
    } else {
      if (value?.size > MAX_SIZE) {
        throw new BadRequestException(
          `File size is too large. Max size is ${max_mb}MB.`,
        );
      }
      const fileExtension = path
        .extname(value?.originalname || '')
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

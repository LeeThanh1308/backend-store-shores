import * as fs from 'fs';

import { BadRequestException, Injectable } from '@nestjs/common';
import { extname, join } from 'path';

import { generateMessage } from 'src/common/messages/index.messages';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private uploadPath = './uploads';
  private maxFileSize =
    Number(process.env.MAX_SIZE_FILE_UPLOAD_MB) * 1024 * 1024; // Giới hạn 5MB
  private allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.avif',
  ];
  constructor() {
    // Kiểm tra nếu thư mục uploads chưa tồn tại thì tạo mới
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File không tồn tại!');
    }
    const fileExt = extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(fileExt)) {
      throw new BadRequestException(
        'Chỉ hỗ trợ các định dạng: JPG, PNG, GIF, WEBP',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File vượt quá giới hạn 5MB!');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folderName: string,
  ): Promise<{ filePath: string }> {
    this.validateFile(file); // 🔍 Kiểm tra file trước khi lưu

    return new Promise((resolve, reject) => {
      const folderPath = `${this.uploadPath}/${folderName}`;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const uniqueSuffix = uuidv4() + '-' + Date.now();
      const fileName = uniqueSuffix + extname(file?.originalname);
      const filePath = `${folderPath}/${fileName}`;
      fs.writeFile(filePath, file?.buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ filePath: `${folderName}/${fileName}` });
        }
      });
    });
  }

  async uploadFiles(files: Express.Multer.File[], folderName: string) {
    return await Promise.all(
      files.map(async (file) => {
        const result = await this.uploadFile(file, folderName);
        return result.filePath;
      }),
    );
  }

  async deleteFile(
    filePath: string,
  ): Promise<{ message: string; error?: any; status: boolean }> {
    const folderPath = `${this.uploadPath}/${filePath}`;
    return new Promise((resolve, reject) => {
      if (fs.existsSync(folderPath)) {
        fs.unlink(folderPath, (err) => {
          if (err) {
            resolve({
              message: 'Xóa file thất bại!',
              error: err,
              status: false,
            });
          } else {
            resolve({ message: 'File đã được xóa thành công!', status: true });
          }
        });
      } else {
        resolve({
          message: 'File không tồn tại.',
          error: folderPath,
          status: false,
        });
      }
    });
  }

  async deleteFiles(
    filePath: string[],
  ): Promise<{ message: string; affected: number }> {
    let totalRemove = 0;
    await Promise.all(
      filePath.map(async (path) => {
        const result = await this.deleteFile(path);
        if (result?.status) {
          totalRemove++;
          return result;
        }
      }),
    );
    return {
      ...generateMessage('File', 'deleted', !!totalRemove),
      affected: totalRemove,
    };
  }
}

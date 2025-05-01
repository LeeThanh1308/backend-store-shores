import {
  Controller,
  Get,
  NotFoundException,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('cdn')
  getFile(@Query('name') name: string, @Res() res: Response) {
    try {
      const filePath = path.resolve('./uploads', name);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      return res.sendFile(filePath);
    } catch (error) {
      return error;
    }
  }

  @Patch()
  async deleteFile(@Query('path') path: string) {
    return await this.filesService.deleteFile(path);
  }
}

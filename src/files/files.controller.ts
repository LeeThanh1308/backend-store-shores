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

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('cdn')
  getFile(@Query('name') name: string, @Res() res: Response) {
    try {
      res.sendFile(name, { root: './uploads' }, (err) => {
        if (err) {
          return res.status(404).json({
            message: 'File not found',
            status: 404,
          });
        }
      });
    } catch (error) {
      throw new NotFoundException({
        message: 'File not found',
      });
    }
  }

  @Patch()
  async deleteFile(@Query('path') path: string) {
    return await this.filesService.deleteFile(path);
  }
}

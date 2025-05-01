import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Slider } from './entities/slider.entity';
import { In, Like, Repository } from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';
import { convertTextToLike } from 'utils';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class SlidersService {
  private readonly nameMessage = 'Slider';
  constructor(
    @InjectRepository(Slider)
    private readonly sliderRepository: Repository<Slider>,
    private readonly filesService: FilesService,
  ) {}
  async create(createSliderDto: CreateSliderDto, image: Express.Multer.File) {
    let pathFile: any;
    try {
      const createSlider = this.sliderRepository.create({
        ...createSliderDto,
      });
      const result = await this.sliderRepository.save(createSlider);
      if (result.id && image) {
        pathFile = await this.filesService.uploadFile(image, 'siders');
        const updateResult = await this.sliderRepository.update(
          { id: result.id },
          { src: pathFile.filePath },
        );

        return {
          ...generateMessage(
            this.nameMessage,
            'created',
            !!updateResult.affected,
          ),
          data: updateResult,
        };
      }
      return {
        ...generateMessage(this.nameMessage, 'created', !!result.id),
        data: result,
      };
    } catch (error) {
      await this.filesService.deleteFile(pathFile);
      throw error;
    }
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.sliderRepository.find({
      where: [
        {
          name: keywordToLike,
        },
      ],
      take: 10,
    });
  }

  async findAll() {
    return await this.sliderRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.sliderRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException({
        message: `Màu sản phẩm với ID ${id} không tồn tại`,
      });
    }
  }

  async update(
    id: number,
    updateSliderDto: UpdateSliderDto,
    file: Express.Multer.File,
  ) {
    try {
      const findCateExists = await this.sliderRepository.findOne({
        where: { id },
      });

      if (!findCateExists)
        throw new NotFoundException(`Category with ID ${id} not found`);

      if (file) {
        if (findCateExists.src) {
          await this.filesService.deleteFile(findCateExists.src);
        }
        const pathFile = await this.filesService.uploadFile(file, 'sliders');
        updateSliderDto.src = pathFile.filePath;
      }

      // Cập nhật dữ liệu
      Object.assign(findCateExists, updateSliderDto);

      await this.sliderRepository.save(findCateExists);

      return generateMessage(this.nameMessage, 'updated', true);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async removeOne(id: number) {
    const findTarget = await this.sliderRepository.findOne({
      where: {
        id,
      },
      select: ['id'],
    });
    if (!findTarget?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.sliderRepository.delete({
      id: findTarget?.id,
    });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findTarget = await this.sliderRepository.findBy({
        id: In(ids),
      });
      if (!findTarget.length) return;
      const result = await this.sliderRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }
}

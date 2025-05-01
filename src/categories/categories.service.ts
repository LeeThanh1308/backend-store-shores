import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import {
  DataSource,
  In,
  IsNull,
  Like,
  Not,
  Repository,
  TreeRepository,
} from 'typeorm';
import { FilesService } from 'src/files/files.service';
import { convertTextToLike } from 'utils';
import { generateMessage } from 'src/common/messages/index.messages';

@Injectable()
export class CategoriesService {
  private readonly nameMessage = 'Danh mục';
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: TreeRepository<Category>,
    private readonly filesService: FilesService,
    private readonly dataSource: DataSource,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    icon: Express.Multer.File,
  ) {
    const createCategory = new Category();
    createCategory.name = createCategoryDto.name;
    createCategory.slug = createCategoryDto.slug;
    const resultParent = await this.categoryRepository.findOne({
      where: {
        id: createCategoryDto.parentId,
      },
    });
    if (createCategoryDto.parentId && resultParent) {
      createCategory.parent = resultParent;
      createCategory.level = resultParent.level + 1;
    }
    const result = await this.categoryRepository.save(createCategory);
    if (result.id && icon) {
      const pathFile = await this.filesService.uploadFile(icon, 'products');
      const updateResult = await this.categoryRepository.update(
        { id: result.id },
        { icon: pathFile.filePath },
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
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.categoryRepository.find({
      where: [
        {
          name: keywordToLike,
          isActive: true,
        },
        {
          slug: keywordToLike,
          isActive: true,
        },
      ],
    });
  }

  async getTreeDepth(): Promise<{
    data: CreateCategoryDto[];
    depth: number;
    length: any;
  }> {
    const totalCate = await this.categoryRepository.count();
    const categories = await this.categoryRepository.findTrees();

    const getMaxDepth = (nodes: Category[], depth = 0): number => {
      return nodes.length === 0
        ? depth
        : Math.max(
            ...nodes.map((node) => getMaxDepth(node.children, depth + 1)),
          );
    };

    const removeEmptyChildren = (nodes: Category[]): any[] => {
      return nodes.map((node) => {
        if (node.children.length === 0) {
          const { children, ...rest } = node;
          return rest; // Trả về object mà không có key `children`
        }
        return { ...node, children: removeEmptyChildren(node.children) };
      });
    };
    return {
      data: removeEmptyChildren(categories),
      depth: getMaxDepth(categories),
      length: totalCate,
    };
  }

  async getCategoryDepth(categoryId: number): Promise<number> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['parent'],
    });

    let depth = 0;
    let current = category;

    while (current?.parent) {
      depth++;
      current = current.parent;
    }

    return depth;
  }

  async findAll() {
    return await this.getTreeDepth();
    return await this.categoryRepository.findTrees();
  }

  async findOne({ id, parent }) {
    if (parent) {
      return await this.categoryRepository.findOne({
        where: { id: parent },
        relations: ['parent'],
      });
    }
    return `This action returns a #${id} category`;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    try {
      const findCateExists = await this.categoryRepository.findOne({
        where: { id },
      });

      if (!findCateExists)
        throw new NotFoundException(`Category with ID ${id} not found`);

      if (updateCategoryDto.parentId && updateCategoryDto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      let parentCategory: Category | null = null;
      if (updateCategoryDto.parentId) {
        parentCategory = await this.categoryRepository.findOne({
          where: { id: updateCategoryDto.parentId },
        });

        if (!parentCategory) {
          throw new NotFoundException(
            `Parent category with ID ${updateCategoryDto.parentId} not found`,
          );
        }
      }

      if (file) {
        if (findCateExists.icon) {
          await this.filesService.deleteFile(findCateExists.icon);
        }
        const pathFile = await this.filesService.uploadFile(file, 'products');
        updateCategoryDto.icon = pathFile.filePath;
      }

      // Cập nhật dữ liệu
      Object.assign(findCateExists, updateCategoryDto);
      if (parentCategory) {
        findCateExists.parent = parentCategory;
        findCateExists.level = parentCategory.level + 1;
      }

      await this.categoryRepository.save(findCateExists);

      return generateMessage(this.nameMessage, 'updated', true);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async removeOne(id: number) {
    const findCate = await this.categoryRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'name', 'icon'],
    });
    if (!findCate?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    if (findCate.icon) {
      await this.filesService.deleteFile(findCate.icon);
    }
    const result = await this.categoryRepository.delete({ id: findCate?.id });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findCate = await this.categoryRepository.findBy({ id: In(ids) });
      if (!findCate.length) return;
      await Promise.all(
        findCate.map(async (it) => {
          if (it.icon) {
            return await this.filesService.deleteFile(it.icon);
          }
          return;
        }),
      );
      const result = await this.categoryRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }

  async handleCountTotalCategories() {
    return await this.categoryRepository.count();
  }
}

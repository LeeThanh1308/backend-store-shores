import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { In, Like, Repository } from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';
import { convertTextToLike } from 'utils';
import { Accounts } from 'src/accounts/entities/account.entity';

@Injectable()
export class BlogsService {
  private readonly nameMessage = 'Blog';
  constructor(
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
  ) {}
  async create(createBlogDto: CreateBlogDto, user: Accounts) {
    try {
      const createColor = await this.blogRepository.create(createBlogDto);
      const result = await this.blogRepository.save({
        ...createColor,
        account: user,
      });

      return {
        ...generateMessage(this.nameMessage, 'created', !!result?.id),
        data: result,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async handleGetMePosts(user: Partial<Accounts>) {
    return await this.blogRepository.find({
      where: {
        account: {
          id: user.id,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
  async handleUpdateMePosts(
    user: Partial<Accounts>,
    blogID: number,
    updateBlogDto: UpdateBlogDto,
  ) {
    try {
      const findBlog = await this.blogRepository.findOne({
        where: {
          id: blogID,
          account: {
            id: user.id,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });
      if (!findBlog) {
        throw new NotFoundException({
          message: 'Bài viết không tồn tại.',
        });
      }
      Object.assign(findBlog, updateBlogDto);
      const result = await this.blogRepository.save(findBlog);
      return {
        ...generateMessage(this.nameMessage, 'updated', !!result?.id),
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async handleDeleteMePosts(user: Partial<Accounts>, blogID: number) {
    try {
      const findBlog = await this.blogRepository.findOne({
        where: {
          id: blogID,
          account: {
            id: user.id,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });
      if (!findBlog) {
        throw new NotFoundException({
          message: 'Bài viết không tồn tại.',
        });
      }
      await this.blogRepository.remove(findBlog);
      return generateMessage(this.nameMessage, 'deleted', true);
    } catch (error) {
      throw error;
    }
  }

  async handleGetListBlogs(
    user: Accounts,
    page: number = 1,
    limit: number = 10,
  ) {
    const subQuery = this.blogRepository
      .createQueryBuilder('blog')
      .select([
        'blog.id as id',
        'blog.title as title',
        'blog.slug as slug',
        'blog.createdAt as createdAt',
      ])
      .orderBy('blog.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const data = await this.blogRepository
      .createQueryBuilder('blog')
      .innerJoin(`(${subQuery.getQuery()})`, 'paged', 'paged.id = blog.id')
      .leftJoin('blog.likes', 'likes')
      .leftJoin('likes.account', 'likedByUser', 'likedByUser.id = :accountId', {
        accountId: user?.id,
      })
      .leftJoin('blog.account', 'account')
      .select([
        'blog.id as id',
        'blog.title as title',
        'blog.slug as slug',
        'blog.createdAt as createdAt',
        'account.fullname as fullname',
        'account.avatar as avatar',
      ])
      .addSelect('COUNT(DISTINCT likes.id)', 'countLike')
      .addSelect(
        'CASE WHEN COUNT(DISTINCT likedByUser.id) > 0 THEN true ELSE false END',
        'isLike',
      )
      .groupBy('blog.id')
      .addGroupBy('blog.title')
      .addGroupBy('blog.slug')
      .addGroupBy('blog.createdAt')
      .addGroupBy('account.fullname')
      .addGroupBy('account.avatar')
      .orderBy('blog.createdAt', 'DESC')
      .setParameters(subQuery.getParameters()) // rất quan trọng nếu có parameter
      .getRawMany();
    return {
      data,
      limit,
      page,
      totalPage: Math.ceil((await this.blogRepository.count()) / limit),
    };
  }

  async findAll() {
    return await this.blogRepository.find({
      relations: {
        account: {
          roles: true,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        account: {
          fullname: true,
          avatar: true,
          roles: {
            description: true,
          },
        },
      },
    });
  }

  async handleGetDetailBlog(id: number, user: Accounts) {
    const blogs = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoin('blog.likes', 'likes')
      .leftJoin('likes.account', 'likedByUser', 'likedByUser.id = :accountId', {
        accountId: user?.id,
      })
      .leftJoin('blog.account', 'account')
      .select([
        'blog.id as id',
        'blog.title as title',
        'blog.slug as slug',
        'blog.description as description',
        'blog.createdAt as createdAt',
        'account.fullname as fullname',
        'account.avatar as avatar',
      ])
      .addSelect('COUNT(DISTINCT likes.id)', 'countLike')
      .addSelect(
        'CASE WHEN COUNT(DISTINCT likedByUser.id) > 0 THEN true ELSE false END',
        'isLike',
      )
      .where('blog.id = :id', { id })
      .groupBy('blog.id')
      .getRawOne();

    return blogs;
  }

  async findOne(id: number) {
    try {
      return await this.blogRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException({
        message: `Màu sản phẩm với ID ${id} không tồn tại`,
      });
    }
  }

  async findSizesAndProduct(search: string = '', productID: number) {
    try {
      const searchToLike = Like(convertTextToLike(search));
      const whereProduct: any[] = [];
      if (Number(search)) {
        whereProduct.push({ id: +search });
      }
      return await this.blogRepository.find({
        where: [
          {
            slug: searchToLike,
          },
          {
            title: searchToLike,
          },
        ],
        take: 10,
      });
    } catch (error) {
      throw new NotFoundException({
        message: `Không tìm thấy size ${search}`,
      });
    }
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.blogRepository.find({
      where: [
        {
          slug: keywordToLike,
        },
      ],
      take: 10,
    });
  }

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    try {
      const findExists = await this.blogRepository.findOneByOrFail({
        id,
      });
      Object.assign(findExists, updateBlogDto);
      const result = await this.blogRepository.save(findExists);
      return {
        ...generateMessage(this.nameMessage, 'updated', !!result?.id),
        data: result,
      };
    } catch (error) {
      throw new NotFoundException({
        message: `Màu sản phẩm với ID ${id} không tồn tại`,
      });
    }
  }

  async removeOne(id: number) {
    const findBrand = await this.blogRepository.findOne({
      where: {
        id,
      },
      select: ['id'],
    });
    if (!findBrand?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.blogRepository.delete({
      id: findBrand?.id,
    });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findBrand = await this.blogRepository.findBy({
        id: In(ids),
      });
      if (!findBrand.length) return;
      const result = await this.blogRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }
}

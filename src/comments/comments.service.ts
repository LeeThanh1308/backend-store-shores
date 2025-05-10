import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Accounts } from 'src/accounts/entities/account.entity';
import { In, Like, Repository } from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';
import { convertTextToLike } from 'utils';

@Injectable()
export class CommentsService {
  private readonly nameMessage = 'Comment';
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}
  async create(createdCommentDto: CreateCommentDto, user: Accounts) {
    try {
      const createComment =
        await this.commentRepository.create(createdCommentDto);
      const result = await this.commentRepository.save({
        ...createComment,
        account: user,
        product: {
          id: createdCommentDto.productID,
        },
        blog: {
          id: createdCommentDto.blogID,
        },
      });

      return {
        ...generateMessage(this.nameMessage, 'created', !!result?.id),
        data: result,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async findAll() {
    return await this.commentRepository.find({
      relations: {
        product: true,
        account: true,
      },
    });
  }

  async findOne(id: number) {
    try {
      return await this.commentRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException({
        message: `Màu sản phẩm với ID ${id} không tồn tại`,
      });
    }
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.commentRepository.find({
      where: [
        {
          content: keywordToLike,
        },
      ],
      take: 10,
    });
  }
  async searchByProductID(productID: number) {
    return await this.commentRepository.find({
      relations: {
        replies: {
          account: true,
          accountReply: true,
        },
        account: true,
      },
      where: {
        product: {
          id: productID,
        },
      },
      select: {
        account: {
          id: true,
          fullname: true,
          avatar: true,
        },
        replies: {
          id: true,
          content: true,
          createdAt: true,
          accountReply: {
            id: true,
            fullname: true,
            avatar: true,
          },
          account: {
            id: true,
            fullname: true,
            avatar: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async searchByBlogID(blogID: number) {
    return await this.commentRepository.find({
      relations: {
        replies: {
          account: true,
          accountReply: true,
        },
        account: true,
      },
      where: {
        blog: {
          id: blogID,
        },
      },
      select: {
        account: {
          id: true,
          fullname: true,
          avatar: true,
        },
        replies: {
          id: true,
          content: true,
          createdAt: true,
          accountReply: {
            id: true,
            fullname: true,
            avatar: true,
          },
          account: {
            id: true,
            fullname: true,
            avatar: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    try {
      const findExists = await this.commentRepository.findOneByOrFail({
        id,
      });
      Object.assign(findExists, updateCommentDto);
      const result = await this.commentRepository.save(findExists);
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
    const findBrand = await this.commentRepository.findOne({
      where: {
        id,
      },
      select: ['id'],
    });
    if (!findBrand?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.commentRepository.delete({
      id: findBrand?.id,
    });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findBrand = await this.commentRepository.findBy({
        id: In(ids),
      });
      if (!findBrand.length) return;
      const result = await this.commentRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }
}

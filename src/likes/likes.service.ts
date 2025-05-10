import { Accounts } from 'src/accounts/entities/account.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { Injectable } from '@nestjs/common';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private readonly likeRepository: Repository<Like>,
  ) {}
  async create(createLikeDto: CreateLikeDto, user: Accounts) {
    try {
      const whereExist: any = {};
      if (createLikeDto.blogID) {
        whereExist.blog = { id: createLikeDto.blogID };
      }
      if (createLikeDto.commentID) {
        whereExist.comment = { id: createLikeDto.commentID };
      }
      if (createLikeDto.replyID) {
        whereExist.reply = { id: createLikeDto.replyID };
      }
      const findExist = await this.likeRepository.findOne({
        where: {
          ...whereExist,
          account: {
            id: user.id,
          },
        },
      });
      if (findExist) {
        findExist.comment = createLikeDto.commentID ? null : findExist.comment;
        findExist.reply = createLikeDto.replyID ? null : findExist.reply;
        findExist.blog = createLikeDto.blogID ? null : findExist.blog;
        return await this.likeRepository.save(findExist);
      } else if (!findExist) {
        const whereConditions: any = {};
        if (createLikeDto.blogID) {
          whereConditions.blog = { id: IsNull() };
        }
        if (createLikeDto.commentID) {
          whereConditions.comment = { id: IsNull() };
        }
        if (createLikeDto.replyID) {
          whereConditions.reply = { id: IsNull() };
        }
        const findLike = await this.likeRepository.findOne({
          where: {
            ...whereConditions,
            account: {
              id: user.id,
            },
          },
        });
        if (findLike) {
          if (createLikeDto.commentID) {
            Object.assign(findLike, {
              comment: { id: createLikeDto.commentID },
            });
          }
          if (createLikeDto.blogID) {
            Object.assign(findLike, { blog: { id: createLikeDto.blogID } });
          }
          if (createLikeDto.replyID) {
            Object.assign(findLike, { reply: { id: createLikeDto.replyID } });
          }
          return await this.likeRepository.save(findLike);
        } else {
          const createLike = await this.likeRepository.create({
            blog: {
              id: createLikeDto.blogID,
            },
            comment: {
              id: createLikeDto.commentID,
            },
            reply: {
              id: createLikeDto.replyID,
            },
            account: user,
          });
          return await this.likeRepository.save(createLike);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async handleCountLikeBlog(blogID: number, user?: Accounts) {
    const countLike = await this.likeRepository.count({
      where: {
        blog: {
          id: blogID,
        },
      },
    });
    if (user) {
      const IsLike = await this.likeRepository.findOne({
        where: {
          blog: {
            id: blogID,
          },
          account: {
            id: user.id,
          },
        },
      });

      return {
        count: countLike,
        isLike: !!IsLike,
      };
    }
    return {
      count: countLike,
    };
  }

  async handleCountLikeComment(commentID: number, user?: Accounts) {
    const countLike = await this.likeRepository.count({
      where: {
        comment: {
          id: commentID,
        },
      },
    });
    if (user) {
      const IsLike = await this.likeRepository.findOne({
        where: {
          comment: {
            id: commentID,
          },
          account: {
            id: user.id,
          },
        },
      });

      return {
        count: countLike,
        isLike: !!IsLike,
      };
    }
    return {
      count: countLike,
    };
  }

  async handleCountLikeReply(replyID: number, user?: Accounts) {
    const countLike = await this.likeRepository.count({
      where: {
        reply: {
          id: replyID,
        },
      },
    });
    if (user) {
      const IsLike = await this.likeRepository.findOne({
        where: {
          reply: {
            id: replyID,
          },
          account: {
            id: user.id,
          },
        },
      });

      return {
        count: countLike,
        isLike: !!IsLike,
      };
    }
    return {
      count: countLike,
    };
  }

  findAll() {
    return `This action returns all likes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} like`;
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`;
  }

  remove(id: number) {
    return `This action removes a #${id} like`;
  }
}

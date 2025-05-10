import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { Accounts } from 'src/accounts/entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Reply } from './entities/reply.entity';
import { DataSource, Repository } from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';

@Injectable()
export class RepliesService {
  private readonly nameMessage = 'reply';
  private readonly accountRepository: Repository<Accounts>;
  constructor(
    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>,
    private readonly dataSource: DataSource,
  ) {
    this.accountRepository = this.dataSource.getRepository(Accounts);
  }
  async create(createReplyDto: CreateReplyDto, user: Accounts) {
    try {
      // const findAccount = await this.accountRepository.findOne({
      //   where: {
      //     id: createReplyDto.accountReplyID
      //   }
      // })
      const createComment = this.replyRepository.create(createReplyDto);
      const result = await this.replyRepository.save({
        ...createComment,
        account: user,
        accountReply: {
          id: createReplyDto.accountReplyID,
        },
        comment: {
          id: createReplyDto.commentID,
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

  findAll() {
    return `This action returns all replies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reply`;
  }

  update(id: number, updateReplyDto: UpdateReplyDto) {
    return `This action updates a #${id} reply`;
  }

  remove(id: number) {
    return `This action removes a #${id} reply`;
  }
}

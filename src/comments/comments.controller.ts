import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ConflictException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createProductSizeDto: CreateCommentDto,
  ) {
    const user = req.user;
    return await this.commentsService.create(createProductSizeDto, user);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('productID') productID: string,
    @Query('blogID') blogID: string,
  ) {
    if (search) return await this.commentsService.searchByKeyword(search);
    if (productID)
      return await this.commentsService.searchByProductID(+productID);
    if (blogID) return await this.commentsService.searchByBlogID(+blogID);
    return await this.commentsService.findAll();
  }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commentsService.update(+id, updateCommentDto);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.commentsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.commentsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}

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
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { AuthOptionalGuard } from 'src/guards/auth-optional.guard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    const user = req.user;
    return await this.likesService.create(createLikeDto, user);
  }

  @Get('count')
  @UseGuards(AuthOptionalGuard)
  async findCountLikeAuthAndOptions(
    @Req() req: RequestWithUser,
    @Query('blogID') blogID: string,
    @Query('commentID') commentID: string,
    @Query('replyID') replyID: string,
  ) {
    const user = req.user;
    if (blogID)
      return await this.likesService.handleCountLikeBlog(+blogID, user);
    if (commentID)
      return await this.likesService.handleCountLikeComment(+commentID, user);
    if (replyID)
      return await this.likesService.handleCountLikeReply(+replyID, user);
    return this.likesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.likesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
    return this.likesService.update(+id, updateLikeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.likesService.remove(+id);
  }
}

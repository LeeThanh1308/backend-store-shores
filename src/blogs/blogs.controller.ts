import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ConflictException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserRoles } from 'src/guards/roles.decorator';
import { EnumRoles } from 'src/guards/user-role.enum';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { AuthOptionalGuard } from 'src/guards/auth-optional.guard';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createProductSizeDto: CreateBlogDto,
  ) {
    const user = req.user;
    return await this.blogsService.create(createProductSizeDto, user);
  }

  @Get('me/posts')
  @UseGuards(AuthGuard)
  async onGetMePosts(@Req() req: RequestWithUser) {
    const user = req.user;
    return await this.blogsService.handleGetMePosts(user);
  }

  @Patch('me/posts/:id')
  @UseGuards(AuthGuard)
  async onPatchMePosts(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const user = req.user;
    return await this.blogsService.handleUpdateMePosts(
      user,
      +id,
      updateBlogDto,
    );
  }
  @Delete('me/posts/:id')
  @UseGuards(AuthGuard)
  async onDeleteMePosts(@Req() req: RequestWithUser, @Param('id') id: string) {
    const user = req.user;
    return await this.blogsService.handleDeleteMePosts(user, +id);
  }

  @Get('list-blogs')
  @UseGuards(AuthOptionalGuard)
  async onGetListBlogs(
    @Req() req: RequestWithUser,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const user = req?.user;
    return await this.blogsService.handleGetListBlogs(
      user,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }
  @Get('list-blogs/:slug')
  @UseGuards(AuthOptionalGuard)
  async onGetDetailBlog(
    @Req() req: RequestWithUser,
    @Param('slug') slug: string,
  ) {
    const user = req?.user;
    const slugToArray = slug?.split('-') ?? [];
    return await this.blogsService.handleGetDetailBlog(
      +slugToArray?.[slugToArray.length - 1],
      user,
    );
  }

  @Get()
  async findAll(@Query('search') search: string) {
    if (search) return await this.blogsService.searchByKeyword(search);
    return await this.blogsService.findAll();
  }
  @Patch(':id')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.MANAGER])
  async update(
    @Param('id') id: string,
    @Body() updateProductSizeDto: UpdateBlogDto,
  ) {
    return await this.blogsService.update(+id, updateProductSizeDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.MANAGER])
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.blogsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.blogsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}

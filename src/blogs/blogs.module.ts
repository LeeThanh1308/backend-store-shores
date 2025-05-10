import { Blog } from './entities/blog.entity';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), JwtModule],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}

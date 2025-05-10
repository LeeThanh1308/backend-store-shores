import { JwtModule } from '@nestjs/jwt';
import { Like } from './entities/like.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), JwtModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}

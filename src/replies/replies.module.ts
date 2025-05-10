import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';
import { Reply } from './entities/reply.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Reply]), JwtModule],
  controllers: [RepliesController],
  providers: [RepliesService],
})
export class RepliesModule {}

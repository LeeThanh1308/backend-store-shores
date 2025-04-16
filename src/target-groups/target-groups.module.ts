import { Module } from '@nestjs/common';
import { TargetGroupsService } from './target-groups.service';
import { TargetGroupsController } from './target-groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetGroup } from './entities/target-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TargetGroup])],
  controllers: [TargetGroupsController],
  providers: [TargetGroupsService],
})
export class TargetGroupsModule {}

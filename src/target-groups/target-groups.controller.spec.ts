import { Test, TestingModule } from '@nestjs/testing';
import { TargetGroupsController } from './target-groups.controller';
import { TargetGroupsService } from './target-groups.service';

describe('TargetGroupsController', () => {
  let controller: TargetGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TargetGroupsController],
      providers: [TargetGroupsService],
    }).compile();

    controller = module.get<TargetGroupsController>(TargetGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

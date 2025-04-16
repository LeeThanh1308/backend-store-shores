import { Test, TestingModule } from '@nestjs/testing';
import { TargetGroupsService } from './target-groups.service';

describe('TargetGroupsService', () => {
  let service: TargetGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TargetGroupsService],
    }).compile();

    service = module.get<TargetGroupsService>(TargetGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

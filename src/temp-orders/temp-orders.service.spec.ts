import { Test, TestingModule } from '@nestjs/testing';
import { TempOrdersService } from './temp-orders.service';

describe('TempOrdersService', () => {
  let service: TempOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TempOrdersService],
    }).compile();

    service = module.get<TempOrdersService>(TempOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

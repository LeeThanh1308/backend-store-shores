import { Test, TestingModule } from '@nestjs/testing';
import { DataVerifyService } from './data_verify.service';

describe('DataVerifyService', () => {
  let service: DataVerifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataVerifyService],
    }).compile();

    service = module.get<DataVerifyService>(DataVerifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DataVerifyController } from './data_verify.controller';
import { DataVerifyService } from './data_verify.service';

describe('DataVerifyController', () => {
  let controller: DataVerifyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataVerifyController],
      providers: [DataVerifyService],
    }).compile();

    controller = module.get<DataVerifyController>(DataVerifyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

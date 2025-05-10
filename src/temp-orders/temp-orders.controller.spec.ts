import { Test, TestingModule } from '@nestjs/testing';
import { TempOrdersController } from './temp-orders.controller';
import { TempOrdersService } from './temp-orders.service';

describe('TempOrdersController', () => {
  let controller: TempOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TempOrdersController],
      providers: [TempOrdersService],
    }).compile();

    controller = module.get<TempOrdersController>(TempOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

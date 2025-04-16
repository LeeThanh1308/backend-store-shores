import { Test, TestingModule } from '@nestjs/testing';
import { ProductBrandsController } from './product-brands.controller';
import { ProductBrandsService } from './product-brands.service';

describe('ProductBrandsController', () => {
  let controller: ProductBrandsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductBrandsController],
      providers: [ProductBrandsService],
    }).compile();

    controller = module.get<ProductBrandsController>(ProductBrandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

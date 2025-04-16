import { Test, TestingModule } from '@nestjs/testing';
import { ProductBrandsService } from './product-brands.service';

describe('ProductBrandsService', () => {
  let service: ProductBrandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductBrandsService],
    }).compile();

    service = module.get<ProductBrandsService>(ProductBrandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

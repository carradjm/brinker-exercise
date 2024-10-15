import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a product', async () => {
    const createProductDto = { name: 'Test Product', price: 10 };
    const savedProduct = { id: 1, ...createProductDto };

    mockProductRepository.create.mockReturnValue(savedProduct);
    mockProductRepository.save.mockResolvedValue(savedProduct);

    const result = await service.create(createProductDto);

    expect(mockProductRepository.create).toHaveBeenCalledWith(createProductDto);
    expect(mockProductRepository.save).toHaveBeenCalledWith(savedProduct);
    expect(result).toEqual(savedProduct);
  });

  it('should return an array of products', async () => {
    const products = [{ id: 1, name: 'Product 1', price: 10 }];
    mockProductRepository.find.mockResolvedValue(products);

    const result = await service.findAll();

    expect(mockProductRepository.find).toHaveBeenCalled();
    expect(result).toEqual(products);
  });

  // Add more tests for findOne, update, remove methods
});

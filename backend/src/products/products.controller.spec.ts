import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a product', async () => {
    const createProductDto = { name: 'Test Product', price: 10 };
    const resultProduct = { id: 1, ...createProductDto };

    mockProductsService.create.mockResolvedValue(resultProduct);

    const result = await controller.create(createProductDto);

    expect(service.create).toHaveBeenCalledWith(createProductDto);
    expect(result).toEqual(resultProduct);
  });

  it('should get all products', async () => {
    const products = [{ id: 1, name: 'Product 1', price: 10 }];
    mockProductsService.findAll.mockResolvedValue(products);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(products);
  });

  // Add more tests for findOne, update, remove methods
});

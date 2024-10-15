import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const username = 'john';
      const password = 'changeme';
      const hashedPassword = 'hashedpassword';

      // Mock bcrypt.hash
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockUserRepository.create.mockReturnValue({ username, password: hashedPassword });
      mockUserRepository.save.mockResolvedValue({ id: 1, username });

      const result = await service.create(username, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username } });
      expect(mockUserRepository.create).toHaveBeenCalledWith({ username, password: hashedPassword });
      expect(mockUserRepository.save).toHaveBeenCalledWith({ username, password: hashedPassword });
      expect(result).toEqual({ id: 1, username });
    });
  });
});

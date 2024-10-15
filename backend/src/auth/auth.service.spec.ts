// auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

const bcryptMocked = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return null if user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(undefined);

      const result = await service.validateUser('nonexistent', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const username = 'john';
      const password = 'wrongpassword';
      const hashedPassword = 'hashedpassword';
      const user = { id: 1, username, password: hashedPassword };

      mockUsersService.findOne.mockResolvedValue(user);

      const result = await service.validateUser(username, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { id: 1, username: 'john' };
      const token = 'jwt-token';

      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({ username: user.username, sub: user.id });
      expect(result).toEqual({ access_token: token });
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const username = 'john';
      const password = 'changeme';
      const newUser = { id: 1, username };

      mockUsersService.create.mockResolvedValue(newUser);

      const result = await service.register(username, password);

      expect(mockUsersService.create).toHaveBeenCalledWith(username, password);
      expect(result).toEqual(newUser);
    });
  });
});

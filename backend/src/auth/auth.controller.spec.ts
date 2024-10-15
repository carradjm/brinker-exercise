// auth.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const username = 'john';
      const password = 'changeme';
      const user = { id: 1, username };

      mockAuthService.register.mockResolvedValue(user);

      const result = await controller.register({ username, password });

      expect(service.register).toHaveBeenCalledWith(username, password);
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should return access token if credentials are valid', async () => {
      const username = 'john';
      const password = 'changeme';
      const user = { id: 1, username };
      const token = { access_token: 'jwt-token' };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(token);

      const result = await controller.login({ username, password });

      expect(service.validateUser).toHaveBeenCalledWith(username, password);
      expect(service.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(token);
    });

    it('should return message if credentials are invalid', async () => {
      const username = 'john';
      const password = 'wrongpassword';

      mockAuthService.validateUser.mockResolvedValue(null);

      const result = await controller.login({ username, password });

      expect(service.validateUser).toHaveBeenCalledWith(username, password);
      expect(result).toEqual({ message: 'Invalid credentials' });
    });
  });
});

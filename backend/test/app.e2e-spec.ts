import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Configure TypeORM for testing
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Product], // Explicitly list your entities
          synchronize: true,
          dropSchema: true, // Drops schema between tests to ensure isolation
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    accessToken = null; // Reset access token between tests
  });

  async function getAccessToken() {
    const username = `user_${Date.now()}`;
    const password = 'password123';

    // Register the user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password })
      .expect(201);

    // Login to get the token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password })
      .expect(201);

    return loginResponse.body.access_token;
  }

  describe('Authentication', () => {
    it('/auth/register (POST)', () => {
      const username = `user_${Date.now()}`;
      const password = 'password123';

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username, password })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('username', username);
        });
    });

    it('/auth/login (POST)', async () => {
      const username = `user_${Date.now()}`;
      const password = 'password123';

      // Register the user first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username, password })
        .expect(201);

      // Login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username, password })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('access_token');
          accessToken = response.body.access_token; // Save token for later tests
        });
    });
  });

  describe('Products', () => {
    it('/products (GET) - should return empty array initially', async () => {
      // Obtain a valid access token
      accessToken = await getAccessToken();

      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect([]);
    });

    it('/products (POST) - should create a product', async () => {
      const productData = { name: 'Test Product', price: 99.99 };

      // Obtain a valid access token
      accessToken = await getAccessToken();

      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(productData)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('name', productData.name);
          expect(response.body).toHaveProperty('price', productData.price);
        });
    });

    it('/products (GET) - should return array with created product', async () => {
      // Obtain a valid access token
      accessToken = await getAccessToken();

      // Create a product first
      const productData = { name: 'Test Product', price: 99.99 };

      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(productData)
        .expect(201);

      // Get products with authentication
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(2);
          expect(response.body[0]).toHaveProperty('name', productData.name);
          expect(response.body[0]).toHaveProperty('price', productData.price);

        });
    });
  });
});

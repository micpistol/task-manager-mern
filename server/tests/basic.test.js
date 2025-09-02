const request = require('supertest');
const app = require('../server');

// Wait for MongoDB connection before running tests
beforeAll(async () => {
  // Wait a bit for the connection to establish
  await new Promise(resolve => setTimeout(resolve, 2000));
});

describe('API Health Check', () => {
  test('GET /api/health should return 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Task Manager API is running');
  });
});

describe('Authentication', () => {
  test('POST /api/auth/register should return 400 for invalid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'a', // too short
        email: 'invalid-email',
        password: '123' // too short
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  test('POST /api/auth/register should return 201 for valid data', async () => {
    const testUser = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });
});

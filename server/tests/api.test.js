const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');

// Test database connection
const TEST_MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager-test';

describe('Task Manager API', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Task.deleteMany({});
  });

  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task Manager API is running');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/register should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('POST /api/auth/login should authenticate user', async () => {
      // First create a user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app).post('/api/auth/register').send(userData);

      // Then login
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
    });

    test('POST /api/auth/login should reject invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('Tasks', () => {
    beforeEach(async () => {
      // Create a test user and get auth token
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.token;
      testUser = registerResponse.body.user;
    });

    test('GET /api/tasks should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    test('POST /api/tasks should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        category: 'personal',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.description).toBe(taskData.description);
      expect(response.body.task.category).toBe(taskData.category);
      expect(response.body.task.priority).toBe(taskData.priority);
      expect(response.body.task.completed).toBe(false);
      expect(response.body.task.user).toBe(testUser.id);
    });

    test('GET /api/tasks should return user tasks after creation', async () => {
      // Create a task first
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        category: 'personal',
        priority: 'medium'
      };

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      // Then fetch tasks
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe(taskData.title);
      expect(response.body.count).toBe(1);
    });

    test('PUT /api/tasks/:id should update a task', async () => {
      // Create a task first
      const taskData = {
        title: 'Original Task',
        description: 'Original description',
        category: 'personal',
        priority: 'low'
      };

      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      const taskId = createResponse.body.task._id;

      // Update the task
      const updateData = {
        title: 'Updated Task',
        description: 'Updated description',
        priority: 'high',
        completed: true
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.task.title).toBe(updateData.title);
      expect(response.body.task.description).toBe(updateData.description);
      expect(response.body.task.priority).toBe(updateData.priority);
      expect(response.body.task.completed).toBe(updateData.completed);
    });

    test('DELETE /api/tasks/:id should delete a task', async () => {
      // Create a task first
      const taskData = {
        title: 'Task to Delete',
        description: 'This task will be deleted',
        category: 'personal',
        priority: 'medium'
      };

      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      const taskId = createResponse.body.task._id;

      // Delete the task
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task is deleted
      const getResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body.tasks).toHaveLength(0);
      expect(getResponse.body.count).toBe(0);
    });

    test('PATCH /api/tasks/:id/toggle should toggle task completion', async () => {
      // Create a task first
      const taskData = {
        title: 'Task to Toggle',
        description: 'This task will be toggled',
        category: 'personal',
        priority: 'medium'
      };

      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      const taskId = createResponse.body.task._id;

      // Toggle completion
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.task.completed).toBe(true);
      expect(response.body.message).toContain('completed successfully');

      // Toggle again
      const response2 = await request(app)
        .patch(`/api/tasks/${taskId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response2.status).toBe(200);
      expect(response2.body.task.completed).toBe(false);
      expect(response2.body.message).toContain('uncompleted successfully');
    });

    test('GET /api/tasks should require authentication', async () => {
      const response = await request(app).get('/api/tasks');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });
});

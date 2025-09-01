const express = require('express');
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all task routes
router.use(auth);

// Get all tasks for current user
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const tasks = await db.collection('tasks')
      .find({ user: new ObjectId(req.user.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// Get single task by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(req.params.id),
      user: new ObjectId(req.user.userId)
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    res.status(500).json({ message: 'Server error while fetching task' });
  }
});

// Create new task
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Task title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Task description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['work', 'personal', 'shopping', 'health', 'education', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, category, priority, dueDate } = req.body;
    const db = req.app.locals.db;

    const newTask = {
      title,
      description,
      category,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      user: new ObjectId(req.user.userId),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('tasks').insertOne(newTask);
    const task = { ...newTask, _id: result.insertedId };

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// Update task
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Task title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Task description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['work', 'personal', 'shopping', 'health', 'education', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const db = req.app.locals.db;
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(req.params.id),
      user: new ObjectId(req.user.userId)
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields
    const updateFields = ['title', 'description', 'category', 'priority', 'completed'];
    const updateData = { updatedAt: new Date() };
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle dueDate separately
    if (req.body.dueDate !== undefined) {
      updateData.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }

    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get updated task
    const updatedTask = await db.collection('tasks').findOne({
      _id: new ObjectId(req.params.id)
    });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.collection('tasks').deleteOne({
      _id: new ObjectId(req.params.id),
      user: new ObjectId(req.user.userId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

// Toggle task completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(req.params.id),
      user: new ObjectId(req.user.userId)
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const newCompletedStatus = !task.completed;
    
    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          completed: newCompletedStatus,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get updated task
    const updatedTask = await db.collection('tasks').findOne({
      _id: new ObjectId(req.params.id)
    });

    res.json({
      message: `Task ${newCompletedStatus ? 'completed' : 'uncompleted'} successfully`,
      task: updatedTask
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    res.status(500).json({ message: 'Server error while toggling task' });
  }
});

module.exports = router;

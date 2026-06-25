const express = require('express');
const { createUser, loginUser, getAdminMetrics, getAllUsers } = require('../controllers/userController');
const { isAdminMiddleware } = require('../middleware/isAdmin');

const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.post('/login', loginUser);
userRouter.get('/admin/metrics', isAdminMiddleware, getAdminMetrics);
userRouter.get('/admin/users', isAdminMiddleware, getAllUsers);

module.exports = userRouter;

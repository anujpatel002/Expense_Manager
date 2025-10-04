const express = require('express');
const { getMe, createUser, getUsers, createUserValidation } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, getMe);
router.post('/', authMiddleware, adminMiddleware, createUserValidation, createUser);
router.get('/', authMiddleware, adminMiddleware, getUsers);

module.exports = router;
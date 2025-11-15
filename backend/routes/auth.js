import express from 'express';
import { register, login, logout, testDB } from '../controllers/auth.js';

const router = express.Router();

router.get('/test-db', testDB);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

export default router;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import systemAdminRoutes from './routes/systemAdmin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/system-admin', systemAdminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'admin-backend' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin Backend running on port ${PORT}`);
});

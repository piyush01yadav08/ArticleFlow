import './config/env.js';
import cors from 'cors';
import express from 'express';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/comments', commentRoutes);
app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ message: 'Something went wrong. Please try again.' }); });

const port = process.env.PORT || 5000;
connectDatabase().then(() => app.listen(port, () => console.log(`ArticleFlow API is running on port ${port}`))).catch((error) => { console.error(`Could not start server: ${error.message}`); process.exit(1); });
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { router } from './api/routes/index';
import { initializeSocket } from './socket';
import { logger } from './utils/logger';
import { requestLogger, errorLogger } from './api/middleware/logging';

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(requestLogger);

// API Routes
app.use('/api', router);

// Error logging middleware (must be after routes)
app.use(errorLogger);

// Initialize Socket.io
const socketManager = initializeSocket(httpServer);






const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
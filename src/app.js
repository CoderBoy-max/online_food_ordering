import express from 'express';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(express.json());

import authRoutes from './routes/auth.routes.js';
app.use('/api/v1/auth', authRoutes);

// app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);
app.use(express.json())

export default app;
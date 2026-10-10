import express from 'express';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(express.json());

// app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes'; 
import calendarRoutes from './routes/calender.routes'; // Adjust the import path as necessary
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes)

// Root health check route
app.get('/', (_req, res) => {
  res.send('✅ Calendar Integration API is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

import express from 'express';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import friendRoutes from './routes/friendRoutes';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import followRoutes from "./routes/followRoutes";
import likeRoutes from './routes/likeRoutes';
import commentRoutes from './routes/commentRoutes';
import notificationRoutes from './routes/notificationRoutes';

// Load environment variables from .env file
dotenv.config();

// Access environment variables using process.env
const port = process.env.PORT || 3005;
const apiUrl = process.env.API_URL;

const app = express();
const corsOptions = {
  origin: ['http://localhost:3000', 'exp://192.168.1.174:8081', 'http://192.168.1.55'],  // Add mobile IP here
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // If you're using cookies or sessions
};
app.use(express.json());
app.use(cors(corsOptions));  // Enable CORS for all routes
app.use(helmet());
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/friends', friendRoutes);
app.use('/user', userRoutes);
app.use("/follow", followRoutes);
app.use('/', likeRoutes);
app.use('/notifications', notificationRoutes);
app.use('/', commentRoutes);


// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Test route for verifying server is up and running
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Server is running and test route is working!' });
});

app.listen(3005, () => {
  console.log('Server running on port 3005');
});
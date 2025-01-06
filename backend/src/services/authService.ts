
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient';


// Function to generate a random alphanumeric ID in the format XXX-XXX-XXX
const generateUserID = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let userID = '';
  for (let i = 0; i < 9; i++) {
    userID += characters.charAt(Math.floor(Math.random() * characters.length));
    if (i === 2 || i === 5) {
      userID += '-'; // Add dashes at positions 3 and 6
    }
  }
  return userID;
};

// Function to register a new user
export const registerUser = async (email: string, password: string, username: string) => {
  // Check if the email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Check if the username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new Error('Username already in use');
  }

  // Hash the password before storing it in the database
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a unique userID
  let userID = generateUserID();
  // Check if the userID already exists in the database and regenerate if necessary
  while (await prisma.user.findUnique({ where: { userID } })) {
    userID = generateUserID(); // Generate a new one if it already exists
  }

  // Create the new user in the database
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
      userID, // Store the generated userID
    },
  });
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ 
    id: user.id,
    username: user.username,
    profilePicture: user.profilePicture,
   }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
  return token;
};

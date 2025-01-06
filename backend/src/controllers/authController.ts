
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';

export const signup = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  try {
    const user = await registerUser(email, password, username);  // Create user
    res.status(201).json({ message: 'User created successfully' });  // Success response without a token
  } catch (error: any) {
    console.error('Signup error: ', error.message);
    if (error.message === 'Email already in use') {
      res.status(400).json({ message: 'Email already in use' });
    } else if (error.message === 'Username already in use') {
      res.status(400).json({ message: 'Username already in use' });
    } else {
      res.status(500).json({ message: 'An error occurred' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const token = await loginUser(email, password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
};

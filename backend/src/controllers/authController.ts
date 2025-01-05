
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';

export const signup = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  try {
    const user = await registerUser(email, password, username);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.message === 'Email already in use') {
      res.status(400).json({ message: 'Email already in use' });
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

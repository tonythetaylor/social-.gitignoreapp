import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';  // Assuming you're using Prisma's User model

const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from the header

  if (!token) {
     res.sendStatus(403);  // Forbidden if no token is provided
     return
  }

  jwt.verify(token, process.env.JWT_SECRET || '', (err, decoded) => {
    if (err) {
      return res.sendStatus(403);  // Forbidden if token is invalid
    }

    // Attach the user to the request object
    req.user = decoded as User;  // Now TypeScript knows `req.user` is of type `User`
    next();  // Proceed to the next middleware or route handler
  });
};

export default authenticateJWT;
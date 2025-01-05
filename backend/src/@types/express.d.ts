// src/@types/express.d.ts

import { User } from '@prisma/client'; // or your own User type

declare global {
  namespace Express {
    interface Request {
      user?: User; // user is optional, as it may not always be set
    }
  }
}
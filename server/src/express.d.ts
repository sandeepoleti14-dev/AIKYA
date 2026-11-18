import type { IUser } from './models.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

declare namespace Express {
  export interface Request {
    id?: string;
    user?: {
      _id?: unknown;
      role?: string;
    };
  }
}

/**
 * Authenticated user request interface
 * Extends Express Request with JWT payload
 */
export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    tarotistaId?: number;
    role?: string;
  };
}

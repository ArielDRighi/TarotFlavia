/**
 * Authenticated user request interface
 * Extends Express Request with JWT payload
 */
export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    isAdmin: boolean;
    roles: string[];
    plan: string;
    tarotistaId?: number;
  };
}

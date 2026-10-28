import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/generateToken';
import { User, IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  tokenData?: TokenPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
      return;
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid session. User account not found.'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'User account has been deactivated. Contact an administrator.'
      });
      return;
    }

    req.user = user;
    req.tokenData = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired',
      error: error.message
    });
  }
};

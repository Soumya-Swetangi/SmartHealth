import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';
import { IUser } from '../models/User';

export interface TokenPayload {
  id: string;
  role: string;
  email: string;
  village: string;
}

export const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: (user._id as any).toString(),
    role: user.role,
    email: user.email,
    village: user.village
  };

  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.accessExpire as any
  });
};

export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: (user._id as any).toString(),
    role: user.role,
    email: user.email,
    village: user.village
  };

  return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
    expiresIn: JWT_CONFIG.refreshExpire as any
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_CONFIG.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_CONFIG.refreshSecret) as TokenPayload;
};

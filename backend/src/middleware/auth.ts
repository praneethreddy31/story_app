import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Get user from the token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          error: 'User account is deactivated'
        });
        return;
      }

      req.user = user;
      next();
      return;
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
      return;
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
    return;
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'User role is not authorized'
      });
      return;
    }

    next();
  };
};

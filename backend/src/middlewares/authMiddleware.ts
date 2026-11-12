import { Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose-cjs';
import path from 'path';
import dotenv from 'dotenv';
import { AuthenticatedRequest, AuthUserPayload } from '../types';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const clientUrl = process.env.CLIENT_URL;

if (!clientUrl) {
  throw new Error('CLIENT_URL is not defined in backend environment variables');
}

const jwksUrl = new URL(`${clientUrl}/api/auth/jwks`);
const JWKS = createRemoteJWKSet(jwksUrl);

/**
 * Middleware to authenticate requests using JWT issued by Better-Auth
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing or invalid format. Expected 'Bearer <token>'."
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token is missing from Authorization header.'
    });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload as AuthUserPayload;
    return next();
  } catch (verifyError: any) {
    console.error('JWT verification error via JWKS:', verifyError.message);

    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
      error: verifyError.message
    });
  }
}


import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

const SECRET = process.env.JWT_SECRET ?? 'petcare_secret_key';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, SECRET) as JwtPayload;
};

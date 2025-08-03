import jwt from 'jsonwebtoken';

export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fruit-panda-jwt-secret',
    { expiresIn }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fruit-panda-jwt-secret');
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'fruit-panda-refresh-secret',
    { expiresIn: '30d' }
  );
};
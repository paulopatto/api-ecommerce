const jwt = require('jsonwebtoken');

const createAccessToken = ({ userId = 'user-1', role = 'USER' } = {}) => {
  return jwt.sign(
    { sub: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
  );
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = {
  createAccessToken,
  authHeader
};

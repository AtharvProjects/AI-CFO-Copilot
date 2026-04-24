const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // BYPASS AUTHENTICATION FOR HACKATHON DEMO
  req.user = { userId: '1c62c35c-4889-4be5-8167-217fdddb7cad' };
  next();
};

module.exports = auth;

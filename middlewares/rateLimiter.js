const rateLimiter = require("express-rate-limit");

const loginLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: "too many login attempts",
});

module.exports = loginLimiter;

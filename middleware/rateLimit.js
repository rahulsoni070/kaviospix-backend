const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again in 15 minutes" }
});

module.exports = { apiLimiter };
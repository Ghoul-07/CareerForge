import rateLimit from "express-rate-limit";

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: "Too many AI requests. Please try again later.",
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: "Too many resume analysis requests. Please try again later.",
  },
});
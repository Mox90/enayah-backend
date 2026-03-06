import dotenv from 'dotenv'
dotenv.config()

// In env.ts
export const env = {
  PORT: Number(process.env.PORT || 8000),
  JWT_SECRET: process.env.JWT_SECRET!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,
}

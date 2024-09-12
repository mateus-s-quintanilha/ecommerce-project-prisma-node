import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const SERVER_PORT = process.env.SERVER_PORT;
export const JWT_SECRET = process.env.JWT_SECRET;
import * as dotenv from "dotenv";
dotenv.config();

export const TELEGRAM_CHANNEL_URL = process.env.TELEGRAM_CHANNEL_URL as string;
export const TELEGRAM_API_ID = parseInt(process.env.TELEGRAM_API_ID as string);
export const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH as string;

export const FROM_DATE = process.env.FROM_DATE as string;
export const TO_DATE = process.env.TO_DATE as string;

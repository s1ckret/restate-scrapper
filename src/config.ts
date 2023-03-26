import * as dotenv from "dotenv";
dotenv.config();

export const TELEGRAM_CHANNEL_URL = process.env.TELEGRAM_CHANNEL_URL as string;
export const TELEGRAM_API_ID = parseInt(process.env.TELEGRAM_API_ID as string);
export const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH as string;

export const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION as string;
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string;

export const APPLICATION_NAME = process.env.APPLICATION_NAME as string;
export const FROM_DATE = process.env.FROM_DATE as string;
export const TO_DATE = process.env.TO_DATE as string;

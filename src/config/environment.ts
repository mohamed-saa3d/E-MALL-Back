import dotenv from "dotenv";

dotenv.config();

const PORT = +(process.env.PORT || 4000);

const MONGODB_URI = process.env.MONGODB_URI;

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "secret-key";

const JWT_REFRESH_SECRET_KEY =
  process.env.JWT_REFRESH_SECRET_KEY || "secret-key";

const TOKEN_EXPIRES = +(process.env.TOKEN_EXPIRES|| 900000); //15 minutes;

const TOKEN_EXPIRES_STRING = process.env.TOKEN_EXPIRES_STRING || "15m";

const REFRESH_TOKEN_EXPIRES = +(
  process.env.REFRESH_TOKEN_EXPIRES || 1296000000
); // 15 days

const REFRESH_TOKEN_EXPIRES_STRING =
  process.env.REFRESH_TOKEN_EXPIRES_STRING || "15d";

const BCRYPT_SALT = +(process.env.BCRYPT_SALT || 10);

const NODE_ENV = process.env.NODE_ENV || "development";

const EMAIL_HOST = process.env.EMAIL_HOST;

const EMAIL_USER = process.env.EMAIL_USER;

const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const BASE_URL = process.env.BASE_URL;

const TOKEN_HASH_SECRET = process.env.TOKEN_HASH_SECRET;

const environment = {
  PORT,
  MONGODB_URI,
  JWT_SECRET_KEY,
  JWT_REFRESH_SECRET_KEY,
  TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
  BCRYPT_SALT,
  NODE_ENV,
  REFRESH_TOKEN_EXPIRES_STRING,
  TOKEN_EXPIRES_STRING,
  EMAIL_HOST,
  EMAIL_USER,
  EMAIL_PASSWORD,
  BASE_URL,
  TOKEN_HASH_SECRET,
};

export default environment;

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  plugins: [
    jwt({
      disableSettingJwtHeader: true,
      jwks: {
        keyPairConfig: {
          alg: "RS256"
        }
      }
    })
  ]
});


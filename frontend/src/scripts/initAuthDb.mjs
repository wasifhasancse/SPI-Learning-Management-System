import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { getMigrations } from "better-auth/db/migration";
import { Pool } from "pg";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env file
const envPath = path.resolve(__dirname, "../../.env.local");

if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "RS256"
        }
      }
    })
  ]
});

async function run() {
  console.log("Checking Better-Auth migrations on Neon DB...");
  try {
    const migrations = await getMigrations(auth.options);
    console.log("Tables to create:", migrations.toBeCreated.map(t => t.table));
    if (migrations.toBeAdded.length > 0) {
      console.log("Fields to add:", migrations.toBeAdded);
    }

    if (migrations.runMigrations) {
      await migrations.runMigrations();
      console.log("[OK] Better-Auth migrations applied successfully!");
    } else {
      console.log("[OK] No pending schema migrations.");
    }

    // Now seed default admin user if not exists
    console.log("Checking default admin user...");
    const client = await pool.connect();
    try {
      const existingUser = await client.query('SELECT * FROM "user" WHERE email = $1', ['admin@spilms.com']);
      if (existingUser.rows.length === 0) {
        console.log("Creating initial admin user via auth API...");
        const adminUser = await auth.api.signUpEmail({
          body: {
            email: "admin@spilms.com",
            password: "AdminPassword123!",
            name: "Admin Evaluator"
          }
        });
        console.log("[OK] Initial admin user created successfully: admin@spilms.com / AdminPassword123!");
      } else {
        console.log("[OK] Admin user already exists: admin@spilms.com");
      }
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();

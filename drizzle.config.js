import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";
config({ path: '.env.local' });

export default defineConfig({
    schema: "./src/db/schema.js",
    out: "./migrations",
    dialect: "mysql",
    dbCredentials: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    },
    migrations: {
        prefix: 'supabase'
    },
    verbose: true,
    strict: true,
})
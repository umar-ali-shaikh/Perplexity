import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Backend and frontend share a single .env file at the repo root
// (perplexity/.env), one level above both the "backend" and "frontend" folders.
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

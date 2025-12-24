import GitHubManager from "../server/services/githubManager.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_URL = "https://github.com/FelixAkabati007/AkaTech.git";
const OWNER = "FelixAkabati007";
const REPO = "AkaTech";

if (!GITHUB_TOKEN) {
  console.error("❌ Error: GITHUB_TOKEN is not defined in .env file.");
  console.error(
    "Please add GITHUB_TOKEN=your_personal_access_token to D:\\AkaTech_IT_Solution\\.env"
  );
  process.exit(1);
}

const manager = new GitHubManager({
  token: GITHUB_TOKEN,
  repoUrl: REPO_URL,
  owner: OWNER,
  repo: REPO,
  localPath: path.join(__dirname, "../repos/AkaTech"),
});

(async () => {
  const success = await manager.connect();
  if (success) {
    manager.startMonitoring(30000); // Check every 30 seconds
  } else {
    process.exit(1);
  }
})();

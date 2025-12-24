import simpleGit from "simple-git";
import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class GitHubManager {
  constructor(config) {
    this.token = config.token;
    this.repoUrl = config.repoUrl; // e.g., https://github.com/Owner/Repo.git
    this.localPath =
      config.localPath || path.join(__dirname, "../../repos/AkaTech");
    this.owner = config.owner;
    this.repo = config.repo;

    // Initialize Octokit for API access
    this.octokit = new Octokit({
      auth: this.token,
    });

    // Initialize git client
    if (!fs.existsSync(this.localPath)) {
      fs.mkdirSync(path.dirname(this.localPath), { recursive: true });
    }
    this.git = simpleGit();
  }

  async connect() {
    console.log("Initializing secure connection...");
    try {
      // 1. Authenticate & Check Permissions via API
      console.log("Authenticating with GitHub...");
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      console.log(`Authenticated as: ${user.login}`);

      // 2. Verify Repository Access
      console.log(`Verifying access to ${this.owner}/${this.repo}...`);
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner: this.owner,
        repo: this.repo,
      });

      console.log("Repository Metadata Verified:");
      console.log(`- Name: ${repoData.name}`);
      console.log(`- Visibility: ${repoData.private ? "Private" : "Public"}`);
      console.log(
        `- Permissions: Admin=${repoData.permissions.admin}, Push=${repoData.permissions.push}, Pull=${repoData.permissions.pull}`
      );

      if (!repoData.permissions.pull) {
        throw new Error(
          "Insufficient permissions: Cannot pull from repository."
        );
      }

      // 3. Clone or Open Local Repository
      if (fs.existsSync(path.join(this.localPath, ".git"))) {
        console.log("Local repository found. Verifying remote...");
        this.git = simpleGit(this.localPath);
        const remotes = await this.git.getRemotes(true);
        const origin = remotes.find((r) => r.name === "origin");

        if (origin && origin.refs.fetch.includes(this.repo)) {
          console.log("Remote origin matches. Pulling latest changes...");
          await this.git.pull();
        } else {
          console.warn("Remote mismatch or not set. Updating origin...");
          // Construct auth URL
          const authUrl = this.repoUrl.replace(
            "https://",
            `https://${this.token}@`
          );
          if (origin) {
            await this.git.remote(["set-url", "origin", authUrl]);
          } else {
            await this.git.addRemote("origin", authUrl);
          }
        }
      } else {
        console.log("Cloning repository locally...");
        const authUrl = this.repoUrl.replace(
          "https://",
          `https://${this.token}@`
        );
        await simpleGit().clone(authUrl, this.localPath);
        this.git = simpleGit(this.localPath);
      }

      console.log("✅ Connection established and verified.");
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  handleError(error) {
    console.error("❌ Connection Error:");
    if (error.status === 401) {
      console.error(
        "Authentication Failed: Invalid token or expired credentials."
      );
    } else if (error.status === 404) {
      console.error(
        "Repository Not Found: Check owner/repo name or access rights."
      );
    } else if (error.message.includes("Could not resolve host")) {
      console.error("Network Error: Unable to reach GitHub.");
    } else {
      console.error(error.message);
    }
  }

  startMonitoring(intervalMs = 60000) {
    console.log(`Starting connection monitor (Interval: ${intervalMs}ms)...`);
    setInterval(async () => {
      try {
        await this.octokit.rest.repos.get({
          owner: this.owner,
          repo: this.repo,
        });
        // Optional: Check git fetch to ensure git connectivity
        await this.git.fetch();
        console.log(`[${new Date().toISOString()}] Connection Status: Healthy`);
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Connection Status: Unhealthy`
        );
        this.handleError(error);
      }
    }, intervalMs);
  }
}

export default GitHubManager;

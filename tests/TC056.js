const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Location of the Hydro-Scout app source repo. Override with APP_REPO_PATH if
// it lives somewhere other than the sibling folder next to this QA repo.
const APP_REPO = process.env.APP_REPO_PATH
    || path.resolve(__dirname, "..", "..", "Hivemind-Hydro_Scout");

function run(label, args) {
    console.log(`\n--- Running: npm run ${args.join(" ")} ---`);
    const result = spawnSync("npm", ["run", ...args], {
        cwd: APP_REPO,
        encoding: "utf-8",
        shell: process.platform === "win32",
    });
    const output = (result.stdout || "") + (result.stderr || "");
    console.log(output.trim());
    const ok = result.status === 0;
    console.log(`${label}: ${ok ? "PASSED (exit 0)" : `FAILED (exit ${result.status})`}`);
    return ok;
}

async function TC056() {
    console.log("🚀 Starting Test Case 056: Lint and production build...");

    if (!fs.existsSync(path.join(APP_REPO, "package.json"))) {
        console.log(`⏭️ TEST SKIPPED: Hydro-Scout app source not found at ${APP_REPO}.`);
        console.log("Set APP_REPO_PATH to the app repo to run lint + production build here.");
        return;
    }

    console.log(`App source: ${APP_REPO}`);
    const lintOk = run("Lint", ["lint"]);
    const buildOk = run("Build", ["build"]);

    if (lintOk && buildOk) {
        console.log("\n🏆 TEST PASSED: Lint and production build both completed without errors.");
    } else {
        console.log("\n❌ TEST FAILED: " +
            [!lintOk && "lint reported errors", !buildOk && "production build failed"]
                .filter(Boolean).join(" and ") + ".");
    }
}

TC056();

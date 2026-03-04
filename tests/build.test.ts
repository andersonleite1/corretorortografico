/**
 * @vitest-environment node
 */
import { execSync } from "child_process";
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Build Process", () => {
  it("should complete the build process successfully", () => {
    // We attempt to find the real Node binary to bypass Snap confinement issues
    let nodeBin = "node";

    if (
      process.platform === "linux" &&
      fs.existsSync("/snap/node/current/bin/node")
    ) {
      nodeBin = "/snap/node/current/bin/node";
    }

    // Run next build directly using the found node binary
    const nextBin = path.join(process.cwd(), "node_modules", ".bin", "next");
    const buildCommand = `${nodeBin} ${nextBin} build`;

    console.log(`Running build command: ${buildCommand}`);

    try {
      // We use stdio: 'pipe' to capture output
      const output = execSync(buildCommand, {
        encoding: "utf8",
        timeout: 300000, // 5 minutes
        env: {
          ...process.env,
          CI: "true",
          NODE_OPTIONS: "",
          // Ensure we have a basic PATH if not provided
          PATH: process.env.PATH || "/usr/bin:/bin",
        },
      });

      console.log("Build completed successfully.");
      // Check for a common successful build marker
      expect(output).toContain("Route (app)");
    } catch (error: any) {
      console.error("Build test failed!");
      console.error("Exit Code:", error.status);
      console.error(
        "Combined Output:",
        error.stdout?.toString() || error.message,
      );
      throw error;
    }
  }, 400000);
});

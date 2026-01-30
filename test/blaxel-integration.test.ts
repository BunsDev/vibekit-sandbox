import { describe, it, expect, vi } from "vitest";
import { VibeKit } from "../packages/sdk/src/index.js";
import { createBlaxelProvider } from "../packages/blaxel/dist/index.js";
import { skipIfNoBlaxelKeys, skipTest } from "./helpers/test-utils.js";
import dotenv from "dotenv";

dotenv.config();

describe("Blaxel Sandbox", () => {
  it("should generate code with blaxel sandbox", async () => {
    if (skipIfNoBlaxelKeys()) {
      return skipTest();
    }

    const prompt = "Create a simple hello world function";

    const blaxelProvider = createBlaxelProvider({
      workspace: process.env.BL_WORKSPACE,
      apiKey: process.env.BL_API_KEY,
      image: "blaxel/vibekit-claude",
      memory: 4096,
      ttl: "1h", // Auto-delete after 1 hour
    });

    const vibeKit = new VibeKit()
      .withAgent({
        type: "claude",
        provider: "anthropic",
        apiKey: process.env.ANTHROPIC_API_KEY!,
        model: "claude-3-5-sonnet-20241022",
      })
      .withSandbox(blaxelProvider)
      .withSecrets({
        TEST_VAR: "test_value",
        NODE_ENV: "test",
      });

    const updateSpy = vi.fn();
    const errorSpy = vi.fn();

    vibeKit.on("stdout", updateSpy);
    vibeKit.on("stderr", errorSpy);

    // Clone repository first
    const repository = process.env.GH_REPOSITORY || "superagent-ai/superagent";
    await vibeKit.cloneRepository(repository);

    // Generate code with the prompt
    const result = await vibeKit.generateCode({ prompt });

    // Test port exposure
    const host = await vibeKit.getHost(3000);

    // Clean up
    await vibeKit.kill();

    expect(result).toBeDefined();
    expect(host).toBeDefined();
    expect(updateSpy).toHaveBeenCalled();
  }, 60000);
});


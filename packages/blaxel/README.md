# @vibe-kit/blaxel

Blaxel sandbox provider for VibeKit.

## Installation

```bash
npm install @vibe-kit/blaxel
```

## Usage

```typescript
import { VibeKit } from "@vibe-kit/sdk";
import { createBlaxelProvider } from "@vibe-kit/blaxel";

// Create the Blaxel provider with configuration
const blaxelProvider = createBlaxelProvider({
  workspace: process.env.BL_WORKSPACE, // optional, can use CLI login
  apiKey: process.env.BL_API_KEY, // optional, can use CLI login
  image: "blaxel/nodejs:latest", // optional, will be auto-selected based on agent
  memory: 4096, // optional, defaults to 4096 MB
  region: "us-pdx-1", // optional, Blaxel will choose default
  ttl: "24h", // optional, auto-delete after 24 hours
});

// Create the VibeKit instance with the provider
const vibeKit = new VibeKit()
  .withAgent({
    type: "claude",
    provider: "anthropic",
    apiKey: process.env.CLAUDE_API_KEY!,
    model: "claude-3-5-sonnet-20241022",
  })
  .withSandbox(blaxelProvider) // Pass the provider instance
  .withWorkingDirectory("/home/user/workdir") // Optional: specify working directory
  .withSecrets({
    // Any environment variables for the sandbox
    NODE_ENV: "development",
  });

// Use the configured instance
const response = await vibeKit.generateCode("Create a simple React component");
console.log(response);
```

## Configuration

The Blaxel provider accepts the following configuration:

- `workspace` (optional): Your Blaxel workspace ID. If not provided, uses CLI login or environment variables
- `apiKey` (optional): Your Blaxel API key. If not provided, uses CLI login or environment variables
- `image` (optional): Blaxel sandbox image. If not provided, will be auto-selected based on the agent type:
  - `claude` → `blaxel/vibekit-claude:latest`
  - `opencode` → `blaxel/vibekit-opencode:latest`
  - `gemini` → `blaxel/vibekit-gemini:latest`
  - `grok` → `blaxel/vibekit-grok:latest`
  - default → `blaxel/vibekit-codex:latest`
- `memory` (optional): Memory in MB (default: 4096)
- `region` (optional): Deployment region (e.g., "us-pdx-1"). If not specified, Blaxel chooses automatically
- `ttl` (optional): Time-to-live for auto-deletion (e.g., "24h", "30m", "7d"). Supported units: s, m, h, d, w
- `ports` (optional): Ports to open on Sandbox (default: [{ target: 3000, name: "web-server" }])

## Features

- Automatic image selection based on agent type
- Sub-25ms cold starts from standby mode
- Automatic scale-to-zero after inactivity (saves costs)
- Support for background command execution
- Configurable TTL for automatic cleanup
- Custom working directory support
- Environment variable injection

## Requirements

- Node.js 18+
- Blaxel workspace and API key (or CLI login with `bl login`)

## License

MIT


import { SandboxInstance as BlaxelSandbox, Ports } from "@blaxel/core";

// Define the interfaces we need from the SDK
export interface SandboxExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface SandboxCommandOptions {
  timeoutMs?: number;
  background?: boolean;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

export interface SandboxCommands {
  run(
    command: string,
    options?: SandboxCommandOptions
  ): Promise<SandboxExecutionResult>;
}

export interface SandboxInstance {
  sandboxId: string;
  commands: SandboxCommands;
  kill(): Promise<void>;
  pause(): Promise<void>;
  getHost(port: number): Promise<string>;
}

export interface SandboxProvider {
  create(
    envs?: Record<string, string>,
    agentType?: "codex" | "claude" | "opencode" | "gemini" | "grok",
    workingDirectory?: string
  ): Promise<SandboxInstance>;
  resume(sandboxId: string): Promise<SandboxInstance>;
}

export type AgentType = "codex" | "claude" | "opencode" | "gemini" | "grok";

export interface BlaxelConfig {
  workspace?: string;
  apiKey?: string;
  image?: string;
  memory?: number;
  region?: string;
  ttl?: string;
  ports?: Ports[];
}

// Helper function to get Blaxel image based on agent type
const getBlaxelImageFromAgentType = (agentType?: AgentType): string => {
  if (agentType === "claude") {
    return "blaxel/vibekit-claude";
  } else if (agentType === "opencode") {
    return "blaxel/vibekit-opencode";
  } else if (agentType === "gemini") {
    return "blaxel/vibekit-gemini";
  } else if (agentType === "grok") {
    return "blaxel/vibekit-grok";
  }
  return "blaxel/vibekit-codex";
};

// Blaxel implementation
class BlaxelSandboxInstance implements SandboxInstance {
  constructor(
    private sandbox: BlaxelSandbox,
    public sandboxId: string
  ) {}

  get commands(): SandboxCommands {
    return {
      run: async (command: string, options?: SandboxCommandOptions) => {
        const { background, onStdout, onStderr, timeoutMs } = options || {};

        try {
          // Execute the command using Blaxel's process API
          const process = await this.sandbox.process.exec({
            command,
            waitForCompletion: !background,
          });

          if (background) {
            // For background processes, set up streaming and return immediately
            if (onStdout || onStderr) {
              this.sandbox.process.streamLogs(process.pid, {
                onStdout: (data) => onStdout?.(data),
                onStderr: (data) => onStderr?.(data),
              });
            }

            return {
              exitCode: 0,
              stdout: "Background command started successfully",
              stderr: "",
            };
          } else {
            const stdout = await this.sandbox.process.logs(process.pid, "stdout");
            const stderr = await this.sandbox.process.logs(process.pid, "stderr");
            return {
              exitCode: process.exitCode,
              stdout,
              stderr
            };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : JSON.stringify(error);
          if (options?.onStderr) {
            options.onStderr(errorMessage);
          }
          return {
            exitCode: 1,
            stdout: "",
            stderr: errorMessage,
          };
        }
      },
    };
  }

  async kill(): Promise<void> {
    // Delete the sandbox (terminates immediately)
    await BlaxelSandbox.delete(this.sandboxId);
  }

  async pause(): Promise<void> {
    // Blaxel sandboxes automatically enter standby when inactive
    // We can close any active connections to trigger standby mode
    // This is a no-op as Blaxel handles this automatically
    console.log(
      "Pause not needed for Blaxel sandboxes - they automatically enter standby mode when inactive"
    );
  }

  async getHost(port: number): Promise<string> {
    // Get the preview URL for the specified port
    const preview = await this.sandbox.previews.createIfNotExists({
      metadata: {
        name: `vibekit-${this.sandboxId}-${port}`,
      },
      spec: {
        port,
        public: true,
      }
    })
    return preview.spec?.url!;
  }
}

export class BlaxelSandboxProvider implements SandboxProvider {
  constructor(private config: BlaxelConfig) {}

  async create(
    envs?: Record<string, string>,
    agentType?: AgentType,
    workingDirectory?: string
  ): Promise<SandboxInstance> {
    // Determine default image based on agent type if not specified in config
    const image = this.config.image || getBlaxelImageFromAgentType(agentType);

    // Generate a unique name for the sandbox
    const name = `vibekit-${agentType || "default"}-${Date.now()}`;

    const formattedEnvs = Object.entries(envs || {}).map(([key, value]) => ({
      name: key,
      value,
    }));

    // Create the sandbox with Blaxel
    const sandbox = await BlaxelSandbox.create({
      name,
      image,
      memory: this.config.memory || 4096,
      region: this.config.region,
      ttl: this.config.ttl,
      envs: formattedEnvs,
      ports: this.config.ports || [{ target: 3000, name: "web-server" }],
    });

    // Set up working directory if specified
    if (workingDirectory) {
      await sandbox.process.exec({
        command: `mkdir -p ${workingDirectory}`,
        waitForCompletion: false,
      });
    }
    return new BlaxelSandboxInstance(sandbox, name);

  }

  async resume(sandboxId: string): Promise<SandboxInstance> {
    // Resume/reconnect to an existing sandbox by name
    const sandbox = await BlaxelSandbox.get(sandboxId);
    return new BlaxelSandboxInstance(sandbox, sandboxId);
  }
}

export function createBlaxelProvider(
  config: BlaxelConfig
): BlaxelSandboxProvider {
  return new BlaxelSandboxProvider(config);
}


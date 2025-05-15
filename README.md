<div align="center">

<img width="100px" src="./assets/vibekit-logo.png" />

# VibeKit

### Send Prompts To Any Coding Agent

<p>
<img alt="GitHub Contributors" src="https://img.shields.io/github/contributors/superagent-ai/vibekit" />
<img alt="GitHub Issues" src="https://img.shields.io/github/issues/superagent-ai/vibekit" />
<img alt="GitHub License" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
<img alt="Discord" src="https://img.shields.io/discord/1110910277110743103?label=Discord&logo=discord&logoColor=white&style=plastic&color=d7b023)](https://discord.gg/e8j7mgjDUK" />
</p>
</div>

-----

<p align="center">
  <a href="#-example">Example</a> •
  <a href="#-supported-agents">Supported Agents</a> •
  <a href="#-configuration">Configuration</a> •
  <a href="https://discord.com/invite/mhmJUTjW4b" target="_blank">Discord</a> 
</p>

-----

## Example

```ts
import { VibeKit } from 'vibekit';

const vk = new VibeKit({
  agent: 'codex',
  config: {
    openaiApiKey: '...',
    githubToken: '...',
    repoUrl: 'https://github.com/user/repo',
    e2bApiKey: '...',
  },
});

const result = await vk.sendPrompt("Create a Next.js app with a login page.");

console.log(result);
```

## Supported Agents

- [x] OpenAI Codex
- [x] Claude Code
- [x] Devin
- [x] OpenHands
- [x] Codegen

## Configuration

```ts
export type AgentName = 'codex' | 'devin' | 'claude' | 'openhands' | 'codegen';

export type AgentConfig =
  | {
      agent: 'codex';
      config: {
        openaiApiKey: string;
        githubToken: string;
        repoUrl: string;
        e2bApiKey: string;
      };
    }
  | {
      agent: 'claude';
      config: {
        anthropicApiKey: string;
        githubToken: string;
        repoUrl: string;
        e2bApiKey: string;
      };
    }
  | {
      agent: 'devin' | 'codegen' | 'openhands';
      config: {
        apiKey: string;
      };
    };

```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. This means you are free to use, modify, and distribute the code, provided that you include the original license and copyright notice in any copies or substantial portions of the software. The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. For more details, please refer to the LICENSE file included in the repository.

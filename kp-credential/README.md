# KP Credential

Version: 1.0.0

The `kp-credential` plugin provides a Skill for API header credentials stored in macOS Keychain or Windows Credential Manager. Users enter values through the CLI's hidden prompt; the agent can use them only in requests within an approved HTTPS scope.

| Skill | Version | When to use | Purpose |
| --- | --- | --- | --- |
| [`kp-credential`](skills/kp-credential/SKILL.md) | `1.0.0` | Storing, inspecting, approving, using, or deleting an API credential | Selects Keychain or Credential Manager from the OS; the agent uses approved API requests without printing the secret. |

## Project-local installation

The `kp-credential` Skill requires all three manager Skills in the same project and agent scope. If you install only the credential Skill, its instructions automatically install the missing manager set before credential work starts. The `kp-app-skill` and `kp-api-skill` manifests declare both the manager and this plugin as required dependencies.

Skills CLI copy installation does not install plugin dependencies. The commands below can preinstall manager and credential Skills; if you install just the credential Skill, the agent installs the missing manager set when the Skill runs.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --copy --yes
~~~

Codex uses `.agents/skills/`; Claude Code uses `.claude/skills/`. Use `--global` or `-g` only when a user-wide installation is explicitly requested.

## CLI setup

The CLI package ships inside the `kp-credential` Skill folder. When an API credential is first needed, the agent checks `kp-credential --version` and automatically installs or updates the CLI from the installed Skill folder. The user does not need a local repository clone or a separate download. Node.js 20 or later, npm, npm registry access, and a user-writable global prefix are required. If a prerequisite is missing, the agent explains the cause and retries after it is ready. See the [CLI guide](skills/kp-credential/CLI.md).

Store values with the hidden prompt from `kp-credential add <item-label>`. Never place them in chat, command arguments, `AGENTS.local.md`, `.env`, or a shell profile. The tool does not inject secrets into arbitrary CLI environment variables or fill browser login forms.

## Scope

The CLI has no command that prints a stored credential. `grant` allows only the HTTPS origin, path, method, and header approved by the user; `request` sends API calls within that scope. Do not approve endpoints that may return the credential in their response. OS credential stores do not sync values between computers.

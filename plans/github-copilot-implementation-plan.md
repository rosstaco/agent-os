# Plan: Adapt Agent-OS for GitHub Copilot

Rewrite the CLI in Node.js to handle project-only installation, converting both orchestrator and numbered sub-command files to `.prompt.md` format in `.agent-os/commands/`, expanding all template references during conversion, and configuring VS Code to register prompts with Copilot.

## Steps

### 1. Rewrite `bin/cli.js`

Implement project installation directly:
- Parse `--github-copilot` flag
- Create `.agent-os/` directory structure (commands, workflows, standards)
- Copy `profiles/default/standards/**` to `.agent-os/standards/` unchanged
- Copy `profiles/default/workflows/**` to `.agent-os/workflows/` unchanged
- Generate `.vscode/settings.json` with `chat.promptFilesLocations`

### 2. Implement conversion function in `cli.js`

Transform command files during copy:
- Convert `{{workflows/path}}` to `#file:.agent-os/workflows/path.md` references
- Convert `{{standards/global/*}}` glob to `#file:.agent-os/standards/global/*.md` (keeping glob pattern)
- Replace `@agent-os/commands/path/file.md` with `#file:.agent-os/commands/path/file.prompt.md`
- Strip `{{UNLESS}}...{{ENDUNLESS}}` blocks
- Preserve all other content

### 3. Convert all command files

From `profiles/default/commands/*/single-agent/*.md` to `.agent-os/commands/*/*.prompt.md`:
- Process orchestrator files: plan-product.md, shape-spec.md, write-spec.md, create-tasks.md, implement-tasks.md
- Process all numbered sub-files: 1-*.md, 2-*.md, etc.
- Maintain directory structure
- Exclude `improve-skills` and `orchestrate-tasks` directories

### 4. Configure `.vscode/settings.json`

Set up Copilot prompt registration:
- Set `"chat.promptFilesLocations": { ".agent-os/commands/**/*.prompt.md": true }`
- Merge with existing settings.json if present
- Create new file if none exists

## Resolution

1. `{{workflows/path}}` → Convert to `#file:.agent-os/workflows/path.md` references (not inlined)

2. `{{standards/global/*}}` → Convert to `#file:.agent-os/standards/global/*.md` (preserve glob pattern)

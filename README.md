<img width="1280" height="640" alt="agent-os-og" src="https://github.com/user-attachments/assets/f70671a2-66e8-4c80-8998-d4318af55d10" />

## Your system for spec-driven agentic development.

[Agent OS](https://buildermethods.com/agent-os) transforms AI coding agents from confused interns into productive developers. With structured workflows that capture your standards, your stack, and the unique details of your codebase, Agent OS gives your agents the specs they need to ship quality code on the first try—not the fifth.

Use it with:

✅ Claude Code, Cursor, GitHub Copilot, or any other AI coding tool.

✅ New products or established codebases.

✅ Big features, small fixes, or anything in between.

✅ Any language or framework.

---

### Quick Start

Install Agent OS with npm (recommended):

```bash
# Install base system to ~/.agent-os
npx @rosstaco/agent-os

# Initialize in your project
cd your-project
npx @rosstaco/agent-os init --claude-code
```

**Available flags:**
- `--claude-code` or `--claude` - Add Claude Code support
- `--cursor` - Add Cursor support  
- `--github-copilot` or `--copilot` - Add GitHub Copilot support
- `--overwrite-instructions` - Overwrite existing instruction files
- `--overwrite-standards` - Overwrite existing standards files
- `--project-type=TYPE` - Use specific project type configuration

**Common workflows:**

```bash
# Quick start - auto-installs base if needed
npx @rosstaco/agent-os init --cursor

# Install base with multiple tools
npx @rosstaco/agent-os --claude-code --cursor --github-copilot

# Initialize project with Cursor support
cd my-rails-app
npx @rosstaco/agent-os init --cursor

# Initialize with custom project type
npx @rosstaco/agent-os init --project-type=rails --claude-code
```

**How it works:**
- The `init` command automatically installs the base system to `~/.agent-os` if it doesn't exist
- Base installation only needs to happen once per machine
- Each project gets its own `.agent-os` directory with instructions and standards
- Tool-specific files (`.claude/`, `.cursor/`, `.github/prompts/`) are created in your project

---

### Documentation

Full docs, useage, & best practices 👉 [buildermethods.com/agent-os](https://buildermethods.com/agent-os)

---

### For Maintainers

**Publishing to npm:** See [.github/PUBLISHING.md](.github/PUBLISHING.md) for instructions on publishing new versions.

---

### Created by Brian Casel @ Builder Methods

Created by Brian Casel, the creator of [Builder Methods](https://buildermethods.com), where Brian helps professional software developers and teams build with AI.

Get Brian's free resources on building with AI:
- [Builder Briefing newsletter](https://buildermethods.com)
- [YouTube](https://youtube.com/@briancasel)


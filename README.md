# Agent OS (rosstaco fork)

> **Note:** This is a fork of [buildermethods/agent-os](https://github.com/buildermethods/agent-os). The original project was created by Brian Casel at Builder Methods.
>
> **What's different in this fork:**
> - ✨ **GitHub Copilot support** - Custom prompts integrated into VS Code
> - 📦 **Project-only installation** - Simplified installation directly to your project
> - 🚀 **Single-agent workflows** - Streamlined commands for better Copilot integration
> - 🔧 **Direct Node.js implementation** - No bash script dependencies

## Your system for spec-driven agentic development.

[Agent OS](https://buildermethods.com/agent-os) transforms AI coding agents from confused interns into productive developers. With structured workflows that capture your standards, your stack, and the unique details of your codebase, Agent OS gives your agents the specs they need to ship quality code on the first try—not the fifth.

Use it with:

✅ **GitHub Copilot** (currently supported)

✅ New products or established codebases.

✅ Big features, small fixes, or anything in between.

✅ Any language or framework.

---

### Quick Start

Install Agent OS with npm:

```bash
cd your-project
npx @rosstaco/agent-os init --github-copilot
```

This will create:
- `.agent-os/` directory with workflows, standards, and converted prompts
- `.vscode/settings.json` configured to register prompts with Copilot

**Available Commands:**

After installation, use these prompts in GitHub Copilot Chat:

- `#file:.agent-os/commands/plan-product/plan-product.prompt.md` - Plan and document product mission and roadmap
- `#file:.agent-os/commands/shape-spec/shape-spec.prompt.md` - Shape feature specifications  
- `#file:.agent-os/commands/write-spec/write-spec.prompt.md` - Write detailed specifications
- `#file:.agent-os/commands/create-tasks/create-tasks.prompt.md` - Create implementation tasks
- `#file:.agent-os/commands/implement-tasks/implement-tasks.prompt.md` - Execute implementation tasks

**How it works:**
- Installs directly to your project's `.agent-os/` directory
- Copies standards (coding style, conventions, tech stack guidelines)
- Copies workflows (reusable instruction components)
- Converts commands to `.prompt.md` format for Copilot
- Configures VS Code to register prompts with Copilot's chat interface

---

### Follow updates & releases

Read the [changelog](CHANGELOG.md)

[Subscribe to be notified of major new releases of Agent OS](https://buildermethods.com/agent-os)

---

### Documentation

Full docs, useage, & best practices 👉 [buildermethods.com/agent-os](https://buildermethods.com/agent-os)

---

### Original Project by Brian Casel @ Builder Methods

The original Agent OS was created by Brian Casel, the creator of [Builder Methods](https://buildermethods.com), where Brian helps professional software developers and teams build with AI.

This fork is maintained by [Ross Miles](https://github.com/rosstaco).

Get Brian's free resources on building with AI:
- [Builder Briefing newsletter](https://buildermethods.com)
- [YouTube](https://youtube.com/@briancasel)

Join [Builder Methods Pro](https://buildermethods.com/pro) for official support and connect with our community of AI-first builders:

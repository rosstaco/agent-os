# Spec Requirements Document

> Spec: NPM Installer Package
> Created: 2025-10-02

## Overview

Create an npm package wrapper that simplifies Agent OS installation by providing intuitive npm commands: `npx @rosstaco/agent-os` installs the base system to ~/.agent-os, and `npx @rosstaco/agent-os init` sets up Agent OS in the current project directory.

## User Stories

### Two-Step Installation Process

As a developer wanting to use Agent OS, I want to first install the base system globally to my home directory, then initialize it in specific projects, so that I only need to download Agent OS files once.

**Workflow:**
1. Run `npx @rosstaco/agent-os` to install base system to ~/.agent-os
2. Navigate to any project directory
3. Run `npx @rosstaco/agent-os init [flags]` to set up Agent OS for that project

This replaces the current curl-based installation with familiar npm commands.

### Automatic Base Installation Check

As a developer running `npx @rosstaco/agent-os init`, I want the command to automatically check if the base installation exists and install it if needed, so that I don't have to remember to run the base installation first.

If ~/.agent-os/setup/project.sh doesn't exist when running `init`, the command automatically runs the base installation before proceeding with project setup.

## Spec Scope

1. **NPM Package Creation** - Create a lightweight npm package (@rosstaco/agent-os) that serves as a wrapper for the bash installation scripts
2. **Base Installation Command** - Implement `npx @rosstaco/agent-os` (no args) that downloads and executes base.sh to install Agent OS to ~/.agent-os
3. **Project Init Command** - Implement `npx @rosstaco/agent-os init [args]` that checks for base installation, installs if missing, then runs project.sh with passed arguments
4. **Argument Pass-through** - Support all existing base.sh and project.sh flags (--claude-code, --cursor, --github-copilot, --overwrite-*, etc.) through the npm CLI
5. **GitHub Action for Publishing** - Create a manually-triggered GitHub Action workflow to publish the package to npm registry
6. **Package Configuration** - Set up package.json with proper bin configuration, dependencies, and metadata for npm publishing

## Out of Scope

- Global installation command (`npm install -g`) - users will use npx for on-demand execution
- Post-install scripts or automatic configuration
- Rewriting bash scripts in JavaScript - the package is purely a wrapper
- Version management or update checking features
- Interactive prompts or TUI interface for command selection
- Project type detection or automatic flag selection

## Expected Deliverable

1. Running `npx @rosstaco/agent-os` successfully downloads base.sh and installs Agent OS to ~/.agent-os with all files and directories
2. Running `npx @rosstaco/agent-os init --claude-code` checks for ~/.agent-os existence, installs base if needed, then executes project.sh with the --claude-code flag
3. GitHub Action workflow can be manually triggered to publish new versions of the package to npm registry
4. All existing base.sh and project.sh functionality and flags continue to work when invoked through the npm wrapper

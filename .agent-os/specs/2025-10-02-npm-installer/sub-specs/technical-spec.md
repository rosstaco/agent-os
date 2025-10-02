# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-02-npm-installer/spec.md

## Technical Requirements

### Package Structure

- **Package Name:** `@rosstaco/agent-os`
- **Package Type:** ESM module with bin entry point
- **Main Entry:** `bin/agent-os.js` or `bin/cli.js`
- **Executable:** Shebang `#!/usr/bin/env node` at top of CLI file

### CLI Implementation

**Command Structure:**
```bash
# Base installation (no args)
npx @rosstaco/agent-os [base-options]

# Project initialization
npx @rosstaco/agent-os init [project-options]
```

**Base Command (no args or with base.sh options):**
- Downloads base.sh from GitHub
- Executes it to install Agent OS to ~/.agent-os
- Passes through base.sh flags: `--overwrite-instructions`, `--overwrite-standards`, `--overwrite-config`, `--claude-code`, `--cursor`, `--github-copilot`

**Init Command:**
1. Check if `~/.agent-os/setup/project.sh` exists
2. If not found, automatically run base installation first
3. Execute project.sh with passed arguments
4. Pass through project.sh flags: `--no-base`, `--overwrite-instructions`, `--overwrite-standards`, `--claude-code`, `--cursor`, `--github-copilot`, `--project-type=TYPE`

**Implementation Steps:**
1. Parse command line arguments using Node.js `process.argv`
2. Determine if command is base installation (no "init" arg) or project initialization (has "init" arg)
3. For base installation:
   - Download base.sh from `https://raw.githubusercontent.com/rosstaco/agent-os/main/setup/base.sh`
   - Save to temporary location (e.g., `/tmp/agent-os-base-${timestamp}.sh`)
   - Execute with user's args
4. For init command:
   - Check if `~/.agent-os/setup/project.sh` exists (resolve ~ to home directory)
   - If not exists, download and run base.sh first (without args or with inherited flags)
   - Execute project.sh from ~/.agent-os/setup/project.sh with user's args
5. Stream stdout/stderr to parent process for real-time output
6. Clean up temporary files after execution
7. Exit with same exit code as bash script

**Error Handling:**
- Network failures when downloading base.sh
- Permission errors when executing bash scripts
- Missing home directory or insufficient permissions for ~/.agent-os
- Invalid arguments (delegate to respective script's help)

### Package.json Configuration

```json
{
  "name": "@rosstaco/agent-os",
  "version": "1.0.0",
  "description": "Agent OS installer for AI-powered development workflows",
  "type": "module",
  "bin": {
    "agent-os": "./bin/cli.js"
  },
  "files": [
    "bin/"
  ],
  "keywords": ["agent", "ai", "development", "workflow", "automation"],
  "author": "Ross <rosstaco>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/rosstaco/agent-os.git"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### GitHub Action Workflow

**Trigger:** Manual dispatch (workflow_dispatch)

**Workflow Steps:**
1. Checkout repository code
2. Set up Node.js (version 20 LTS)
3. Read version from package.json
4. Run `npm install` (if needed for build)
5. Run `npm publish --access public`
6. Create GitHub release tag matching npm version

**Required Secrets:**
- `NPM_TOKEN` - npm authentication token with publish permissions

**File Location:** `.github/workflows/publish-npm.yml`

### File Structure

```
agent-os/
├── bin/
│   └── cli.js              # Main CLI entry point
├── package.json            # Package configuration
├── package-lock.json       # Locked dependencies
├── .github/
│   └── workflows/
│       └── publish-npm.yml # Publishing workflow
└── README.md               # Updated with npm install instructions
```

### Technical Constraints

- Must work on macOS, Linux, and Windows (with bash available)
- No runtime dependencies beyond Node.js built-ins
- Package size should be minimal (<50KB)
- Support Node.js 18+ (LTS versions)
- Must preserve all base.sh and project.sh functionality and output
- Home directory resolution must work across all platforms (~/.agent-os)
- Must handle case where base installation is incomplete or corrupted

### Integration with Existing System

- The npm package does NOT modify existing bash scripts
- base.sh and project.sh continue to function independently via curl method
- Both installation methods (curl and npx) remain supported
- Documentation should show npx as the recommended method
- The init command intelligently checks for base installation and auto-installs if needed
- Users can run base installation separately if desired, or let init handle it automatically

## External Dependencies

**None** - The implementation will use only Node.js built-in modules:
- `fs` - File system operations for temporary file handling and checking ~/.agent-os existence
- `https` - Downloading base.sh from GitHub
- `child_process` - Executing bash scripts (base.sh and project.sh)
- `process` - Command line argument parsing and exit codes
- `os` - Home directory resolution for cross-platform ~/.agent-os path

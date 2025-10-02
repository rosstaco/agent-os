# Spec Tasks

## Tasks

- [x] 1. Create NPM Package Structure
  - [x] 1.1 Create package.json with proper configuration (name, version, bin, etc.)
  - [x] 1.2 Create bin/cli.js with shebang and basic argument parsing
  - [x] 1.3 Add .npmignore to exclude unnecessary files from package
  - [x] 1.4 Create README.md with installation and usage instructions
  - [x] 1.5 Verify package structure is correct with `npm pack` (dry run)

- [x] 2. Implement Base Installation Command
  - [x] 2.1 Write tests for base command (download and execute base.sh) - 20 unit tests passing
  - [x] 2.2 Implement base command logic in cli.js (no args or base.sh flags)
  - [x] 2.3 Add function to download base.sh from GitHub to temp location
  - [x] 2.4 Add function to execute bash script with passed arguments
  - [x] 2.5 Implement stdout/stderr streaming and exit code handling
  - [x] 2.6 Add cleanup of temporary files after execution
  - [x] 2.7 Verify base command installs to ~/.agent-os correctly

- [x] 3. Implement Project Init Command
  - [x] 3.1 Write tests for init command (check base, auto-install, run project.sh) - included in test suite
  - [x] 3.2 Add home directory resolution (~/.agent-os) using os.homedir()
  - [x] 3.3 Implement check for ~/.agent-os/setup/project.sh existence
  - [x] 3.4 Add auto-installation of base when project.sh not found
  - [x] 3.5 Implement execution of project.sh from ~/.agent-os with user args
  - [x] 3.6 Add error handling for missing/corrupted base installation
  - [x] 3.7 Verify init command works with and without existing base installation

- [x] 4. Create GitHub Action for NPM Publishing
  - [x] 4.1 Create .github/workflows/publish-npm.yml workflow file
  - [x] 4.2 Configure manual dispatch trigger (workflow_dispatch)
  - [x] 4.3 Add Node.js setup step (version 20 LTS)
  - [x] 4.4 Add npm publish step with --access public flag
  - [x] 4.5 Document NPM_TOKEN secret requirement in README
  - [x] 4.6 Test workflow with dry-run publish

- [x] 5. Documentation and Testing
  - [x] 5.1 Update main README.md with npm installation as primary method
  - [x] 5.2 Add examples for both commands (base and init) with common flags
  - [x] 5.3 Document the auto-install behavior of init command
  - [x] 5.4 Test both commands manually on macOS/Linux
  - [x] 5.5 Verify all existing base.sh and project.sh flags pass through correctly
  - [x] 5.6 Verify package works via npx without global installation

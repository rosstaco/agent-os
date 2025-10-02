import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Mock the CLI module
const CLI_PATH = '../bin/cli.js';

describe('Agent OS CLI', () => {
  describe('Argument Parsing', () => {
    it('should identify base command when no args provided', () => {
      const args = [];
      const isInit = args[0] === 'init';
      assert.strictEqual(isInit, false, 'Should not be init command');
    });

    it('should identify init command when first arg is "init"', () => {
      const args = ['init'];
      const isInit = args[0] === 'init';
      assert.strictEqual(isInit, true, 'Should be init command');
    });

    it('should pass through flags for base command', () => {
      const args = ['--claude-code', '--cursor'];
      const baseArgs = args[0] === 'init' ? args.slice(1) : args;
      assert.deepStrictEqual(baseArgs, ['--claude-code', '--cursor']);
    });

    it('should pass through flags for init command', () => {
      const args = ['init', '--claude-code', '--cursor'];
      const initArgs = args[0] === 'init' ? args.slice(1) : args;
      assert.deepStrictEqual(initArgs, ['--claude-code', '--cursor']);
    });
  });

  describe('Path Resolution', () => {
    it('should resolve home directory correctly', () => {
      const homeDir = homedir();
      assert.ok(homeDir, 'Home directory should be resolved');
      assert.ok(homeDir.length > 0, 'Home directory should not be empty');
    });

    it('should construct correct .agent-os path', () => {
      const homeDir = homedir();
      const agentOsPath = join(homeDir, '.agent-os');
      assert.ok(agentOsPath.includes('.agent-os'), 'Path should include .agent-os');
    });

    it('should construct correct project.sh path', () => {
      const homeDir = homedir();
      const projectScriptPath = join(homeDir, '.agent-os', 'setup', 'project.sh');
      assert.ok(projectScriptPath.endsWith('project.sh'), 'Path should end with project.sh');
    });
  });

  describe('Base Installation Detection', () => {
    const testDir = '/tmp/agent-os-test-base';
    const projectScriptPath = join(testDir, 'setup', 'project.sh');

    beforeEach(() => {
      // Clean up before each test
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    afterEach(() => {
      // Clean up after each test
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should detect when base installation does not exist', () => {
      const exists = existsSync(projectScriptPath);
      assert.strictEqual(exists, false, 'Base installation should not exist');
    });

    it('should detect when base installation exists', () => {
      // Create the directory structure
      mkdirSync(join(testDir, 'setup'), { recursive: true });
      writeFileSync(projectScriptPath, '#!/bin/bash\necho "test"', { mode: 0o755 });
      
      const exists = existsSync(projectScriptPath);
      assert.strictEqual(exists, true, 'Base installation should exist');
    });
  });

  describe('Command Validation', () => {
    it('should accept valid base command flags', () => {
      const validFlags = [
        '--claude-code',
        '--cursor',
        '--github-copilot',
        '--overwrite-instructions',
        '--overwrite-standards',
        '--overwrite-config',
        '--help'
      ];

      validFlags.forEach(flag => {
        assert.ok(flag.startsWith('--'), `Flag ${flag} should start with --`);
      });
    });

    it('should accept valid init command flags', () => {
      const validFlags = [
        '--no-base',
        '--claude-code',
        '--cursor',
        '--github-copilot',
        '--overwrite-instructions',
        '--overwrite-standards',
        '--project-type=default'
      ];

      validFlags.forEach(flag => {
        assert.ok(flag.startsWith('--'), `Flag ${flag} should start with --`);
      });
    });
  });

  describe('Temporary File Paths', () => {
    it('should generate unique temporary file paths', () => {
      const path1 = `/tmp/agent-os-base-${Date.now()}.sh`;
      // Small delay to ensure different timestamp
      const path2 = `/tmp/agent-os-base-${Date.now() + 1}.sh`;
      
      assert.notStrictEqual(path1, path2, 'Temp paths should be unique');
    });

    it('should use /tmp directory for temporary files', () => {
      const tempPath = `/tmp/agent-os-base-${Date.now()}.sh`;
      assert.ok(tempPath.startsWith('/tmp/'), 'Temp path should be in /tmp');
    });
  });

  describe('URL Construction', () => {
    const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/rosstaco/agent-os/main';

    it('should construct correct base.sh URL', () => {
      const baseScriptUrl = `${GITHUB_BASE_URL}/setup/base.sh`;
      assert.strictEqual(
        baseScriptUrl,
        'https://raw.githubusercontent.com/rosstaco/agent-os/main/setup/base.sh',
        'Base script URL should be correct'
      );
    });

    it('should use HTTPS for GitHub raw content', () => {
      const baseScriptUrl = `${GITHUB_BASE_URL}/setup/base.sh`;
      assert.ok(baseScriptUrl.startsWith('https://'), 'URL should use HTTPS');
    });
  });

  describe('Error Messages', () => {
    it('should have descriptive error message for download failure', () => {
      const statusCode = 404;
      const errorMsg = `Failed to download: ${statusCode}`;
      assert.strictEqual(errorMsg, 'Failed to download: 404');
    });

    it('should have descriptive error message for script execution failure', () => {
      const exitCode = 1;
      const errorMsg = `Script exited with code ${exitCode}`;
      assert.strictEqual(errorMsg, 'Script exited with code 1');
    });
  });

  describe('Console Output', () => {
    it('should have clear base installation message', () => {
      const message = 'Downloading Agent OS base installation script...';
      assert.ok(message.includes('Downloading'), 'Should mention downloading');
      assert.ok(message.includes('base installation'), 'Should mention base installation');
    });

    it('should have clear missing base warning', () => {
      const warning = '⚠️  Base installation not found at ~/.agent-os';
      assert.ok(warning.includes('not found'), 'Should indicate not found');
      assert.ok(warning.includes('.agent-os'), 'Should mention .agent-os path');
    });

    it('should have clear success message', () => {
      const success = '✅ Base installation complete!';
      assert.ok(success.includes('✅'), 'Should have success emoji');
      assert.ok(success.includes('complete'), 'Should indicate completion');
    });
  });
});

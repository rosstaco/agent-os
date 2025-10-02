#!/usr/bin/env node

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { get } from 'https';
import { homedir } from 'os';
import { join } from 'path';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/rosstaco/agent-os/main';
const BASE_SCRIPT_URL = `${GITHUB_BASE_URL}/setup/base.sh`;
const HOME_DIR = homedir();
const AGENT_OS_DIR = join(HOME_DIR, '.agent-os');
const PROJECT_SCRIPT_PATH = join(AGENT_OS_DIR, 'setup', 'project.sh');

/**
 * Download a file from a URL
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Execute a bash script
 */
function executeScript(scriptPath, args, cwd = undefined) {
  return new Promise((resolve, reject) => {
    const options = {
      stdio: 'inherit',
      shell: false
    };
    
    if (cwd) {
      options.cwd = cwd;
    }
    
    const child = spawn('bash', [scriptPath, ...args], options);

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
}

/**
 * Run base installation
 */
async function runBaseInstallation(args) {
  console.log('Downloading Agent OS base installation script...\n');
  
  try {
    const scriptContent = await downloadFile(BASE_SCRIPT_URL);
    const tempPath = `/tmp/agent-os-base-${Date.now()}.sh`;
    
    writeFileSync(tempPath, scriptContent, { mode: 0o755 });
    
    // Run base.sh from home directory so it installs to ~/.agent-os
    await executeScript(tempPath, args, HOME_DIR);
    
    // Cleanup
    if (existsSync(tempPath)) {
      unlinkSync(tempPath);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error running base installation:', error.message);
    process.exit(1);
  }
}

/**
 * Run project initialization
 */
async function runProjectInit(args) {
  // Check if base installation exists
  if (!existsSync(PROJECT_SCRIPT_PATH)) {
    console.log('⚠️  Base installation not found at ~/.agent-os');
    console.log('Installing Agent OS base first...\n');
    
    try {
      const scriptContent = await downloadFile(BASE_SCRIPT_URL);
      const tempPath = `/tmp/agent-os-base-${Date.now()}.sh`;
      
      writeFileSync(tempPath, scriptContent, { mode: 0o755 });
      // Run from home directory to install to ~/.agent-os
      await executeScript(tempPath, [], HOME_DIR);
      
      // Cleanup
      if (existsSync(tempPath)) {
        unlinkSync(tempPath);
      }
      
      console.log('\n✅ Base installation complete!\n');
    } catch (error) {
      console.error('Error installing base:', error.message);
      process.exit(1);
    }
  }
  
  // Now run project.sh
  try {
    console.log('Running project initialization...\n');
    await executeScript(PROJECT_SCRIPT_PATH, args);
    process.exit(0);
  } catch (error) {
    console.error('Error running project initialization:', error.message);
    process.exit(1);
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Check if first arg is 'init'
  if (args[0] === 'init') {
    // Remove 'init' from args and pass the rest to project.sh
    await runProjectInit(args.slice(1));
  } else {
    // Run base installation with all args
    await runBaseInstallation(args);
  }
}

// Export for testing
export { downloadFile, executeScript, runBaseInstallation, runProjectInit, main };

// Run if not imported as a module
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('cli.js') || 
  process.argv[1].endsWith('agent-os')
);

if (isMainModule) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

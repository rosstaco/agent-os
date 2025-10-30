#!/usr/bin/env node

import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync, cpSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const PROFILES_DIR = join(REPO_ROOT, 'profiles', 'default');

/**
 * Convert template syntax to Copilot format
 */
function convertTemplateForCopilot(content, commandPath = '') {
  let converted = content;
  
  // Convert {{workflows/path}} to #file:.agent-os/workflows/path.md
  converted = converted.replace(/\{\{workflows\/([^}]+)\}\}/g, (_, path) => {
    return `#file:.agent-os/workflows/${path}.md`;
  });
  
  // Convert {{standards/global/*}} to #file:.agent-os/standards/global/*.md
  converted = converted.replace(/\{\{standards\/([^}]+)\}\}/g, (_, path) => {
    return `#file:.agent-os/standards/${path}.md`;
  });
  
  // Convert @agent-os/commands/path/file.md to #file:.agent-os/commands/path/file.md
  // (numbered files stay as .md, they'll be converted during copy)
  converted = converted.replace(/@agent-os\/commands\/([^}\s]+\.md)/g, (_, path) => {
    return `#file:.agent-os/commands/${path}`;
  });
  
  // Strip {{UNLESS}}...{{ENDUNLESS}} blocks
  converted = converted.replace(/\{\{UNLESS[^}]*\}\}[\s\S]*?\{\{ENDUNLESS[^}]*\}\}/g, '');
  
  // Strip {{PHASE X: ...}} wrappers but keep the file reference
  converted = converted.replace(/\{\{PHASE \d+: ([^}]+)\}\}/g, '$1');
  
  return converted.trim();
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      cpSync(srcPath, destPath);
    }
  }
}

/**
 * Convert and copy command files
 */
function convertCommands(projectRoot) {
  const commandsSourceDir = join(PROFILES_DIR, 'commands');
  const commandsDestDir = join(projectRoot, '.agent-os', 'commands');
  
  const commandDirs = ['plan-product', 'shape-spec', 'write-spec', 'create-tasks', 'implement-tasks'];
  
  for (const cmdDir of commandDirs) {
    const singleAgentDir = join(commandsSourceDir, cmdDir, 'single-agent');
    if (!existsSync(singleAgentDir)) continue;
    
    const destDir = join(commandsDestDir, cmdDir);
    mkdirSync(destDir, { recursive: true });
    
    const files = readdirSync(singleAgentDir);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const sourcePath = join(singleAgentDir, file);
      const content = readFileSync(sourcePath, 'utf8');
      const converted = convertTemplateForCopilot(content, cmdDir);
      
      // Only add .prompt.md to main orchestrator files (not numbered ones)
      const isMainFile = !file.match(/^\d+-/);
      const destFileName = isMainFile ? file.replace(/\.md$/, '.prompt.md') : file;
      const destPath = join(destDir, destFileName);
      
      writeFileSync(destPath, converted, 'utf8');
    }
  }
}

/**
 * Create or update VS Code settings
 */
function updateVSCodeSettings(projectRoot) {
  const vscodeDir = join(projectRoot, '.vscode');
  const settingsPath = join(vscodeDir, 'settings.json');
  
  mkdirSync(vscodeDir, { recursive: true });
  
  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      const content = readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(content);
    } catch (error) {
      console.warn('Warning: Could not parse existing settings.json, creating new one');
    }
  }
  
  // Add Copilot prompt files configuration
  settings['chat.promptFilesLocations'] = {
    '.agent-os/commands/**/*.prompt.md': true
  };
  
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
}

/**
 * Install Agent OS for GitHub Copilot
 */
function installForCopilot(projectRoot) {
  console.log('📦 Installing Agent OS for GitHub Copilot...\n');
  
  const agentOsDir = join(projectRoot, '.agent-os');
  
  // Create directory structure
  console.log('Creating .agent-os directory structure...');
  mkdirSync(join(agentOsDir, 'commands'), { recursive: true });
  mkdirSync(join(agentOsDir, 'workflows'), { recursive: true });
  mkdirSync(join(agentOsDir, 'standards'), { recursive: true });
  
  // Copy standards (no conversion needed)
  console.log('Copying standards...');
  const standardsSource = join(PROFILES_DIR, 'standards');
  const standardsDest = join(agentOsDir, 'standards');
  copyDirectory(standardsSource, standardsDest);
  
  // Copy workflows (no conversion needed)
  console.log('Copying workflows...');
  const workflowsSource = join(PROFILES_DIR, 'workflows');
  const workflowsDest = join(agentOsDir, 'workflows');
  copyDirectory(workflowsSource, workflowsDest);
  
  // Convert and copy commands
  console.log('Converting command files to .prompt.md format...');
  convertCommands(projectRoot);
  
  // Update VS Code settings
  console.log('Configuring VS Code settings...');
  updateVSCodeSettings(projectRoot);
  
  console.log('\n✅ Agent OS installed successfully!\n');
  console.log('📝 Available prompts:');
  console.log('  - plan-product.prompt.md - Plan and document product mission and roadmap');
  console.log('  - shape-spec.prompt.md - Shape feature specifications');
  console.log('  - write-spec.prompt.md - Write detailed specifications');
  console.log('  - create-tasks.prompt.md - Create implementation tasks');
  console.log('  - implement-tasks.prompt.md - Execute implementation tasks\n');
  console.log('💡 Use these prompts in GitHub Copilot Chat by referencing:');
  console.log('   #file:.agent-os/commands/[command-name].prompt.md\n');
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Check for init command
  if (args[0] !== 'init') {
    console.log('Usage: agent-os init [--github-copilot]');
    console.log('\nOptions:');
    console.log('  --github-copilot    Install for GitHub Copilot');
    process.exit(1);
  }
  
  // Check for GitHub Copilot flag
  const isGitHubCopilot = args.includes('--github-copilot') || args.includes('--copilot');
  
  if (!isGitHubCopilot) {
    console.error('Error: Only GitHub Copilot is currently supported.');
    console.error('Please use: agent-os init --github-copilot');
    process.exit(1);
  }
  
  const projectRoot = process.cwd();
  
  try {
    installForCopilot(projectRoot);
    process.exit(0);
  } catch (error) {
    console.error('Error installing Agent OS:', error.message);
    process.exit(1);
  }
}

// Export for testing
export { convertTemplateForCopilot, copyDirectory, convertCommands, updateVSCodeSettings, installForCopilot, main };

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

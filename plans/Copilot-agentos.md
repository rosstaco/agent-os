# GitHub Copilot Integration Plan for Agent OS

> Plan Created: 2025-10-02
> Status: Planning Phase
> Target: Add GitHub Copilot as a supported AI coding agent alongside Claude Code and Cursor

## Executive Summary

This plan outlines the integration of GitHub Copilot support into Agent OS. Unlike Claude Code (which uses custom commands) and Cursor (which uses `.mdc` rules), GitHub Copilot uses **custom pr### New (GitHub Copilot)
```
project/
├── .github/
│   └── prompts/
│       ├── plan-product.prompt.md      (generated from commands/plan-product.md)
│       ├── create-spec.prompt.md       (generated from commands/create-spec.md)
│       ├── execute-tasks.prompt.md     (generated from commands/execute-tasks.md)
│       └── ...
└── .agent-os/
    ├── instructions/
    ├── standards/
    └── ...
```

**Note**: Copilot prompts are generated on-the-fly during installation by converting existing command files. in `.github/prompts/` with the `.prompt.md` extension.

## Key Architectural Decisions

### 1. Prompt File Structure
- **Source**: Existing `commands/*.md` files in the Agent OS repository
- **Destination**: `.github/prompts/` (in project directories)
- **Format**: Individual `.prompt.md` files (e.g., `plan-product.prompt.md`, `create-spec.prompt.md`)
- **Installation Method**: Transform command files on-the-fly during installation (no separate Copilot directory needed)

### 2. File Reference Syntax Conversion
All file references must be converted from Agent OS syntax to Copilot syntax:

| Current Syntax | Copilot Syntax |
|----------------|----------------|
| `@.agent-os/instructions/core/plan-product.md` | `#file:.agent-os/instructions/core/plan-product.md` |
| `@.agent-os/product/mission-lite.md` | `#file:.agent-os/product/mission-lite.md` |
| `@.claude/CLAUDE.md` | `#file:.claude/CLAUDE.md` |

### 3. Subagent to Tool Mapping
Subagent calls in Claude Code must be replaced with Copilot tool equivalents:

| Claude Subagent | Purpose | Copilot Tool/Approach |
|-----------------|---------|----------------------|
| `context-fetcher` | Retrieve and extract information from files | `semantic_search` or `read_file` |
| `file-creator` | Create new files and directories | `create_file` or `create_directory` |
| `git-workflow` | Manage git branches and commits | `run_terminal` with git commands |
| `date-checker` | Get current date | `run_terminal` with `date` command |
| `project-manager` | Track task completion | `read_file` + `replace_string_in_file` |
| `test-runner` | Execute tests | `run_terminal` with test commands |

### 4. Instruction Adaptation Strategy
Instructions should remain **agent-agnostic** where possible:
- Keep structured XML-like tags (Copilot can parse these)
- Remove explicit subagent directives
- Use descriptive language that guides Copilot to use appropriate tools
- Maintain the workflow steps and templates

## Implementation Plan

### Phase 1: Configuration & Structure

#### Task 1.1: Update config.yml
**File**: `config.yml`

Add GitHub Copilot to the agents configuration:

```yaml
agents:
  claude_code:
    enabled: false
  cursor:
    enabled: false
  github_copilot:
    enabled: false
```

#### Task 1.2: Verify Command Files Exist
**Action**: Ensure all command files exist in `commands/` directory

**Required files** (already exist):
- `commands/plan-product.md`
- `commands/create-spec.md`
- `commands/create-tasks.md`
- `commands/execute-tasks.md`
- `commands/analyze-product.md`

**Note**: No separate Copilot directory needed - these files will be transformed during installation.

### Phase 2: Conversion Functions

#### Task 2.1: Add Copilot Conversion Function
**File**: `setup/functions.sh`

Add new function:

```bash
# Function to convert command file to Copilot .prompt.md format
convert_to_copilot_prompt() {
    local source="$1"
    local dest="$2"
    
    if [ -f "$dest" ]; then
        echo "  ⚠️  $(basename $dest) already exists - skipping"
    else
        # Read the source file and perform conversions
        sed 's/@\([^ ]*\.md\)/#file:\1/g' "$source" | \
        sed 's/subagent="context-fetcher"/tool="semantic_search or read_file"/g' | \
        sed 's/subagent="file-creator"/tool="create_file or create_directory"/g' | \
        sed 's/subagent="git-workflow"/tool="run_terminal with git commands"/g' | \
        sed 's/subagent="date-checker"/tool="run_terminal with date command"/g' | \
        sed 's/subagent="project-manager"/tool="read_file and replace_string_in_file"/g' | \
        sed 's/subagent="test-runner"/tool="run_terminal with test commands"/g' | \
        sed 's/Use the [a-z-]* subagent to/Use tools to/g' > "$dest"
        
        echo "  ✓ $(basename $dest)"
    fi
}
```

**Conversion Rules**:
1. **File References**: Replace all `@` file references with `#file:` syntax
2. **Subagent Directives**: Replace subagent attributes with tool suggestions
3. **Action Phrases**: Convert "Use the X subagent to" → "Use tools to"
4. **Preserve Structure**: Keep all XML-like tags and templates intact

### Phase 3: Installer Updates

#### Task 3.1: Update base.sh
**File**: `setup/base.sh`

**Changes Required**:

1. Add `--github-copilot` flag to argument parser (around line 17-60):
```bash
GITHUB_COPILOT=false

# In the while loop:
--github-copilot|--copilot)
    GITHUB_COPILOT=true
    shift
    ;;
```

2. Update help message to include `--github-copilot` option

3. Add GitHub Copilot configuration update (after line 130):
```bash
# Handle GitHub Copilot installation
if [ "$GITHUB_COPILOT" = true ]; then
    echo ""
    echo "📥 Enabling GitHub Copilot support..."

    # Update config to enable github_copilot
    if [ -f "$INSTALL_DIR/config.yml" ]; then
        sed -i.bak '/github_copilot:/,/enabled:/ s/enabled: false/enabled: true/' "$INSTALL_DIR/config.yml" && rm "$INSTALL_DIR/config.yml.bak"
        echo "  ✓ GitHub Copilot enabled in configuration"
    fi
    
    echo ""
    echo "  ℹ️  Copilot prompts will be generated from command files during project installation"
fi
```

4. Update success message to mention GitHub Copilot support if enabled

**Note**: No files are downloaded to base installation for Copilot - prompts are generated on-the-fly during project installation from existing command files.

#### Task 3.2: Update project.sh
**File**: `setup/project.sh`

**Changes Required**:

1. Add `--github-copilot` flag to argument parser (around line 8-60):
```bash
GITHUB_COPILOT=false

# In the while loop:
--github-copilot|--copilot)
    GITHUB_COPILOT=true
    shift
    ;;
```

2. Auto-enable GitHub Copilot from base config (around line 110-125):
```bash
if [ "$GITHUB_COPILOT" = false ]; then
    # Check if github_copilot is enabled in base config
    if grep -q "github_copilot:" "$BASE_AGENT_OS/config.yml" && \
       grep -A1 "github_copilot:" "$BASE_AGENT_OS/config.yml" | grep -q "enabled: true"; then
        GITHUB_COPILOT=true
        echo "  ✓ Auto-enabling GitHub Copilot support (from Agent OS config)"
    fi
fi
```

3. Add GitHub Copilot installation section (after Cursor section, around line 270):
```bash
# Handle GitHub Copilot installation for project
if [ "$GITHUB_COPILOT" = true ]; then
    echo ""
    echo "📥 Installing GitHub Copilot support..."
    mkdir -p "./.github/prompts"

    if [ "$IS_FROM_BASE" = true ]; then
        # Convert command files from base installation
        echo "  📂 Converting commands to prompts:"
        for cmd in plan-product create-spec create-tasks execute-tasks analyze-product; do
            if [ -f "$BASE_AGENT_OS/commands/${cmd}.md" ]; then
                convert_to_copilot_prompt "$BASE_AGENT_OS/commands/${cmd}.md" \
                    "./.github/prompts/${cmd}.prompt.md"
            else
                echo "  ⚠️  Warning: ${cmd}.md not found in base installation"
            fi
        done
    else
        # Download from GitHub and convert when using --no-base
        echo "  📂 Downloading and converting commands to prompts:"
        for cmd in plan-product create-spec create-tasks execute-tasks analyze-product; do
            TEMP_FILE="/tmp/${cmd}.md"
            curl -s -o "$TEMP_FILE" "${BASE_URL}/commands/${cmd}.md"
            if [ -f "$TEMP_FILE" ]; then
                convert_to_copilot_prompt "$TEMP_FILE" "./.github/prompts/${cmd}.prompt.md"
                rm "$TEMP_FILE"
            fi
        done
    fi
fi
```

4. Update success message (around line 280-310):
```bash
if [ "$GITHUB_COPILOT" = true ]; then
    echo "   .github/prompts/           - GitHub Copilot custom prompts"
fi

# In the next steps section:
if [ "$GITHUB_COPILOT" = true ]; then
    echo "GitHub Copilot usage:"
    echo "  Use @workspace prompts or reference prompt files in chat:"
    echo "  - #file:.github/prompts/plan-product.prompt.md"
    echo "  - #file:.github/prompts/create-spec.prompt.md"
    echo "  - #file:.github/prompts/execute-tasks.prompt.md"
    echo ""
fi
```

### Phase 4: Test Conversion Function

#### Task 4.1: Validate Conversion Logic

Test the `convert_to_copilot_prompt()` function to ensure it correctly:

1. **Converts file references**: `@filename` → `#file:filename`
2. **Replaces subagent attributes**: `subagent="name"` → `tool="description"`
3. **Updates action phrases**: "Use the X subagent to" → "Use tools to"
4. **Preserves structure**: All XML-like tags and content remain intact

#### Task 4.2: Expected Conversion Examples

The conversion function should transform existing command files like this:

**Input** (`commands/plan-product.md`):
```markdown
# Plan Product

Plan a new product and install Agent OS in its codebase.

Refer to the instructions located in this file:
@.agent-os/instructions/core/plan-product.md
```

**Output** (`.github/prompts/plan-product.prompt.md`):
```markdown
# Plan Product

Plan a new product and install Agent OS in its codebase.

Refer to the instructions located in this file:
#file:.agent-os/instructions/core/plan-product.md
```

**Note**: The conversion happens automatically during project installation. No manual prompt file creation needed.

### Phase 5: Instruction File Optimization

#### Task 5.1: Review Core Instructions

Review each file in `instructions/core/` to ensure compatibility with Copilot:

**Files to review**:
- `plan-product.md`
- `create-spec.md`
- `create-tasks.md`
- `execute-tasks.md`
- `execute-task.md`
- `analyze-product.md`
- `post-execution-tasks.md`

**Review Criteria**:
1. Are subagent references generic enough that Copilot can interpret them?
2. Do file references need to be duplicated with `#file:` syntax?
3. Are the step-by-step instructions clear without agent-specific context?

**Strategy**: Keep instructions **agent-agnostic** but acknowledge that:
- Claude Code will use subagents as specified
- Cursor will read the instructions directly
- Copilot will interpret subagent calls as tool usage suggestions

#### Task 5.2: Optional Copilot-Specific Instructions

If needed, create Copilot-specific versions in a new directory:
- `instructions/copilot/` (optional, only if significant differences needed)

This is **NOT recommended** unless testing shows Copilot struggles with the existing instruction format.

### Phase 6: Documentation Updates

#### Task 6.1: Update README.md

Add GitHub Copilot to the "Use it with" section:

```markdown
Use it with:

✅ Claude Code, Cursor, GitHub Copilot, or any other AI coding tool.
```

Add a new section for Copilot usage:

```markdown
### Using with GitHub Copilot

After installation with the `--github-copilot` flag, your project will have custom prompts in `.github/prompts/`:

**Available Prompts**:
- `plan-product.prompt.md` - Plan a new product
- `analyze-product.prompt.md` - Analyze an existing product
- `create-spec.prompt.md` - Create feature specifications
- `execute-tasks.prompt.md` - Execute spec tasks

**Usage**:
In GitHub Copilot chat, reference prompts using:
```
#file:.github/prompts/plan-product.prompt.md
```

Or use @workspace to discuss the prompts naturally:
```
@workspace Let's plan a new product using the plan-product prompt
```
```

#### Task 6.2: Update Installation Instructions

Add Copilot flag to installation examples:

```bash
# Base installation with GitHub Copilot support
curl -sSL https://raw.githubusercontent.com/rosstaco/agent-os/main/setup/base.sh | bash -s -- --github-copilot

# Project installation with GitHub Copilot support
~/.agent-os/setup/project.sh --github-copilot
```

### Phase 7: Testing & Validation

#### Task 7.1: Test Conversion Function
- Verify file reference conversion (`@` → `#file:`)
- Verify subagent replacement works correctly
- Test with sample command files

#### Task 7.2: Test Installation Scripts
- Test `base.sh` with `--github-copilot` flag
- Test `project.sh` with `--github-copilot` flag
- Test installation from base (with config auto-enable)
- Test installation with `--no-base` (GitHub direct)

#### Task 7.3: Test Copilot Integration
- Install Agent OS with Copilot support in a test project
- Reference prompt files in Copilot chat
- Verify Copilot can read and understand the prompts
- Test `#file:` references work in context
- Validate tool usage is appropriate

## File Structure Comparison

### Current (Claude Code)
```
project/
├── .claude/
│   ├── commands/
│   │   ├── plan-product.md
│   │   ├── create-spec.md
│   │   ├── execute-tasks.md
│   │   └── ...
│   └── agents/
│       ├── context-fetcher.md
│       ├── file-creator.md
│       └── ...
└── .agent-os/
    ├── instructions/
    ├── standards/
    └── ...
```

### Current (Cursor)
```
project/
├── .cursor/
│   └── rules/
│       ├── plan-product.mdc
│       ├── create-spec.mdc
│       ├── execute-tasks.mdc
│       └── ...
└── .agent-os/
    ├── instructions/
    ├── standards/
    └── ...
```

### New (GitHub Copilot)
```
project/
├── .github/
│   └── prompts/
│       ├── plan-product.prompt.md
│       ├── create-spec.prompt.md
│       ├── execute-tasks.prompt.md
│       └── ...
└── .agent-os/
    ├── instructions/
    ├── standards/
    └── ...
```

## Conversion Reference

### File Reference Examples

**Before**:
```markdown
Refer to the instructions located in this file:
@.agent-os/instructions/core/plan-product.md

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<data_sources>
  <primary>user_direct_input</primary>
  <fallback_sequence>
    1. @.agent-os/standards/tech-stack.md
    2. @.claude/CLAUDE.md
    3. Cursor User Rules
  </fallback_sequence>
</data_sources>
```

**After**:
```markdown
Refer to the instructions located in this file:
#file:.agent-os/instructions/core/plan-product.md

<pre_flight_check>
  EXECUTE: #file:.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<data_sources>
  <primary>user_direct_input</primary>
  <fallback_sequence>
    1. #file:.agent-os/standards/tech-stack.md
    2. #file:.claude/CLAUDE.md
    3. Cursor User Rules
  </fallback_sequence>
</data_sources>
```

### Subagent Conversion Examples

**Before**:
```markdown
<step number="1" subagent="context-fetcher" name="gather_user_input">

### Step 1: Gather User Input

Use the context-fetcher subagent to collect all required inputs from the user.
```

**After**:
```markdown
<step number="1" tool="semantic_search or read_file" name="gather_user_input">

### Step 1: Gather User Input

Use tools to collect all required inputs from the user.
```

**Before**:
```markdown
<step number="5" subagent="file-creator" name="spec_folder_creation">

### Step 5: Spec Folder Creation

Use the file-creator subagent to create directory: .agent-os/specs/YYYY-MM-DD-spec-name/
```

**After**:
```markdown
<step number="5" tool="create_file or create_directory" name="spec_folder_creation">

### Step 5: Spec Folder Creation

Use tools to create directory: .agent-os/specs/YYYY-MM-DD-spec-name/
```

**Before**:
```markdown
<step number="3" subagent="git-workflow" name="git_branch_management">

### Step 3: Git Branch Management

Use the git-workflow subagent to manage git branches.
```

**After**:
```markdown
<step number="3" tool="run_terminal with git commands" name="git_branch_management">

### Step 3: Git Branch Management

Use tools to manage git branches.
```

## Implementation Checklist

### Phase 1: Configuration & Structure
- [ ] Update `config.yml` with `github_copilot` agent option
- [ ] Verify all command files exist in `commands/` directory (already exist)

### Phase 2: Conversion Functions
- [ ] Add `convert_to_copilot_prompt()` function to `functions.sh`
- [ ] Test file reference conversion (`@` → `#file:`)
- [ ] Test subagent replacement
- [ ] Validate conversion output

### Phase 3: Installer Updates
- [ ] Add `--github-copilot` flag to `base.sh`
- [ ] Add GitHub Copilot config enable to `base.sh`
- [ ] Update `base.sh` help and success messages
- [ ] Add `--github-copilot` flag to `project.sh`
- [ ] Add GitHub Copilot auto-enable from config in `project.sh`
- [ ] Add GitHub Copilot prompt conversion section to `project.sh`
- [ ] Update `project.sh` success messages

### Phase 4: Test Conversion Function
- [ ] Test conversion with sample command files
- [ ] Verify file reference conversion works
- [ ] Verify subagent replacement works
- [ ] Validate output format is correct

### Phase 5: Instruction Optimization
- [ ] Review all `instructions/core/*.md` files
- [ ] Verify XML-like structure works with Copilot
- [ ] Test prompt file references in Copilot
- [ ] Validate tool usage interpretations

### Phase 6: Documentation
- [ ] Update README.md with Copilot support
- [ ] Add Copilot usage examples
- [ ] Update installation instructions
- [ ] Add Copilot-specific notes

### Phase 7: Testing
- [ ] Test base installation with `--github-copilot`
- [ ] Test project installation with `--github-copilot`
- [ ] Test auto-enable from config
- [ ] Test `--no-base` GitHub direct installation
- [ ] Test prompt files in actual Copilot usage
- [ ] Validate `#file:` references work
- [ ] Verify tool usage is appropriate

## Success Criteria

1. ✅ Users can install Agent OS with `--github-copilot` flag
2. ✅ Prompt files are created in `.github/prompts/` directory
3. ✅ All `@` file references are converted to `#file:` syntax
4. ✅ Subagent calls are replaced with tool suggestions
5. ✅ GitHub Copilot can read and understand the prompt files
6. ✅ File references work correctly in Copilot's context
7. ✅ Instructions remain agent-agnostic where possible
8. ✅ Documentation clearly explains Copilot usage

## Notes & Considerations

### Why Transform on Installation?

Rather than maintaining separate Copilot-specific files in the repository, we transform the existing `commands/*.md` files during installation. This approach:

1. **Reduces duplication**: Single source of truth for command definitions
2. **Simplifies maintenance**: Updates to commands automatically apply to all agents
3. **Keeps it DRY**: No need to keep multiple versions in sync
4. **Leverages existing structure**: Commands already exist and work well

### Why Individual Prompt Files?

GitHub Copilot's custom prompt feature works best with individual `.prompt.md` files that can be referenced separately. This aligns with the modular command structure already used in Agent OS.

### File Reference Syntax

The `#file:` syntax is Copilot's native way to reference files. Converting from `@` ensures Copilot can correctly load context files during execution.

### Tool vs. Subagent Philosophy

- **Claude Code**: Uses specialized subagents (custom agents with specific roles)
- **Cursor**: Reads rules directly and executes with available tools
- **GitHub Copilot**: Has built-in tools and interprets instructions to use them

The conversion from "subagent" to "tool" with suggested tool names helps Copilot understand which of its capabilities to use.

### Maintaining Agent-Agnostic Instructions

The core instruction files should remain as agent-agnostic as possible:
- Keep structured XML-like tags (useful for all agents)
- Use descriptive language about what needs to happen
- Let each agent interpret HOW to accomplish the steps
- Avoid agent-specific implementation details in core instructions

### Future Enhancements

Consider adding:
1. Copilot-specific tips in prompt files
2. Context size optimization for Copilot's limits
3. Prompt chaining strategies for complex workflows
4. Integration with GitHub Copilot Workspace features

## Appendix: Complete Subagent Mapping

| Subagent | Responsibility | Copilot Tool(s) | Notes |
|----------|---------------|-----------------|-------|
| `context-fetcher` | Retrieve information from docs | `semantic_search`, `read_file`, `grep_search` | Use semantic_search for concept finding, read_file for specific content |
| `file-creator` | Create files and directories | `create_file`, `create_directory` | Copilot creates directories automatically with create_file |
| `git-workflow` | Git operations | `run_terminal` | Execute git commands: branch, commit, merge, etc. |
| `date-checker` | Get current date | `run_terminal` | Run `date +%Y-%m-%d` |
| `project-manager` | Update task status | `read_file`, `replace_string_in_file`, `multi_replace_string_in_file` | Read tasks, update checkboxes, write recaps |
| `test-runner` | Run tests | `run_terminal` | Execute test commands based on project type |

## References

- Agent OS Documentation: https://buildermethods.com/agent-os
- GitHub Copilot Custom Prompts: https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot
- GitHub Copilot File References: https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide

#### Compile Implementation Standards

Use the following logic to compile a list of file references to standards that should guide implementation:

##### Steps to Compile Standards List

1. Find the current task group in `orchestration.yml`
2. Check the list of `standards` specified for this task group in `orchestration.yml`
3. Compile the list of file references to those standards, one file reference per line, using this logic for determining which files to include:
   a. If the value for `standards` is simply `all`, then include every single file, folder, sub-folder and files within sub-folders in your list of files.
   b. If the item under standards ends with "*" then it means that all files within this folder or sub-folder should be included. For example, `frontend/*` means include all files and sub-folders and their files located inside of `agent-os/standards/frontend/`.
   c. If a file ends in `.md` then it means this is one specific file you must include in your list of files. For example `backend/api.md` means you must include the file located at `agent-os/standards/backend/api.md`.
   d. De-duplicate files in your list of file references.

##### Output Format

The compiled list of standards should look something like this, where each file reference is on its own line and begins with `@`. The exact list of files will vary:

```
@agent-os/standards/global/coding-style.md
@agent-os/standards/global/conventions.md
@agent-os/standards/global/tech-stack.md
@agent-os/standards/backend/api/authentication.md
@agent-os/standards/backend/api/endpoints.md
@agent-os/standards/backend/api/responses.md
@agent-os/standards/frontend/css.md
@agent-os/standards/frontend/responsive.md
```

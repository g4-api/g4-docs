# TFVC Package Manager (PowerShell) — User Guide

> A lightweight, Git-style workflow for TFVC modules: **install**, **restore**, **update**, **remove** — deterministic and CI-friendly.

---

## Table of Contents

* [1. What is this?](#1-what-is-this)
* [2. Key Features](#2-key-features)
* [3. Prerequisites](#3-prerequisites)
* [4. Installation](#4-installation)
* [5. Quick Start](#5-quick-start)

  * [5.1 Create `config-specification.json`](#51-create-config-specificationjson)
  * [5.2 Run your first commands](#52-run-your-first-commands)
* [6. Configuration File (Deep Dive)](#6-configuration-file-deep-dive)

  * [6.1 Top-level fields](#61-top-level-fields)
  * [6.2 `modules[]` fields](#62-modules-fields)
  * [6.3 How mappings are built](#63-how-mappings-are-built)
  * [6.4 Version resolution rules](#64-version-resolution-rules)
* [7. Commands & Usage](#7-commands--usage)

  * [7.1 Common parameters](#71-common-parameters)
  * [7.2 `Install`](#72-install)
  * [7.3 `Restore`](#73-restore)
  * [7.4 `Update`](#74-update)
  * [7.5 `Remove`](#75-remove)
  * [7.6 `Help`](#76-help)
* [8. How It Works (High-Level)](#8-how-it-works-high-level)

  * [8.1 Workspaces & naming](#81-workspaces--naming)
  * [8.2 Mapping & getting files](#82-mapping--getting-files)
  * [8.3 The lockfile](#83-the-lockfile)
  * [8.4 CI cleanup](#84-ci-cleanup)
* [9. Usage Scenarios](#9-usage-scenarios)
* [10. CI/CD Integration Examples](#10-cicd-integration-examples)
* [11. Troubleshooting](#11-troubleshooting)
* [12. FAQ](#12-faq)
* [13. Appendix](#13-appendix)

---

## 1. What is this?

A PowerShell script that treats TFVC content like a small dependency graph. You declare TFVC **modules** in a JSON manifest, then run simple commands to map/get specific versions, lock them for reproducibility, and tear everything down cleanly in CI.

## 2. Key Features

* **Four commands**: `install`, `restore`, `update`, `remove` (+ `help`).
* **Deterministic**: maintains a lockfile with the exact `resolvedChangeset` for each module.
* **Version flexibility**: supports `C123`, plain numbers `123`, labels `Lmylabel`/`label`, dates `Dyyyy-mm-dd`, and `T` (tip).
* **Multi-collection**: modules may come from different TFVC collections in one run.
* **CI-friendly**: non-interactive (`/noprompt`), creates ephemeral workspaces in CI and removes them after the run.
* **Predictable layout**: all local mappings live under a single `defaultWorkspace` root, separated by collection.

## 3. Prerequisites

* Windows with **PowerShell 5+** or **PowerShell 7+**.
* **tf.exe** available on PATH (e.g., Visual Studio / Team Explorer, Azure DevOps Server client tools). Run `tf /?` to verify.
* Access to your TFVC collection(s) and paths with sufficient permissions.

## 4. Installation

No module packaging required. Keep the script in your repo (e.g., `./tools/TfvcPackageManager.ps1`).

Typical invocation:

```powershell
# From your repo root
pwsh ./tools/TfvcPackageManager.ps1 -Command install
```

You can also use Windows PowerShell:

```powershell
powershell ./tools/TfvcPackageManager.ps1 -Command install
```

---

## 5. Quick Start

### 5.1 Create `config-specification.json`

Start with a minimal manifest that declares your TFVC collection(s), workspace root, and modules. Example:

```json
{
    "defaultCollection": "http://desktop-6o5gjpr:8086/DefaultCollection",
    "defaultWorkspace": "E:\\Development\\package-manager-tf\\workspaces",
    "modules": [
        {
            "name": "common-file",
            "collection": "http://desktop-6o5gjpr:8086/Common",
            "serverPath": "$/common-code/common-file.md",
            "localPath": "common\\common-file.md",
            "version": "T"
        },
        {
            "name": "another-common-file",
            "collection": "http://desktop-6o5gjpr:8086/Common",
            "serverPath": "$/common-code/another-common-file.md",
            "localPath": "common\\another-common-file.md",
            "label": "Release-7.0"
        },
        {
            "name": "main-repo",
            "serverPath": "$/main-repo",
            "localPath": "main-repo",
            "version": "T"
        }
    ]
}
```

### 5.2 Run your first commands

```powershell
# 1) Install (map & get) everything defined in the manifest
pwsh ./tools/TfvcPackageManager.ps1 -Command install

# 2) Update one module to a new version/label in the manifest, then refresh lockfile
pwsh ./tools/TfvcPackageManager.ps1 -Command update -Name common-file

# 3) Restore all modules to the exact changesets pinned in the lockfile
pwsh ./tools/TfvcPackageManager.ps1 -Command restore

# 4) Remove mappings and delete local folders (careful!)
pwsh ./tools/TfvcPackageManager.ps1 -Command remove
```

> Tip: Add `-Mode CI` to force CI behavior locally (ephemeral workspaces), or leave `-Mode Auto` (default) and it will detect CI by environment variables.

---

## 6. Configuration File (Deep Dive)

The manifest drives everything. Place it at `./config-specification.json` (default) or pass `-ManifestPath`.

### 6.1 Top-level fields

* **`defaultCollection`** *(string, required)*: Fallback collection URL used when a module doesn’t specify `collection`.
* **`defaultWorkspace`** *(string, required)*: Absolute folder where all TF operations and local mappings live. The script executes `tf` from here and places per-collection subfolders beneath it.

### 6.2 `modules[]` fields

Each entry describes one TFVC-backed unit you want on disk.

* **`name`** *(string, required)*: Friendly identifier (unique within the manifest). Used for filtering via `-Name`.
* **`collection`** *(string, optional)*: Collection URL for this module. If omitted, `defaultCollection` is used.
* **`serverPath`** *(string, required)*: TFVC path (e.g., `$/Project/Folder` or a single file).
* **`localPath`** *(string, required)*: Relative path under the module’s collection folder inside `defaultWorkspace`. You can point to a folder (recommended) or a specific file path if you only need one file.
* **`version`** *(string/number, optional)*: Target version. If numeric `123`, it becomes `C123`. You can also provide `C123`, `T`, `D2025-09-01`, etc.
* **`label`** *(string, optional)*: A label to resolve if `version` is not provided.

> **Version priority:** `version` → `label` → `T` (tip/latest).

### 6.3 How mappings are built

For each module, the script computes the final local mapping like this:

1. Determine the **collection name**: the last segment of the collection URL (e.g., `http://host:8086/Common` → `Common`; `.../DefaultCollection` → `DefaultCollection`). If the module has no `collection`, the script uses `defaultCollection`.
2. Build the **workspace working folder**: `JoinPath(defaultWorkspace, <collectionName>)`. All `tf` commands for that module run from this folder.
3. Build the **module local mapping**: `JoinPath(defaultWorkspace, <collectionName>, module.localPath)`.
4. Ensure the **local directories** exist and then map: `tf workfold /map "$serverPath" "$localLocalPath"` in the computed workspace.

This keeps modules from different collections neatly separated under the same `defaultWorkspace` root:

```none
<defaultWorkspace>/
    DefaultCollection/
        main-repo/            <-- module.localPath
    Common/
        common/               <-- module.localPath
            common-file.md
        common/
            another-common-file.md
```

### 6.4 Version resolution rules

* If `version` is **numeric** (e.g., `123`), it is normalized to `C123`.
* If `version` already includes a prefix (`C`, `L`, `D`, `T`), it is used as-is.
* If `version` is omitted but **`label`** is set, it resolves `L<label>`.
* If both are omitted, the script uses **`T`** (latest).

The script always resolves your spec (label/date/T) to a concrete **changeset number** and saves it to the lockfile.

---

## 7. Commands & Usage

All commands are passed via `-Command <Name>`. Commands are **case-insensitive**.

### 7.1 Common parameters

* **`-ManifestPath`** *(string)*: Path to your manifest file. Default: `./config-specification.json`.
* **`-LockPath`** *(string)*: Path to the lockfile. Default: `./config-specification.lock.json`.
* **`-Name`** *(string)*: Process only the module with this name.
* **`-Mode`** *(Auto | Local | CI)*:

  * **Auto** *(default)*: Detect CI via environment (e.g., `TF_BUILD`, `GITHUB_ACTIONS`, `CI`). If found → `CI`, else `Local`.
  * **Local**: Uses a persistent workspace per collection.
  * **CI**: Creates ephemeral workspaces and removes them after the command completes.

> **Tip:** You can run `-Mode CI` locally to simulate CI behavior and verify reproducibility.

---

### 7.2 `Install`

**Purpose:** Map TFVC paths to your local filesystem and `tf get` to the desired versions. Also **writes/updates** the lockfile with the exact `resolvedChangeset` for each module.

**Use when:**

* First time setting up a repo.
* Adding a new module to the manifest.
* Switching machines and you want to populate dependencies.

**Examples:**

```powershell
# Install all modules
pwsh ./tools/TfvcPackageManager.ps1 -Command install

# Install only one module by name
pwsh ./tools/TfvcPackageManager.ps1 -Command install -Name common-file

# Force CI mode locally (ephemeral workspaces)
pwsh ./tools/TfvcPackageManager.ps1 -Command install -Mode CI
```

**What it does:**

1. For each module (filtered by `-Name` if provided), resolve its collection (module.collection or defaultCollection).
2. Create/confirm a workspace and local mapping.
3. Determine version spec (from `version`/`label` with the priority rules) and run `tf get`.
4. Resolve the actual changeset ID and write/update the lockfile.
5. If in `CI` mode, remove the ephemeral workspace(s) after completion.

---

### 7.3 `Restore`

**Purpose:** Make your working copy **match the lockfile exactly**. Reads each module’s `resolvedChangeset` and runs `tf get /version:C<changeset>`.

**Use when:**

* Reproducing a previous build or state.
* CI pipelines that require deterministic inputs.
* Onboarding a teammate to the exact versions your build expects.

**Examples:**

```powershell
# Restore everything pinned in the lockfile
pwsh ./tools/TfvcPackageManager.ps1 -Command restore

# Restore only a single module by name
pwsh ./tools/TfvcPackageManager.ps1 -Command restore -Name main-repo
```

**What it does:**

1. Reads the lockfile.
2. For each entry, confirms workspace/mapping.
3. Runs `tf get` to the exact pinned changeset.
4. Optionally tears down CI workspaces.

---

### 7.4 `Update`

**Purpose:** Re-evaluate versions/labels in the manifest, sync the working copy, and **refresh the lockfile** with the newly resolved changesets.

**Use when:**

* You’ve updated `version` or `label` for one or more modules in the manifest.
* You want to advance a module to a new tip or label and lock it.

**Examples:**

```powershell
# Update all modules per the manifest and refresh lockfile
pwsh ./tools/TfvcPackageManager.ps1 -Command update

# Update a single module
pwsh ./tools/TfvcPackageManager.ps1 -Command update -Name another-common-file
```

**What it does:**

1. For each module, compute the version spec from the manifest.
2. Run `tf get` to that spec.
3. Resolve the concrete changeset and upsert the lockfile entry.
4. Optionally tear down CI workspaces.

---

### 7.5 `Remove`

**Purpose:** Unmap server↔local mappings and **delete local directories**. In CI, also removes transient workspaces.

**Use when:**

* Cleaning a machine or pipeline workspace.
* Decommissioning a module.
* Ensuring no stale mappings remain.

**Examples:**

```powershell
# Remove all mappings and delete local folders
pwsh ./tools/TfvcPackageManager.ps1 -Command remove

# Remove only one module
pwsh ./tools/TfvcPackageManager.ps1 -Command remove -Name common-file
```

**What it does:**

1. Confirms the workspace.
2. Unmaps the server path.
3. Deletes the corresponding local directory.
4. In CI, removes ephemeral workspaces.

> ⚠️ **Destructive:** This deletes local directories under `defaultWorkspace/<collectionName>/<localPath>`.

---

### 7.6 `Help`

Prints a concise usage guide and version examples.

```powershell
pwsh ./tools/TfvcPackageManager.ps1 -Command help
```

---

## 8. How It Works (High-Level)

### 8.1 Workspaces & naming

The script creates **one workspace per collection** for the current run. Names are deterministic and differ between **Local** and **CI** (CI may include build IDs). This avoids collisions and makes cleanup straightforward.

### 8.2 Mapping & getting files

* Maps are created with `tf workfold /map` to the computed local path beneath `defaultWorkspace/<collectionName>`.
* Syncs happen with `tf get` from the collection working folder.

### 8.3 The lockfile

Written to `./config-specification.lock.json` by default. For each module it records the **exact** `resolvedChangeset` and associated metadata needed to **restore** deterministically.

**Example (simplified):**

```json
{
  "modules": [
    {
      "name": "common-file",
      "collection": "http://desktop-6o5gjpr:8086/Common",
      "serverPath": "$/common-code/common-file.md",
      "localPath": "common\\common-file.md",
      "resolvedChangeset": 1234
    }
  ]
}
```

### 8.4 CI cleanup

When running in `CI` mode (either auto-detected or forced), the script removes any workspaces it created, leaving the runner clean for the next job.

---

## 9. Usage Scenarios

* **Deterministic builds**: Commit the lockfile; pipelines run `restore` for pinned, reproducible inputs.
* **Advancing dependencies**: Update `version` or switch `label` in the manifest; run `update` to sync and refresh the lock.
* **Multi-collection estates**: Pull modules from several TFVC collections into one predictable local tree under `defaultWorkspace`.

---

## 10. CI/CD Integration Examples

**Azure DevOps (PowerShell\@2):**

```yaml
- task: PowerShell@2
  displayName: Install TFVC modules
  inputs:
    pwsh: true
    filePath: ./tools/TfvcPackageManager.ps1
    arguments: -Command install -Mode CI -ManifestPath ./config-specification.json -LockPath ./config-specification.lock.json
```

**GitHub Actions:**

```yaml
- name: Install TFVC modules
  shell: pwsh
  run: |
    ./tools/TfvcPackageManager.ps1 -Command install -Mode CI \
      -ManifestPath ./config-specification.json \
      -LockPath ./config-specification.lock.json
```

> Ensure `tf.exe` is available on the runner (e.g., pre-installed on your self-hosted agent or via a tool step).

---

## 11. Troubleshooting

* **`tf` not recognized**: Install Visual Studio / Team Explorer or Azure DevOps Server client tools; ensure `tf.exe` is on PATH.
* **“Path is already mapped”**: A previous workspace holds that mapping. Run `remove` (CI) or manually unmap/clean the workspace via `tf workfold /unmap` and `tf workspace /delete` as needed.
* **`$tf` folder appears**: TFVC client metadata. It’s safe to delete when you are done with that workspace, but prefer using `remove` to keep state consistent.
* **Permissions**: Verify your account can read the specified `serverPath`s.
* **Locked files**: Use `/overwrite` (the script already does) and ensure no external tool has the files open.

---

## 12. FAQ

**Q: Can I mix `version` and `label`?**
A: Yes, but if both are present, **`version` wins**. Use one per module to be explicit.

**Q: Can I specify a date?**
A: Yes. Use `Dyyyy-mm-dd` (e.g., `D2025-09-01`). The script resolves it to the latest changeset on/after that date.

**Q: Does the script modify TFVC history?**
A: No. It only maps folders and syncs content to your local machine.

**Q: Linux/Mac support?**
A: The workflow relies on `tf.exe` (Windows). Use Windows agents for CI.

**Q: Can `localPath` point to a file instead of a folder?**
A: Yes. Mapping to a single file path is supported if that’s all you need.

---

## 13. Appendix

### 13.1 Version spec cheat-sheet

* **`123`** → normalized to **`C123`** (changeset 123)
* **`C123`** → changeset 123
* **`LMyLabel`** / **`label: "MyLabel"`** → resolves to the changeset behind the label
* **`T`** → tip/latest
* **`D2025-09-01`** → latest changeset on/after that date

### 13.2 Command summaries

* **Install**: Map & get per manifest; write/refresh lockfile.
* **Restore**: Get to exact `resolvedChangeset`s from lockfile.
* **Update**: Re-resolve manifest versions/labels; sync; refresh lockfile.
* **Remove**: Unmap & delete local folders; CI also deletes workspaces.

### 13.3 Typical folder layout

```none
<repo>/
  tools/
    TfvcPackageManager.ps1
  config-specification.json
  config-specification.lock.json
  workspaces/  <-- defaultWorkspace (recommended outside repo if desired)
```

---

**You’re set!** Point your manifest at the TFVC content you need, then run `install` → `update` (to move forward) or `restore` (to reproduce exactly). `remove` keeps your machine and CI agents clean.

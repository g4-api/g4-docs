# MTM Execute → Run Pipeline

A Chrome / Edge extension that **mirrors the legacy VSTest execution experience** for **MSTest v2 and third-party test frameworks**, enabling **Select & Run** and **Run by Suites** directly from **Azure DevOps Test Plans (MTM)**—while remaining fully compatible with **cross-platform (Linux) CI/CD pipelines**.

This project exists to close a long-standing functional gap:

> **VSTest tasks support rich MTM execution scenarios that MSTest v2 and modern frameworks do not.**

---

## 📑 Table of Contents

* [Overview](#overview)
* [Problem Statement](#problem-statement)
* [Solution](#solution)
* [Execution Modes](#execution-modes)
* [Quick Start](#quick-start)
* [Required Test Mapping](#required-test-mapping)
* [Project Structure](#project-structure)
* [Browser Extension](#browser-extension)
* [Azure Pipelines](#azure-pipelines)
* [PowerShell Scripts](#powershell-scripts)
* [Security Considerations](#security-considerations)
* [Notes & Limitations](#notes--limitations)
* [License](#license)

---

## Overview

Azure DevOps historically provided rich **Test Plans execution** through the legacy **VSTest task**, including:

* Select & Run
* Run tests by Suite
* Automatic MTM test point updates
* Tight MTM ↔ pipeline integration

These capabilities are **not available** for:

* MSTest v2 / v3
* xUnit
* NUnit
* Other modern and cross-platform frameworks

As a result, teams must choose between:

* **Legacy VSTest** (Windows-only, deprecated path)
* **Modern frameworks** (no MTM execution parity)

This project removes that tradeoff.

---

## Problem Statement

| Capability                  | Legacy VSTest | MSTest v2 / Modern Frameworks |
| --------------------------- | ------------- | ----------------------------- |
| Select tests in MTM and run | Yes           | No                            |
| Run by Suites               | Yes           | No                            |
| Update MTM test points      | Yes           | No                            |
| Cross-platform agents       | No            | Yes                           |
| Modern CI/CD friendly       | No            | Yes                           |

---

## Solution

This extension **recreates the legacy VSTest execution model** using:

* Native MTM UI augmentation
* Explicit test case mapping
* Azure DevOps Pipelines REST API
* MSTest filters and standard `dotnet test`
* Cross-platform agents (Windows / Linux)

No VSTest task.
No Windows dependency.
No server components.

---

## Execution Modes

### 1️⃣ Select & Run

*(Legacy VSTest equivalent: **Run with options**)*

**Purpose**
Mirror the VSTest *“Run with options”* experience for MSTest v2 and third-party frameworks.

#### Pipeline

```none
pipelines/pipeline.yaml
```

#### Behavior

* User selects individual tests in MTM Execute
* Extension injects **Run for MSTest v2**
* User provides:

  * Branch
  * Agent pool
  * Environment
* Pipeline runs **only the selected tests**
* Results are published back to MTM

This enables true *ad-hoc MTM execution* without VSTest.

---

### 2️⃣ Run by Suites

*(Legacy VSTest equivalent: **Test by Suites**)*

**Purpose**
Provide a **CI/CD-grade replacement** for the legacy *Test by Suites* VSTest task.

#### Pipeline

```none
pipelines/pipeline-by-suites.yaml
```

#### Behavior

* Pipeline accepts **multiple test suites**
* Iterates suites sequentially
* Resolves test points per suite
* Executes tests per suite
* Updates MTM test points incrementally
* Publishes a **single merged test run**

This preserves the exact execution semantics expected from VSTest, while remaining:

* Deterministic
* Repeatable
* Cross-platform
* CI/CD friendly

---

## Quick Start

### 1️⃣ Create the Pipelines

Create one or both pipelines using:

```none
pipelines/pipeline.yaml
pipelines/pipeline-by-suites.yaml
```

Save the pipeline(s) and note the **numeric pipeline ID**, visible in the URL:

```none
/pipelines/123
```

---

### 2️⃣ Load the Extension

Load the extension unpacked from the `src` folder.

#### Chrome

```none
chrome://extensions
```

#### Edge

```none
edge://extensions
```

Steps:

1. Enable **Developer mode**
2. Click **Load unpacked**
3. Select the `src` folder

---

### 3️⃣ Configure the Extension

Open **Options / Settings** and configure:

* Azure DevOps organization URL
* Project name
* Pipeline ID
* Personal Access Token (PAT)
* Optional pipeline variables

Use **Test Connection** to validate access.

---

### 4️⃣ Execute from MTM

1. Azure DevOps → Test Plans → Plan → Suite → **Execute**
2. Select one or more tests
3. Open the **Run** menu
4. Click **Run for MSTest v2**
5. Provide runtime context
6. Run

---

## Required Test Mapping

### ❗ Mandatory (Legacy replacement)

Each automated test **must explicitly reference its Azure Test Case ID**.

```csharp
[TestMethod]
[TestProperty("AzureTestId", "1234")]
public void MyTest()
{
    // test logic
}
```

### What this replaces

This mapping **replaces the legacy VSTest “Associate test case” feature**.

### Why this is required

* MTM operates on **Test Case IDs**
* Modern frameworks do not understand MTM
* VSTest previously handled this association implicitly
* This attribute is now the explicit, framework-agnostic replacement

Without this mapping:

* Selected MTM tests cannot be resolved
* Suite execution cannot determine test points
* Results cannot be published back correctly

---

## Project Structure

```none
.
├── src/
│   ├── manifest.json
│   ├── html/
│   ├── css/
│   ├── js/
├── pipelines/
│   ├── pipeline.yaml
│   └── pipeline-by-suites.yaml
├── scripts/
│   ├── Format-MstestFilter.ps1
│   └── Update-MtmResults.ps1
└── README.md
```

---

## Browser Extension

### Content Script

* Detects MTM Execute page
* Injects native execution options
* Extracts selected tests and suites
* Displays runtime input dialog

### Background Script

* Performs authenticated REST calls
* Triggers Azure DevOps pipelines
* Passes execution context securely

### Options Page

* Stores configuration
* Validates connectivity
* Allows XPath customization for MTM UI changes

---

## Azure Pipelines

### `pipeline.yaml`

* Mirrors **VSTest “Run with options”**
* Supports:

  * Select & Run
  * Branch override
  * Agent pool selection
  * Environment targeting
  * Optional `.runsettings`

---

### `pipeline-by-suites.yaml`

* Mirrors **VSTest “Test by Suites”**
* Accepts **multiple suites**
* Iterates deterministically
* Updates MTM test points per suite
* Publishes a merged test run
* Designed for CI/CD automation

---

## PowerShell Scripts

### `Format-MstestFilter.ps1`

* Converts Azure Test Case IDs into MSTest filters
* Handles large selections safely
* Produces deterministic filters

### `Update-MtmResults.ps1`

* Updates MTM test points
* Publishes execution results
* Links pipeline runs back to MTM

---

## Security Considerations

* PAT stored locally in the browser profile
* No telemetry
* No third-party services
* Direct Azure DevOps REST API calls only

---

## Notes & Limitations

* MSTest v2+ focused (by design)
* XPath-based UI detection
* Branch selection is manual (auto-fetch planned)
* Explicit test mapping required (legacy parity)

---

## License

[MIT](LICENSE)

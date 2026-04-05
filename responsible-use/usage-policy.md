# Usage Policy

G4 is a general-purpose automation platform. It can operate browsers, mobile apps, desktop applications, HTTP APIs, and databases at scale — including across thousands of concurrent workers. That capability comes with responsibility.

This document describes how G4 is intended to be used and the boundaries that apply to all users, integrators, and operators of the platform.

---

## Intended Use Cases

G4 is built for legitimate automation work:

- **RPA and workflow automation** — automating repetitive tasks across internal systems, enterprise applications, and business processes
- **Test automation** — running functional, regression, and end-to-end tests across browsers, devices, and environments
- **Data extraction and ETL** — structured extraction of data from surfaces you own or have explicit permission to access
- **Quality assurance** — validating UI behavior, accessibility, and performance
- **Integration testing** — verifying that systems interact correctly across boundaries
- **AI agent tooling** — giving AI agents structured access to surfaces via G4 MCP, within the scope of authorized tasks

---

## Prohibited Uses

The following uses are not permitted under any circumstances:

### Unauthorized access

Do not use G4 to access systems, accounts, or data you are not authorized to access. Authorization must be explicit — terms of service, written permission, or ownership. Implicit authorization (e.g., "the site is publicly accessible") does not extend to automated access at scale.

### Circumventing security controls

Do not use G4 to bypass authentication systems, rate limiting, CAPTCHAs, bot detection, or other access controls. These controls exist to protect systems and their users. Circumventing them is prohibited regardless of whether the underlying data would otherwise be accessible.

### Credential stuffing and account takeover

Do not use G4 to test credential lists, brute-force accounts, or automate login attempts against systems you do not own or administer.

### Scraping in violation of terms of service

Many websites and APIs prohibit automated access in their terms of service. Violating those terms — regardless of technical feasibility — is a prohibited use. Review and comply with the terms of service of any system you target.

### Denial of service

Do not use G4's distributed execution capabilities to flood, overload, or degrade the availability of any system. High worker counts are intended for controlled, authorized workloads — not for generating traffic volume as an attack vector.

### Privacy violations

Do not use G4 to collect, aggregate, or process personal data in ways that violate applicable privacy law (including GDPR, CCPA, and equivalent regulations), or in ways that the data subjects would not reasonably expect or consent to.

### Malicious automation

Do not use G4 to submit spam, manipulate engagement metrics, generate fraudulent activity, automate abuse, or perform any other action that harms systems, users, or third parties.

---

## Web Scraping and Crawling

When using G4 to extract data from web properties — including properties you own — apply the following practices:

**Check `robots.txt`.** The `robots.txt` file signals which paths a site owner permits crawlers to access. Respect these directives even if they are not legally binding in your jurisdiction.

**Respect rate limits.** Do not send requests at a rate that impairs the target system. Introduce appropriate delays between requests, especially in distributed crawls across many workers. What a site can absorb from a single user is not what it can absorb from a thousand concurrent workers.

**Use caching.** Avoid re-fetching data you already have. Cache responses where appropriate.

**Identify your automation.** When operating under your own authorization (e.g., crawling your own infrastructure), consider setting a recognizable user-agent so your requests are distinguishable from organic traffic.

**Prefer APIs.** If the data you need is available via a documented API, use it. Scraping HTML is a last resort — it is brittle for you and more resource-intensive for the target.

---

## Data Handling

G4 extracts and moves data. The data extracted by your workflows is your responsibility.

- Apply appropriate access controls to extraction results, especially when they contain personal or sensitive information.
- Do not store more data than necessary for the task at hand.
- If your workflows process personal data, ensure you have a lawful basis for doing so and are meeting your obligations under applicable data protection law.
- Treat credentials, tokens, and secrets in workflow configurations with the same care as you would in any other system. Do not embed live credentials in workflows stored in version control.

---

## Distributed Execution

G4 Services enables running large numbers of parallel workers. This multiplies impact — both productive and harmful. Before running distributed workloads:

- Confirm that the target system can handle your intended traffic level.
- Test at small scale first and observe the effect before scaling up.
- Coordinate with system owners when in doubt.
- Do not use distributed execution to work around per-IP rate limits by distributing requests across many sources.

---

## AI Agent Use (G4 MCP)

When using G4 MCP to expose automation capabilities to AI agents:

- Scope the tools you expose. Agents should have access to the minimum surface required for the task.
- Review what surfaces and data an agent can reach before connecting it to G4.
- Apply the same authorization standards to agent-driven automation that you would apply to direct API calls.
- Do not allow AI agents to initiate actions on systems outside the defined scope of the task without human review.

---

## Reporting Concerns

If you become aware of G4 being used in ways that violate this policy, or if you identify a security vulnerability in the platform, report it through the appropriate channel for your deployment.

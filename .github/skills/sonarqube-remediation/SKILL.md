---
name: sonarqube-remediation
description: "Fix SonarQube/SonarCloud issues, code smells, bugs, vulnerabilities, security hotspots, duplication, coverage gaps, and quality gate failures. Use when analyzing or remediating Sonar findings in this repository."
argument-hint: "Which Sonar issue, rule, or file should be fixed?"
---

# SonarQube Remediation

## When to Use

- A SonarQube or SonarCloud issue is reported
- The quality gate fails
- A code smell, bug, vulnerability, hotspot, duplication, or coverage gap needs remediation
- A file needs to be made cleaner, safer, or more maintainable for Sonar

## Goal

Fix the root cause with the smallest safe change, while preserving behavior and keeping the repository aligned with Sonar rules.

## Repository Context

- Sonar sources in this repo are `app`, `components`, and `lib`
- The scan excludes generated, build, and config artifacts such as `**/*.d.ts`, `public/`, `.next/`, `coverage/`, and `*.config.*`
- Validation commands available in this repo include `npm run lint`, `npm run test:run`, `npm run coverage`, and `npm run build`

## Procedure

1. Identify the exact issue
   - Capture the rule key, file, line, severity, and issue type if available.
   - Determine whether it is a code smell, bug, vulnerability, security hotspot, duplication, or coverage gap.

2. Inspect the surrounding context
   - Read the touched function, component, module, and nearby tests.
   - Check whether the issue is real, a false positive, or caused by generated or excluded code.

3. Choose the smallest safe fix
   - Prefer a direct code change over suppression.
   - Refactor duplicated or overly complex code.
   - Tighten types, null checks, input validation, or escaping when needed.
   - For security issues, choose safe defaults and avoid weakening protections.

4. Update or add tests
   - Add tests for the bug fix or regression path when behavior changes.
   - If the fix is structural, add or adjust targeted tests that prove the intended behavior.

5. Validate locally
   - Run the most targeted checks first: lint, affected tests, and coverage when relevant.
   - Prefer the narrowest command that still covers the change.
   - Typical commands in this repo:
     - `npm run lint`
     - `npm run test:run`
     - `npm run coverage`
     - `npm run build`

6. Re-evaluate the Sonar outcome
   - Re-check the original issue against the fixed code.
   - If the issue remains, trace the root cause rather than patching symptoms.
   - Only consider suppression if the issue is demonstrably a false positive and the codebase already follows that pattern.

## Decision Rules

- **Security hotspot or vulnerability**: optimize for safety first, even if the change is slightly more verbose.
- **Code smell**: prefer readability, reuse, and lower complexity.
- **Coverage issue**: add a focused test instead of inflating unrelated coverage.
- **Duplicate logic**: extract shared helpers only when the abstraction stays simple.
- **Generated or excluded files**: do not spend time fixing files that Sonar ignores.

## Completion Checks

- The Sonar issue is resolved at the source
- Existing behavior still works
- Tests or validation commands pass, or the remaining risk is explicitly documented
- The fix is minimal, readable, and consistent with the project style

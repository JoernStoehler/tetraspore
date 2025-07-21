# Code Review Task: [FEATURE NAME]

Review the [FEATURE] implementation in this branch.

## Hard Requirements (ANY failure = FAIL verdict)

1. Run `npm run build` - MUST succeed
2. Run `npm test` - MUST pass all tests  
3. Run `npm run lint` - MUST have zero errors
4. Feature MUST exist (not just empty branch)
5. Manual testing MUST NOT crash

## Review Output

Create REVIEW_REPORT.md with:

```
# Review: [FEATURE]

**Verdict: PASS or FAIL**

**Build**: [passed/failed]
**Tests**: [X passed, Y failed]  
**Lint**: [0 errors, N warnings]
**Feature exists**: [yes/no]
**Manual test**: [works/crashes/partial]

## If FAIL, why:
- [Specific failure with file:line if applicable]

## If PASS, any concerns:
- [Non-blocking issues]
```

## Remember
- FAIL if it doesn't build. No exceptions.
- FAIL if tests fail. No exceptions.
- Include actual numbers/output, not just "looks good".
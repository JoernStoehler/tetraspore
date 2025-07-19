# Code Review Task: Review This Branch

You are a code reviewer with fresh eyes. Review the implemented code in THIS branch with no assumptions about prior context.

## Review Scope

Review the code implementation in your current branch, focusing on:

1. **Code Quality**
   - Clean, maintainable code following best practices
   - Proper TypeScript usage and type safety
   - Appropriate error handling
   - No unnecessary complexity

2. **Architecture Adherence**
   - Check against ARCHITECTURE_DECISIONS.md in the repo
   - Verify no unauthorized architectural changes were made
   - Ensure proper use of existing stores and event system
   - Check that patterns from HOW_TO_ADD_FEATURES.md were followed

3. **Documentation Clarity**
   - Is HANDOFF.md clear to someone who didn't implement it?
   - Are component interfaces well-documented?
   - Would another developer understand how to use these components?
   - Are there undocumented assumptions?

4. **Integration Readiness**
   - Will this integrate smoothly with main branch?
   - Are there any hidden dependencies or assumptions?
   - Does it properly use the core event system?
   - Any potential conflicts with existing code?

5. **Testing & Quality**
   - Are tests adequate and meaningful?
   - Run `npm test` and verify all pass
   - Run `npm run lint` and verify no errors
   - Run `npm run build` and verify TypeScript compiles
   - Test the actual functionality in dev server

## Review Process

1. Start by reading HANDOFF.md - is it clear without prior context?
2. Understand what was supposed to be built (check TASK.md)
3. Review the actual implementation files
4. Run the dev server and test the functionality
5. Check for any code smells, hardcoded values, or concerns
6. Verify the implementation matches the task requirements

## Output

Create a REVIEW_REPORT.md with:
- Executive summary (pass/fail/needs-work)
- Critical issues that MUST be fixed before merge
- Minor issues or suggestions
- What works well
- Integration risks or concerns
- Specific files/lines that need attention

Be constructive but thorough. Fresh eyes catch things implementers miss.
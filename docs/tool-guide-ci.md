# Tool Guide: Continuous Integration (CI)

This guide explains how to work with the Tetraspore CI system for automated testing and quality checks.

## Overview

Tetraspore uses GitHub Actions for continuous integration. The CI automatically runs on:
- All pushes to the `main` branch
- All pull requests targeting `main`

## What the CI Tests

The CI pipeline runs the following checks in sequence:

1. **TypeScript Check** (`npm run build`)
   - Compiles TypeScript to ensure no type errors
   - Validates build configuration

2. **Linting** (`npm run lint`)
   - Runs ESLint to check code style and quality
   - Enforces consistent code formatting

3. **Unit Tests** (`npm test -- --run`)
   - Runs Vitest unit tests
   - Validates component and utility function behavior

4. **End-to-End Tests** (`npm run test:e2e`)
   - Runs Playwright browser tests
   - Tests full application workflows

## Working with CI

### Checking CI Status

```bash
# View CI status for current branch
gh pr checks

# View detailed logs for a specific check
gh run view <run-id>

# List recent workflow runs
gh run list
```

### When CI Fails

1. **Check the failure details:**
   ```bash
   gh pr checks --fail-fast
   ```

2. **Common failures and fixes:**
   - **TypeScript errors**: Fix type issues and run `npm run build` locally
   - **Lint errors**: Run `npm run lint` locally and fix style issues
   - **Unit test failures**: Run `npm test` locally and fix failing tests
   - **E2E test failures**: Run `npm run test:e2e` locally to reproduce

3. **Fix and push:**
   ```bash
   # Fix the issues locally first
   npm run build  # Should pass
   npm run lint   # Should pass
   npm test       # Should pass
   npm run test:e2e  # Should pass (optional, slower)
   
   # Then commit and push
   git add -A
   git commit -m "fix: resolve CI failures"
   git push
   ```

### Best Practices

#### Before Pushing Code
Always run these checks locally before pushing:

```bash
# Quick check (recommended minimum)
npm run build && npm run lint && npm test -- --run

# Full check (matches CI exactly)
npm run test:all
```

#### Working on PRs
1. **Wait for CI**: Always wait for CI to complete before requesting reviews
2. **Fix failures promptly**: Address CI failures quickly to unblock reviews
3. **Green builds only**: Only merge PRs with passing CI

#### Efficient CI Usage
- **Small commits**: Make focused commits to isolate failures
- **Local testing**: Test locally first to avoid CI churn
- **Parallel work**: CI runs all checks in parallel for speed

## CI Configuration

The CI is defined in `.github/workflows/ci.yml` and includes:

- **Node.js 20**: Uses the latest LTS version
- **Ubuntu latest**: Runs on GitHub's Ubuntu runners
- **Dependency caching**: Caches npm dependencies for faster runs
- **Playwright setup**: Automatically installs browser dependencies

## Troubleshooting

### Common Issues

**Flaky E2E tests:**
```bash
# Re-run just the E2E tests
gh run rerun --failed
```

**Dependency issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Browser issues in E2E:**
- E2E tests run in headless mode in CI
- Browser dependencies are automatically installed
- Tests should be deterministic and not rely on timing

### Getting Help

If CI is consistently failing:
1. Check recent changes that might have broken the build
2. Compare with working branches
3. Ask for help in the GitHub issue or PR comments

## Development Workflow Integration

### For Issue Implementation
When implementing GitHub issues:

1. Work in your feature branch
2. Test locally: `npm run test:all`
3. Push and create PR
4. **Wait for CI to pass** before requesting review
5. Fix any CI failures
6. Only merge when CI is green

### For Reviews
When reviewing PRs:
1. Check that CI is passing before starting review
2. Don't approve PRs with failing CI
3. Re-request review after CI fixes

## Performance

The CI is optimized for speed:
- **Parallel execution**: All checks run simultaneously
- **Dependency caching**: npm dependencies are cached between runs
- **Efficient setup**: Uses official GitHub Actions with caching
- **Early termination**: Pipeline stops on first failure (fail-fast)

Typical run time: 3-5 minutes for passing builds.
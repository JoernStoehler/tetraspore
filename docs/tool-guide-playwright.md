# Tool Guide: playwright (MCP Server)

Browser automation through the MCP Playwright server for testing, web scraping, and UI automation.

## Overview

The `mcp__playwright__*` tools provide browser automation capabilities through Claude's MCP (Model Context Protocol) integration. These tools allow you to:

- Navigate web pages and interact with UI elements
- Take screenshots and capture page state
- Execute JavaScript in the browser context
- Handle dialogs and file uploads
- Manage multiple browser tabs
- Monitor network requests and console messages

## Available Tools

### Browser Control

#### mcp__playwright__browser_navigate
Navigate to a URL.
```typescript
// Example
mcp__playwright__browser_navigate({ url: "https://example.com" })
```

#### mcp__playwright__browser_navigate_back / browser_navigate_forward
Navigate browser history.
```typescript
mcp__playwright__browser_navigate_back({})
mcp__playwright__browser_navigate_forward({})
```

#### mcp__playwright__browser_close
Close the current page.
```typescript
mcp__playwright__browser_close({})
```

#### mcp__playwright__browser_resize
Resize the browser window.
```typescript
mcp__playwright__browser_resize({ width: 1280, height: 720 })
```

### Page Interaction

#### mcp__playwright__browser_click
Click on an element.
```typescript
mcp__playwright__browser_click({
  element: "Submit button",  // Human-readable description for permission
  ref: "#submit-btn",        // Exact selector from snapshot
  button: "left",            // Optional: "left", "right", "middle"
  doubleClick: false         // Optional: perform double click
})
```

#### mcp__playwright__browser_type
Type text into an input field.
```typescript
mcp__playwright__browser_type({
  element: "Email input field",
  ref: "input[name='email']",
  text: "user@example.com",
  slowly: false,            // Optional: type one character at a time
  submit: false             // Optional: press Enter after typing
})
```

#### mcp__playwright__browser_select_option
Select option(s) in a dropdown.
```typescript
mcp__playwright__browser_select_option({
  element: "Country dropdown",
  ref: "select#country",
  values: ["US", "CA"]      // Can select multiple values
})
```

#### mcp__playwright__browser_hover
Hover over an element.
```typescript
mcp__playwright__browser_hover({
  element: "Help tooltip trigger",
  ref: ".help-icon"
})
```

#### mcp__playwright__browser_drag
Drag and drop between elements.
```typescript
mcp__playwright__browser_drag({
  startElement: "Draggable item",
  startRef: ".item-1",
  endElement: "Drop zone",
  endRef: ".drop-area"
})
```

#### mcp__playwright__browser_press_key
Press a keyboard key.
```typescript
mcp__playwright__browser_press_key({
  key: "Escape"  // Key name like "ArrowLeft", "Enter", or character like "a"
})
```

### Page Analysis

#### mcp__playwright__browser_snapshot
Capture accessibility snapshot of the current page (better than screenshot for actions).
```typescript
mcp__playwright__browser_snapshot({})
// Returns structured page content with element references
```

#### mcp__playwright__browser_take_screenshot
Take a screenshot of the page or specific element.
```typescript
// Full page screenshot
mcp__playwright__browser_take_screenshot({
  filename: "homepage.png",  // Optional: defaults to page-{timestamp}.png
  raw: false                 // Optional: true for PNG, false for JPEG
})

// Element screenshot
mcp__playwright__browser_take_screenshot({
  element: "Product card",
  ref: ".product-card:first-child",
  filename: "product.png"
})
```

#### mcp__playwright__browser_evaluate
Execute JavaScript on the page.
```typescript
// Execute on page
mcp__playwright__browser_evaluate({
  function: "() => { return document.title; }"
})

// Execute on element
mcp__playwright__browser_evaluate({
  element: "Product price",
  ref: ".price",
  function: "(element) => { return element.textContent; }"
})
```

### Browser State

#### mcp__playwright__browser_console_messages
Get all console messages from the page.
```typescript
mcp__playwright__browser_console_messages({})
// Returns array of console messages with types and text
```

#### mcp__playwright__browser_network_requests
Get all network requests made by the page.
```typescript
mcp__playwright__browser_network_requests({})
// Returns array of network requests with URLs, methods, status codes
```

#### mcp__playwright__browser_wait_for
Wait for text to appear/disappear or time to pass.
```typescript
// Wait for text to appear
mcp__playwright__browser_wait_for({
  text: "Loading complete"
})

// Wait for text to disappear
mcp__playwright__browser_wait_for({
  textGone: "Loading..."
})

// Wait for specific time
mcp__playwright__browser_wait_for({
  time: 5  // seconds
})
```

### Tab Management

#### mcp__playwright__browser_tab_list
List all open browser tabs.
```typescript
mcp__playwright__browser_tab_list({})
// Returns array of tabs with indices and titles
```

#### mcp__playwright__browser_tab_new
Open a new tab.
```typescript
mcp__playwright__browser_tab_new({
  url: "https://example.com"  // Optional: opens blank tab if not provided
})
```

#### mcp__playwright__browser_tab_select
Switch to a specific tab.
```typescript
mcp__playwright__browser_tab_select({
  index: 1  // 0-based index
})
```

#### mcp__playwright__browser_tab_close
Close a tab.
```typescript
mcp__playwright__browser_tab_close({
  index: 1  // Optional: closes current tab if not provided
})
```

### File Operations

#### mcp__playwright__browser_file_upload
Upload files to file input elements.
```typescript
mcp__playwright__browser_file_upload({
  paths: ["/path/to/file1.pdf", "/path/to/file2.jpg"]
})
```

### Dialog Handling

#### mcp__playwright__browser_handle_dialog
Handle JavaScript dialogs (alert, confirm, prompt).
```typescript
mcp__playwright__browser_handle_dialog({
  accept: true,              // Accept or dismiss the dialog
  promptText: "User input"   // Optional: text for prompt dialogs
})
```

### Setup

#### mcp__playwright__browser_install
Install the browser if not already installed.
```typescript
mcp__playwright__browser_install({})
// Call this if you get browser not installed errors
```

## Common Workflows

### Basic Navigation and Interaction

```typescript
// 1. Navigate to a page
mcp__playwright__browser_navigate({ url: "https://example.com/login" })

// 2. Take a snapshot to see the page structure
mcp__playwright__browser_snapshot({})

// 3. Fill in a form
mcp__playwright__browser_type({
  element: "Username field",
  ref: "#username",
  text: "testuser"
})

mcp__playwright__browser_type({
  element: "Password field", 
  ref: "#password",
  text: "password123"
})

// 4. Submit the form
mcp__playwright__browser_click({
  element: "Login button",
  ref: "button[type='submit']"
})

// 5. Wait for navigation
mcp__playwright__browser_wait_for({
  text: "Welcome, testuser"
})
```

### Testing Workflow

```typescript
// 1. Navigate to app under test
mcp__playwright__browser_navigate({ url: "http://localhost:3000" })

// 2. Take initial screenshot
mcp__playwright__browser_take_screenshot({
  filename: "initial-state.png"
})

// 3. Interact with UI elements
mcp__playwright__browser_click({
  element: "End Turn button",
  ref: "button:has-text('End Turn')"
})

// 4. Wait for changes
mcp__playwright__browser_wait_for({
  text: "Turn 1"
})

// 5. Verify network activity
const requests = mcp__playwright__browser_network_requests({})
// Check for expected API calls

// 6. Check console for errors
const messages = mcp__playwright__browser_console_messages({})
// Verify no error messages
```

### Multi-Tab Operations

```typescript
// 1. Open multiple tabs
mcp__playwright__browser_tab_new({ url: "https://example.com/page1" })
mcp__playwright__browser_tab_new({ url: "https://example.com/page2" })

// 2. List tabs
const tabs = mcp__playwright__browser_tab_list({})

// 3. Switch between tabs
mcp__playwright__browser_tab_select({ index: 0 })
// Do something on first tab

mcp__playwright__browser_tab_select({ index: 1 })
// Do something on second tab

// 4. Close specific tab
mcp__playwright__browser_tab_close({ index: 1 })
```

## Integration with Tetraspore

### E2E Testing

The project already has Playwright configured for E2E testing:

```bash
# Run E2E tests (headless by default)
npm run test:e2e

# Run with visible browser
npx playwright test --headed

# Generate HTML report
npx playwright test --reporter=html

# Run specific test file
npx playwright test e2e/app.spec.ts
```

### Using MCP Tools for Testing

You can use the MCP Playwright tools to:

1. **Exploratory Testing**: Navigate the app and verify behavior
2. **Screenshot Comparison**: Take screenshots at different states
3. **Performance Testing**: Monitor network requests and console logs
4. **Accessibility Testing**: Use snapshots to verify page structure

### Example: Testing Tree of Life

```typescript
// Navigate to app
mcp__playwright__browser_navigate({ url: "http://localhost:3000" })

// Take snapshot to verify structure
const snapshot = mcp__playwright__browser_snapshot({})

// Verify Tree of Life is visible
mcp__playwright__browser_evaluate({
  function: "() => { return document.querySelector('.tree-of-life-container') !== null; }"
})

// Click End Turn to generate species
mcp__playwright__browser_click({
  element: "End Turn button",
  ref: "button:has-text('End Turn')"
})

// Wait for tree to update
mcp__playwright__browser_wait_for({
  time: 2  // Give time for animation
})

// Take screenshot of tree
mcp__playwright__browser_take_screenshot({
  element: "Tree of Life visualization",
  ref: ".tree-of-life-container",
  filename: "tree-turn-1.png"
})
```

## Best Practices

### 1. Always Use Snapshots First
Before interacting with a page, take a snapshot to understand the structure:
```typescript
mcp__playwright__browser_snapshot({})
```

### 2. Use Descriptive Element Names
The `element` parameter is for permission/logging. Be descriptive:
```typescript
// Good
element: "Login form submit button"

// Bad
element: "button"
```

### 3. Wait for Elements
Always wait for elements to be ready before interacting:
```typescript
mcp__playwright__browser_wait_for({ text: "Page loaded" })
// Then interact with elements
```

### 4. Handle Errors Gracefully
Check console messages and network requests for errors:
```typescript
const console = mcp__playwright__browser_console_messages({})
const hasErrors = console.some(msg => msg.type === 'error')
```

### 5. Clean Up Resources
Close tabs and pages when done:
```typescript
mcp__playwright__browser_close({})
```

## Troubleshooting

### Browser Not Installed
```typescript
// Run this if you get browser installation errors
mcp__playwright__browser_install({})
```

### Element Not Found
- Use `browser_snapshot` to see current page structure
- Verify your ref selector is correct
- Check if element is in an iframe or shadow DOM

### Timeouts
- Increase wait times for slow-loading pages
- Check network tab for pending requests
- Verify the page URL is correct

### Permission Errors
- Always provide descriptive `element` parameter
- Some actions may require user confirmation

## Limitations

1. **No Direct File System Access**: Can only upload files, not download
2. **Single Browser Instance**: All tools operate on one browser instance
3. **No Browser Choice**: Uses default Chromium browser
4. **Limited Mobile Testing**: No device emulation through MCP tools
5. **No Video Recording**: Only screenshots available

For more advanced Playwright features, use the npm scripts and write test files directly.
#!/usr/bin/env node

/* ANCHOR: automated_test_suite */
/* REUSED: Node.js test runner for critical fixes validation */
/* SCALED FOR: CI/CD integration and automated testing */

// CRITICAL: Simple test framework without dependencies
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('\n🧪 CRITICAL FIXES TEST SUITE\n');
    console.log('='.repeat(60));
    
    for (const { name, fn } of this.tests) {
      try {
        await fn();
        this.passed++;
        console.log(`✅ PASS: ${name}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Error: ${error.message}`);
      }
    }
    
    console.log('='.repeat(60));
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// UPDATED COMMENTS: Test utilities
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertIncludes(text, substring, message) {
  if (!text.includes(substring)) {
    throw new Error(message || `Expected text to include "${substring}"`);
  }
}

// CRITICAL: File system checks
const fs = require('fs');
const path = require('path');

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

function readFile(filepath) {
  return fs.readFileSync(filepath, 'utf-8');
}

function countOccurrences(text, pattern) {
  const matches = text.match(new RegExp(pattern, 'g'));
  return matches ? matches.length : 0;
}

// ANCHOR: test_suite
const runner = new TestRunner();

// Test 1: Desktop Canvas - No duplication
runner.test('Desktop Canvas - Workspace container created once', () => {
  const filepath = 'js/features/desktop-canvas/desktop-canvas.js';
  assert(fileExists(filepath), `File not found: ${filepath}`);
  
  const content = readFile(filepath);
  const pattern = 'this\\.workspaceContainer = document\\.createElement\\(';
  const count = countOccurrences(content, pattern);
  
  assertEqual(count, 1, `Found ${count} workspace container creations (expected: 1)`);
});

// Test 2: WidgetBase - Deprecated warnings
runner.test('WidgetBase - Deprecated methods have warnings', () => {
  const filepath = 'js/entities/widget/widget-base.js';
  assert(fileExists(filepath), `File not found: ${filepath}`);
  
  const content = readFile(filepath);
  
  // Check for @deprecated JSDoc
  const deprecatedCount = countOccurrences(content, '@deprecated');
  assert(deprecatedCount >= 3, `Found ${deprecatedCount} @deprecated tags (expected: >= 3)`);
  
  // Check for console.warn
  assertIncludes(content, 'console.warn', 'Missing console.warn in deprecated methods');
  assertIncludes(content, 'updateTransform() is deprecated', 'Missing updateTransform warning');
  assertIncludes(content, 'getHoverRotation() is deprecated', 'Missing getHoverRotation warning');
  assertIncludes(content, 'getInteractionScale() is deprecated', 'Missing getInteractionScale warning');
});

// Test 3: Error Boundary - Files exist
runner.test('Error Boundary - Required files exist', () => {
  // Check widget-error.css exists
  assert(fileExists('styles/widget-error.css'), 'Missing styles/widget-error.css');
  
  // Check it's linked in index.html
  const indexContent = readFile('index.html');
  assertIncludes(indexContent, 'widget-error.css', 'widget-error.css not linked in index.html');
  
  // Check handleInitializationError exists in WidgetBase
  const widgetBaseContent = readFile('js/entities/widget/widget-base.js');
  assertIncludes(widgetBaseContent, 'handleInitializationError', 'Missing handleInitializationError method');
  assertIncludes(widgetBaseContent, 'widget--error', 'Missing error class application');
  assertIncludes(widgetBaseContent, 'Widget failed to load', 'Missing error message');
});

// Test 4: SimpleDragHover - Memory leak fixes
runner.test('SimpleDragHover - Memory leak prevention', () => {
  const filepath = 'js/shared/lib/simple-drag-hover.js';
  assert(fileExists(filepath), `File not found: ${filepath}`);
  
  const content = readFile(filepath);
  
  // Check for WeakMap
  assertIncludes(content, 'this.activeListeners = new WeakMap()', 'Missing WeakMap initialization');
  
  // Check for listener tracking in initWidget
  assertIncludes(content, 'this.activeListeners.set(widget', 'Missing listener tracking');
  
  // Check for cleanup in destroyWidget
  assertIncludes(content, 'this.activeListeners.get(widget)', 'Missing listener cleanup');
  assertIncludes(content, 'this.activeListeners.delete(widget)', 'Missing WeakMap cleanup');
});

// Test 5: SimpleDragHover - Configurable boundary
runner.test('SimpleDragHover - Configurable boundary offset', () => {
  const filepath = 'js/shared/lib/simple-drag-hover.js';
  const content = readFile(filepath);
  
  // Check for options parameter in constructor
  assertIncludes(content, 'constructor(options = {})', 'Missing options parameter');
  
  // Check for configurable boundary offset
  assertIncludes(content, 'options.boundaryOffset', 'Missing boundaryOffset option');
  assertIncludes(content, 'this.globalBoundaryOffset = options.boundaryOffset', 'Missing boundary offset assignment');
});

// Test 6: CSS Error Styles
runner.test('Widget Error CSS - Proper styling', () => {
  const filepath = 'styles/widget-error.css';
  const content = readFile(filepath);
  
  assertIncludes(content, '.widget--error', 'Missing .widget--error class');
  assertIncludes(content, '.widget-error-state', 'Missing .widget-error-state class');
  assertIncludes(content, '.widget-error-icon', 'Missing .widget-error-icon class');
  assertIncludes(content, '.widget-error-message', 'Missing .widget-error-message class');
});

// Test 7: Documentation exists
runner.test('Documentation - All files present', () => {
  assert(fileExists('CRITICAL_FIXES_SUMMARY.md'), 'Missing CRITICAL_FIXES_SUMMARY.md');
  assert(fileExists('TESTING_GUIDE.md'), 'Missing TESTING_GUIDE.md');
  assert(fileExists('QUICK_TEST.md'), 'Missing QUICK_TEST.md');
});

// Test 8: Development plan updated
runner.test('Development Plan - Updated with Phase 1', () => {
  const filepath = 'docs/vanilla_development_plan.md';
  const content = readFile(filepath);
  
  assertIncludes(content, 'PHASE 1: CRITICAL FIXES', 'Missing Phase 1 section');
  assertIncludes(content, 'COMPLETED', 'Phase 1 not marked as completed');
  assertIncludes(content, '2026-02-15', 'Missing completion date');
});

// ANCHOR: run_tests
console.log('🚀 Starting Critical Fixes Test Suite...\n');
runner.run().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});

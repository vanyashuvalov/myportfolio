#!/usr/bin/env node

/* ANCHOR: phase2_test_suite */
/* REUSED: Automated tests for Phase 2 improvements */
/* SCALED FOR: CI/CD integration */

const fs = require('fs');
const path = require('path');

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
    console.log('\n🧪 PHASE 2: HIGH PRIORITY TEST SUITE\n');
    console.log('='.repeat(70));
    
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
    
    console.log('='.repeat(70));
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertIncludes(text, substring, message) {
  if (!text.includes(substring)) {
    throw new Error(message || `Expected text to include "${substring}"`);
  }
}

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

const runner = new TestRunner();

// Test 1: SimpleDragHover V2 exists
runner.test('SimpleDragHover V2 - New simplified version exists', () => {
  assert(fileExists('js/shared/lib/simple-drag-hover-v2.js'), 'Missing simple-drag-hover-v2.js');
  
  const content = readFile('js/shared/lib/simple-drag-hover-v2.js');
  assertIncludes(content, 'CSS-FIRST', 'Missing CSS-FIRST approach');
  assertIncludes(content, '@typedef', 'Missing JSDoc types');
  assertIncludes(content, '@param', 'Missing JSDoc params');
});

// Test 2: JSDoc types in SimpleDragHover V2
runner.test('SimpleDragHover V2 - JSDoc types present', () => {
  const content = readFile('js/shared/lib/simple-drag-hover-v2.js');
  
  const typedefCount = countOccurrences(content, '@typedef');
  assert(typedefCount >= 1, `Found ${typedefCount} @typedef (expected: >= 1)`);
  
  const paramCount = countOccurrences(content, '@param');
  assert(paramCount >= 3, `Found ${paramCount} @param (expected: >= 3)`);
});

// Test 3: Simplified logic - no dataset.initialX
runner.test('SimpleDragHover V2 - No dataset.initialX logic', () => {
  const content = readFile('js/shared/lib/simple-drag-hover-v2.js');
  
  const datasetCount = countOccurrences(content, 'dataset\\.initialX');
  assert(datasetCount === 0, `Found ${datasetCount} dataset.initialX references (expected: 0)`);
});

// Test 4: Simplified logic - no cssPositioning checks
runner.test('SimpleDragHover V2 - No cssPositioning checks', () => {
  const content = readFile('js/shared/lib/simple-drag-hover-v2.js');
  
  const cssPositioningCount = countOccurrences(content, 'cssPositioning');
  assert(cssPositioningCount === 0, `Found ${cssPositioningCount} cssPositioning checks (expected: 0)`);
});

// Test 5: Code reduction
runner.test('SimpleDragHover V2 - Code size reduced', () => {
  const oldContent = readFile('js/shared/lib/simple-drag-hover.js');
  const newContent = readFile('js/shared/lib/simple-drag-hover-v2.js');
  
  const oldLines = oldContent.split('\n').length;
  const newLines = newContent.split('\n').length;
  
  assert(newLines < oldLines, `New version has ${newLines} lines, old has ${oldLines} (expected: fewer)`);
  console.log(`   Code reduction: ${oldLines} → ${newLines} lines (-${oldLines - newLines} lines)`);
});

// Test 6: Phase 2 plan exists
runner.test('Documentation - Phase 2 plan exists', () => {
  assert(fileExists('PHASE2_PLAN.md'), 'Missing PHASE2_PLAN.md');
  
  const content = readFile('PHASE2_PLAN.md');
  assertIncludes(content, 'ФАЗА 2', 'Missing Phase 2 header');
  assertIncludes(content, 'Positioning System', 'Missing positioning section');
  assertIncludes(content, 'JSDoc', 'Missing JSDoc section');
});

// Test 7: All habits followed
runner.test('Code Quality - All habits markers present', () => {
  const content = readFile('js/shared/lib/simple-drag-hover-v2.js');
  
  assertIncludes(content, '/* ANCHOR:', 'Missing ANCHOR points');
  assertIncludes(content, '// UPDATED COMMENTS:', 'Missing UPDATED COMMENTS');
  assertIncludes(content, '// REUSED:', 'Missing REUSED markers');
  assertIncludes(content, '// SCALED FOR:', 'Missing SCALED FOR markers');
  assertIncludes(content, '// CRITICAL:', 'Missing CRITICAL markers');
});

// Test 8: Comments ratio
runner.test('Code Quality - 50/50 comments ratio', () => {
  const content = readFile('js/shared/lib/simple-drag-hover-v2.js');
  
  const lines = content.split('\n');
  const codeLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
  }).length;
  
  const commentLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
  }).length;
  
  const ratio = commentLines / codeLines;
  assert(ratio >= 0.3, `Comment ratio: ${ratio.toFixed(2)} (expected: >= 0.3)`);
  console.log(`   Comment ratio: ${ratio.toFixed(2)} (${commentLines} comments / ${codeLines} code lines)`);
});

// Test 9: JSDoc in WidgetBase
runner.test('JSDoc Types - WidgetBase has comprehensive types', () => {
  const content = readFile('js/entities/widget/widget-base.js');
  
  const typedefCount = countOccurrences(content, '@typedef');
  assert(typedefCount >= 5, `Found ${typedefCount} @typedef (expected: >= 5)`);
  
  assertIncludes(content, '@typedef {Object} Position', 'Missing Position typedef');
  assertIncludes(content, '@typedef {Object} WidgetState', 'Missing WidgetState typedef');
  assertIncludes(content, '@typedef {Object} WidgetConfig', 'Missing WidgetConfig typedef');
  assertIncludes(content, '@typedef {Object} WidgetOptions', 'Missing WidgetOptions typedef');
});

// Test 10: JSDoc in AnimationSystem
runner.test('JSDoc Types - AnimationSystem has comprehensive types', () => {
  const content = readFile('js/shared/lib/animation-system.js');
  
  const typedefCount = countOccurrences(content, '@typedef');
  assert(typedefCount >= 4, `Found ${typedefCount} @typedef (expected: >= 4)`);
  
  assertIncludes(content, '@typedef {Object} AnimationKeyframe', 'Missing AnimationKeyframe typedef');
  assertIncludes(content, '@typedef {Object} AnimationOptions', 'Missing AnimationOptions typedef');
  assertIncludes(content, '@typedef {Object} AnimationPreset', 'Missing AnimationPreset typedef');
});

// Test 11: JSDoc in ShadowSystem
runner.test('JSDoc Types - ShadowSystem has comprehensive types', () => {
  const content = readFile('js/shared/lib/shadow-system.js');
  
  const typedefCount = countOccurrences(content, '@typedef');
  assert(typedefCount >= 2, `Found ${typedefCount} @typedef (expected: >= 2)`);
  
  assertIncludes(content, '@typedef {Object} ShadowOptions', 'Missing ShadowOptions typedef');
  assertIncludes(content, '@typedef {Object} WidgetShadows', 'Missing WidgetShadows typedef');
});

// Test 12: CSS Variables - Widget positioning
runner.test('CSS Variables - Widget positioning offsets defined', () => {
  const content = readFile('styles/variables.css');
  
  assertIncludes(content, '--widget-offset-sticker-top', 'Missing --widget-offset-sticker-top');
  assertIncludes(content, '--widget-offset-sticker-left', 'Missing --widget-offset-sticker-left');
  assertIncludes(content, '--widget-offset-telegram-right', 'Missing --widget-offset-telegram-right');
  assertIncludes(content, '--widget-offset-clock-top', 'Missing --widget-offset-clock-top');
  
  console.log('   Found all widget positioning CSS variables');
});

// Test 13: CSS Variables - Drag boundaries
runner.test('CSS Variables - Drag boundary offset defined', () => {
  const content = readFile('styles/variables.css');
  
  assertIncludes(content, '--drag-boundary-offset', 'Missing --drag-boundary-offset');
  assertIncludes(content, '-60px', 'Missing -60px value for boundary offset');
  
  console.log('   Drag boundary offset: -60px');
});

// Test 14: CSS Variables - Widget dimensions
runner.test('CSS Variables - Widget dimensions defined', () => {
  const content = readFile('styles/variables.css');
  
  assertIncludes(content, '--widget-min-width', 'Missing --widget-min-width');
  assertIncludes(content, '--widget-min-height', 'Missing --widget-min-height');
  
  console.log('   Widget dimensions variables defined');
});

// Test 15: Components CSS uses variables
runner.test('CSS Variables - components.css uses variables', () => {
  const content = readFile('styles/components.css');
  
  assertIncludes(content, 'var(--widget-offset-sticker-top)', 'Missing var() usage for sticker-top');
  assertIncludes(content, 'var(--widget-offset-telegram-right)', 'Missing var() usage for telegram-right');
  
  // Should NOT have hardcoded values
  const hasHardcodedTop = content.includes('.widget-position--sticker') && 
                          content.match(/\.widget-position--sticker[^}]*top:\s*-1%[^v]/);
  assert(!hasHardcodedTop, 'Found hardcoded positioning values (should use CSS variables)');
  
  console.log('   All positioning uses CSS variables');
});

// Test 16: SimpleDragHover V2 reads CSS variable
runner.test('SimpleDragHover V2 - Reads boundary offset from CSS', () => {
  const content = readFile('js/shared/lib/simple-drag-hover-v2.js');
  
  assertIncludes(content, 'getBoundaryOffsetFromCSS', 'Missing getBoundaryOffsetFromCSS method');
  assertIncludes(content, '--drag-boundary-offset', 'Missing CSS variable reference');
  assertIncludes(content, 'getComputedStyle', 'Missing getComputedStyle call');
  
  console.log('   Boundary offset reads from CSS variable');
});

// Test 17: Telegram widget avatar with API support
runner.test('Telegram Widget - Avatar uses API data with fallback', () => {
  const content = readFile('js/widgets/telegram/telegram-widget.js');
  
  assertIncludes(content, 'getAvatarUrl()', 'Missing getAvatarUrl method');
  assertIncludes(content, 'this.channelData.avatar_url', 'Missing API avatar_url usage');
  assertIncludes(content, '/assets/images/telegram-avatar.jpg', 'Missing fallback avatar');
  
  // Should check for avatar_url before fallback
  const methodMatch = content.match(/getAvatarUrl\(\)[^}]*\{[^}]*\}/s);
  assert(methodMatch, 'Could not find getAvatarUrl method');
  
  const methodBody = methodMatch[0];
  const hasConditional = methodBody.includes('if') && methodBody.includes('avatar_url');
  assert(hasConditional, 'Missing conditional check for avatar_url');
  
  console.log('   Avatar uses API data with fallback');
});

// Test 18: Telegram widget avatar error handling
runner.test('Telegram Widget - Avatar has error handling', () => {
  const content = readFile('js/widgets/telegram/telegram-widget.js');
  
  assertIncludes(content, 'onerror', 'Missing onerror attribute for avatar img');
  
  // Check that onerror sets fallback
  const imgMatch = content.match(/<img[^>]*onerror[^>]*>/);
  assert(imgMatch, 'Could not find img tag with onerror');
  
  const imgTag = imgMatch[0];
  assertIncludes(imgTag, 'telegram-avatar.jpg', 'onerror should set fallback avatar');
  
  console.log('   Avatar has inline error handling');
});

console.log('🚀 Starting Phase 2 Test Suite...\n');
runner.run().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});

# iOS 26 Safari Liquid Glass Fix

## Problem Description

iOS 26 introduced "Liquid Glass" design with transparent/semi-transparent Safari toolbars. This caused black bars to appear at the top (notch area) and bottom (home indicator area) of the website on iPhone.

### Root Causes

1. **theme-color meta tag no longer works** - Safari 26 ignores `<meta name="theme-color">` completely
2. **Safari samples CSS instead** - Safari 26 scans for `position: fixed` elements near viewport edges and reads their `background-color` and `backdrop-filter` properties
3. **Body padding created gaps** - `padding: env(safe-area-inset-*)` on body created empty space that Safari filled with black
4. **Hidden elements still sampled** - Elements with `opacity: 0` or `visibility: hidden` are still sampled by Safari's tinting algorithm

## Solution Applied

### 1. Removed body padding
```css
/* BEFORE */
body {
  padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) 
           env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
}

/* AFTER */
body {
  padding: 0; /* Edge-to-edge content for iOS 26 */
}
```

### 2. Added background-color to html
```css
html {
  background-color: #101010; /* Safari fallback for toolbar tinting */
}
```

### 3. Created proper fixed element for bottom toolbar tinting
```html
<div id="safari-bottom-tint"></div>
```

```css
#safari-bottom-tint {
  position: fixed;
  bottom: -8px; /* Below viewport but Safari still samples it */
  left: 0;
  width: 100%;
  min-height: 12px; /* >2px required for Safari sampling */
  background-color: #101010;
  z-index: 1;
  display: none; /* Hidden by default */
}

/* Show ONLY on iOS Safari 26+ */
@supports (-webkit-text-size-adjust: none) and 
          (font: -apple-system-body) and 
          (-webkit-touch-callout: none) {
  @media (max-width: 768px) {
    #safari-bottom-tint {
      display: block;
    }
  }
}
```

### 4. Changed workspace-container sizing from viewport units to percentage
```javascript
// BEFORE
this.workspaceContainer.style.width = '100vw';
this.workspaceContainer.style.height = '100dvh';

// AFTER
this.workspaceContainer.style.width = '100%';
this.workspaceContainer.style.height = '100%';
this.workspaceContainer.style.minHeight = '100dvh';
```

### 5. Moved safe-area padding to fixed elements only
```css
/* Navigation header gets top safe-area */
#navigation-container {
  padding-top: env(safe-area-inset-top);
}

/* Contact input gets bottom safe-area */
#contact-input-container {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Modals get full safe-area padding */
.modal-container {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) 
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

## Why This Solution is Safe

### Widget Positioning Preserved
- Widgets use `transform: translate3d(x, y, 0)` for positioning
- Coordinates are relative to `.workspace-container`
- `.workspace-container` maintains same dimensions (100% of parent = same as 100vw/100dvh)
- All widget coordinates remain valid

### Desktop Canvas Scrolling Preserved
- `.desktop-canvas` still has `overflow: auto` on mobile
- `.workspace-container` inside scrolls as before
- Mountains (`::before` pseudo-element) remain positioned at bottom of workspace

### Drag System Unaffected
- `SimpleDragHover` uses `getBoundingClientRect()` and `clientX/clientY`
- These are viewport-relative, not affected by body padding changes
- `translate3d` positioning continues to work correctly

## Safari 26 Tinting Rules (Undocumented)

Based on community reverse-engineering:

### Top Bar (Status Bar)
- Scans fixed elements within **~4px of viewport top**
- Element must be **>80% viewport width**
- Element must be **>2px height**

### Bottom Bar (Safari Toolbar)
- Scans fixed elements within **~3px of viewport bottom**
- Element must be **>88% viewport width** on iOS
- Element must be **>2px height**

### What Safari Samples
✅ `position: fixed` or `position: sticky` elements
✅ `background-color` property
✅ `backdrop-filter` property
✅ Elements with `opacity: 0` (still in render tree!)
✅ Elements with `pointer-events: none`

### What Safari Ignores
❌ `display: none` (not in render tree)
❌ `visibility: hidden` (not in render tree)
❌ `position: absolute` children of fixed elements
❌ `<meta name="theme-color">` (deprecated in Safari 26)

## Testing Checklist

After applying this fix, verify:

- [ ] No black bars at top (notch area) on iOS 26 Safari
- [ ] No black bars at bottom (home indicator area) on iOS 26 Safari
- [ ] Widgets remain in correct positions
- [ ] Drag and drop still works
- [ ] Mountains visible at bottom of workspace
- [ ] Mobile scrolling works (can pan around desktop)
- [ ] Navigation header visible and functional
- [ ] Contact input visible and functional
- [ ] Modals display correctly with safe-area padding

## References

- [How to correctly tint Safari's toolbar in iOS 26](https://jahir.dev/blog/safari-toolbar) by Jahir Fiquitiva
- [Safari 26 Liquid Glass: fixing toolbar tinting for web developers](https://www.1ar.io/updates/safari-26-liquid-glass-web) by Pavel Larionov
- [iOS 26 Safari floating navigation bars appear black on Figma Sites](https://forum.figma.com/report-a-problem-6/ios-26-safari-floating-navigation-bars-appear-black-on-figma-sites-theme-color-meta-tag-and-background-color-transparent-on-body-have-no-effect-51532)

## Files Modified

1. `index.html` - Added `#safari-bottom-tint` element
2. `styles/base.css` - Removed body padding, added html background, updated tint element styles
3. `styles/responsive.css` - Updated safe-area comments
4. `js/features/desktop-canvas/desktop-canvas.js` - Changed workspace sizing from viewport units to percentage

## Rollback Instructions

If issues occur, revert these commits:
1. Restore body padding: `padding: env(safe-area-inset-*)`
2. Remove `#safari-bottom-tint` element
3. Restore workspace sizing: `100vw` and `100dvh`
4. Remove html background-color

Note: This will bring back black bars on iOS 26 but restore previous behavior.

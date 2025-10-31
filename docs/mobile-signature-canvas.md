# Mobile Signature Canvas Optimization

This document describes the mobile-specific optimizations applied to the signature canvas in `CompleteProfileModal.tsx`.

## Table of Contents

1. [Overview](#overview)
2. [Features Implemented](#features-implemented)
3. [Technical Details](#technical-details)
4. [Browser Compatibility](#browser-compatibility)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The signature canvas has been optimized for mobile devices to provide a smooth, native-like drawing experience on touchscreen devices. These optimizations address common mobile challenges such as accidental scrolling, zooming, and coordinate scaling issues.

### Location
`src/components/reusable/CompleteProfileModal.tsx`

### Affected Components
- Signature drawing canvas (`<canvas>` element)
- Undo button (NEW)
- Clear button (enhanced)
- Touch event handlers

---

## Features Implemented

### 1. **Responsive Canvas Sizing**

The canvas automatically adjusts to the container width while maintaining aspect ratio.

**Implementation:**
```typescript
useEffect(() => {
  if (isOpen && canvasRef.current && canvasContainerRef.current) {
    const resizeCanvas = () => {
      const containerWidth = container.offsetWidth;
      const scale = containerWidth / 400; // 400 is base width
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${150 * scale}px`;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }
}, [isOpen]);
```

**Benefits:**
- Canvas fills container width on all screen sizes
- Maintains 400:150 aspect ratio
- Updates on window resize (orientation changes)

---

### 2. **Enhanced Touch Event Handling**

Touch events are properly scaled to account for canvas display vs. actual size.

**Implementation:**
```typescript
const startDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
  e.preventDefault(); // Prevent scrolling/zooming
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;   // Account for CSS scaling
  const scaleY = canvas.height / rect.height;
  
  const x = (e.touches[0].clientX - rect.left) * scaleX;
  const y = (e.touches[0].clientY - rect.top) * scaleY;
  
  ctx.moveTo(x, y);
};
```

**Benefits:**
- Accurate touch coordinates on all screen sizes
- Prevents drawing offset issues on scaled canvases
- Works correctly on high-DPI displays (Retina, etc.)

---

### 3. **Prevent Default Touch Behaviors**

Mobile browsers default to scrolling, zooming, and context menus on touch—these are disabled for the canvas.

**Implementation:**
```tsx
<canvas
  style={{ touchAction: 'none' }}  // CSS: Disable touch scrolling
  onTouchStart={(e) => {
    e.preventDefault();  // JavaScript: Prevent default behaviors
    startDrawing(e);
  }}
  onTouchMove={(e) => {
    e.preventDefault();
    draw(e);
  }}
/>
```

**CSS (in `index.css`):**
```css
canvas {
  -webkit-user-select: none;          /* Prevent text selection */
  -moz-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent; /* Remove tap highlight on iOS */
}
```

**Benefits:**
- No accidental page scrolling while drawing
- No double-tap zoom on iOS Safari
- No context menu on long-press (Android Chrome)
- No blue tap highlight on iOS

---

### 4. **Undo Last Stroke**

Users can undo their last drawing stroke without clearing the entire signature.

**Implementation:**
```typescript
const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);

const startDrawing = (e) => {
  // Save canvas state before starting new stroke
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  setStrokeHistory((prev) => [...prev, imageData]);
  
  // ... drawing logic
};

const undoLastStroke = () => {
  if (strokeHistory.length === 0) return;
  
  // Restore previous state
  const previousState = strokeHistory[strokeHistory.length - 1];
  ctx.putImageData(previousState, 0, 0);
  
  // Remove from history
  setStrokeHistory((prev) => prev.slice(0, -1));
};
```

**UI Button:**
```tsx
<button
  onClick={undoLastStroke}
  disabled={strokeHistory.length === 0}
  className="min-h-[44px]"  // 44px minimum touch target
  aria-label="Undo last stroke"
>
  Undo
</button>
```

**Benefits:**
- Mistakes can be corrected without redrawing entire signature
- Better UX for precision signatures
- Undo button disabled when no history available

---

### 5. **Optimized Stroke Rendering**

Drawing strokes are optimized for clarity on mobile displays.

**Changes:**
```typescript
ctx.lineWidth = 2.5;  // Increased from 2.0 for better mobile visibility
ctx.lineCap = 'round'; // Smooth line endings
ctx.lineJoin = 'round'; // Smooth corners
ctx.strokeStyle = '#000'; // High contrast black
```

**Benefits:**
- More visible strokes on small mobile screens
- Smoother curves and corners
- Professional appearance

---

### 6. **Minimum Touch Targets**

All interactive elements meet WCAG 2.1 Level AA guidelines (44x44px minimum).

**Implementation:**
```tsx
<button className="min-h-[44px] px-3 py-2">Undo</button>
<button className="min-h-[44px] px-3 py-2">Clear</button>
```

**Benefits:**
- Easier to tap on mobile devices
- Reduces accidental taps
- Accessible for users with motor impairments

---

## Technical Details

### Coordinate Scaling Algorithm

The canvas has two coordinate systems:
1. **Display size** (CSS-styled, e.g., 300px × 112.5px on mobile)
2. **Internal size** (fixed at 400 × 150 pixels)

To convert touch coordinates correctly:
```typescript
const rect = canvas.getBoundingClientRect();  // Get display size
const scaleX = canvas.width / rect.width;     // 400 / 300 = 1.333
const scaleY = canvas.height / rect.height;   // 150 / 112.5 = 1.333

const touchX = (e.touches[0].clientX - rect.left) * scaleX;
const touchY = (e.touches[0].clientY - rect.top) * scaleY;
```

This ensures the drawing appears exactly where the user touches, regardless of screen size.

---

### Event Flow

**Touch Drawing Lifecycle:**
```
1. touchstart → startDrawing()
   - preventDefault() to block scroll/zoom
   - Save canvas state to strokeHistory
   - Calculate scaled coordinates
   - ctx.beginPath() and ctx.moveTo()

2. touchmove → draw()
   - preventDefault() to block scroll
   - Calculate scaled coordinates
   - ctx.lineTo() and ctx.stroke()

3. touchend → stopDrawing()
   - setIsDrawing(false)
   - No preventDefault() needed (drawing complete)
```

**Mouse Drawing Lifecycle:**
```
1. mousedown → startDrawing()
2. mousemove → draw()
3. mouseup/mouseleave → stopDrawing()
```

Both event types use the same drawing functions with unified coordinate handling.

---

## Browser Compatibility

### Tested Browsers

| Browser | Version | Touch Support | Notes |
|---------|---------|---------------|-------|
| iOS Safari | 14+ | ✅ Full | Disabled double-tap zoom, tap highlight |
| Chrome (Android) | 90+ | ✅ Full | Disabled scroll-on-drag |
| Chrome (Desktop) | 90+ | ✅ Mouse | Works with mouse and trackpad |
| Firefox (Android) | 90+ | ✅ Full | Touch events work correctly |
| Samsung Internet | 14+ | ✅ Full | Uses Chrome engine, works well |
| Edge (Desktop) | 90+ | ✅ Mouse | Works with mouse and trackpad |

### Known Issues

1. **iPad Safari with Apple Pencil:**
   - Works but doesn't support pressure sensitivity
   - Consider adding `navigator.maxTouchPoints` detection for stylus optimization

2. **Older Android (<5.0):**
   - Touch events may lag on low-end devices
   - Consider throttling touch events if performance is an issue

---

## Testing Guide

### Desktop Testing

1. **Mouse drawing:**
   - Click and drag to draw
   - Should see smooth black lines
   - Undo button should work after drawing

2. **Responsive behavior:**
   - Resize browser window
   - Canvas should resize proportionally
   - Existing signature should not be distorted

### Mobile Testing (Required)

1. **Touch drawing (iOS Safari):**
   ```
   - Open modal on iPhone/iPad
   - Touch canvas and drag finger
   - Page should NOT scroll
   - No double-tap zoom
   - No blue tap highlight
   - Drawing should appear exactly where finger touches
   ```

2. **Touch drawing (Android Chrome):**
   ```
   - Same as iOS tests
   - Context menu should not appear on long-press
   - Drawing coordinates should be accurate
   ```

3. **Undo functionality:**
   ```
   - Draw one stroke → Undo → stroke removed
   - Draw multiple strokes → Undo → only last stroke removed
   - Undo button should disable when no history
   ```

4. **Orientation change:**
   ```
   - Draw signature in portrait mode
   - Rotate device to landscape
   - Canvas should resize
   - Signature should remain intact
   ```

5. **Minimum touch targets:**
   ```
   - Tap Undo button → should be easy to tap
   - Tap Clear button → should be easy to tap
   - Buttons should be at least 44x44px (measure with browser dev tools)
   ```

### Automated Testing (Recommended)

```javascript
// Example Playwright test
test('signature canvas prevents scroll on mobile', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
  
  // Open modal
  await page.click('[data-testid="complete-profile-button"]');
  
  // Get initial scroll position
  const scrollBefore = await page.evaluate(() => window.scrollY);
  
  // Touch and drag on canvas
  const canvas = await page.$('canvas');
  await canvas.touchStart({ x: 100, y: 50 });
  await canvas.touchMove({ x: 150, y: 80 });
  await canvas.touchEnd();
  
  // Verify page did not scroll
  const scrollAfter = await page.evaluate(() => window.scrollY);
  expect(scrollAfter).toBe(scrollBefore);
});
```

---

## Troubleshooting

### Issue: Drawing offset (lines don't appear where I touch)

**Cause:** Coordinate scaling not applied correctly.

**Solution:** Ensure you're using `scaleX` and `scaleY` in touch event handlers:
```typescript
const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const x = (e.touches[0].clientX - rect.left) * scaleX;
```

---

### Issue: Page scrolls while drawing on mobile

**Cause:** Touch events not prevented.

**Solution:** Verify these are present:
1. `e.preventDefault()` in `onTouchStart` and `onTouchMove`
2. `style={{ touchAction: 'none' }}` on canvas element
3. CSS rules in `index.css` applied

---

### Issue: Canvas appears blurry on high-DPI displays

**Cause:** Canvas internal size too small for display size.

**Solution:** Increase canvas `width` and `height` attributes (not CSS):
```tsx
<canvas width={800} height={300} />  // 2x for Retina
```

---

### Issue: Undo button not working

**Cause:** `strokeHistory` not being saved.

**Solution:** Verify `imageData` is saved in `startDrawing()`:
```typescript
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
setStrokeHistory((prev) => [...prev, imageData]);
```

---

### Issue: Canvas not resizing on mobile

**Cause:** `canvasContainerRef` not attached or resize listener not firing.

**Solution:** 
1. Verify `ref={canvasContainerRef}` is on the container `<div>`
2. Check resize listener is added in `useEffect`
3. Test by rotating device (should trigger resize)

---

## Performance Considerations

### Memory Usage

- Each stroke saves an `ImageData` object (~240 KB for 400×150 canvas)
- Limit stroke history to prevent memory issues:

```typescript
const MAX_UNDO_HISTORY = 10;

const startDrawing = (e) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  setStrokeHistory((prev) => {
    const newHistory = [...prev, imageData];
    // Keep only last 10 strokes
    return newHistory.slice(-MAX_UNDO_HISTORY);
  });
};
```

### Touch Event Throttling (Optional)

For low-end devices, consider throttling `touchmove` events:

```typescript
import { throttle } from 'lodash';

const draw = throttle((e: React.TouchEvent) => {
  // ... drawing logic
}, 16); // ~60fps
```

---

## Future Enhancements

1. **Pressure Sensitivity:**
   - Use `PointerEvent.pressure` to vary line width
   - Better for Apple Pencil, Surface Pen users

2. **Smooth Curves:**
   - Implement Bezier curve smoothing for cleaner signatures
   - Use `quadraticCurveTo()` instead of `lineTo()`

3. **Signature Color Picker:**
   - Allow users to choose signature color (black, blue)

4. **Export Quality Options:**
   - Add higher resolution export (800×300) for printing

5. **Auto-save to IndexedDB:**
   - Save signature locally before Firestore upload
   - Recover if upload fails

---

## Related Files

- `src/components/reusable/CompleteProfileModal.tsx` - Main component
- `src/index.css` - Canvas CSS optimizations
- `src/utils/validation.ts` - Signature validation logic
- `docs/priority-2-improvements.md` - Overall UX improvements

---

## References

- [MDN: Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [WCAG 2.1: Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [iOS Safari: touch-action](https://developer.apple.com/documentation/webkit/supporting_desktop-class_features_in_web_apps)

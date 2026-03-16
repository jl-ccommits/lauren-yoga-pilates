# Mobile Editor Redesign — Bottom Sheet Editor

**Date:** 2026-03-15
**Status:** Approved

## Problem

Lauren edits routines on her phone and the current experience is painful:
- Inline text inputs are tiny and hard to tap
- Block properties (title, emoji, color, equipment) can't be edited at all
- The overall add/edit/reorder workflow is clunky on mobile

## Approach

**Bottom Sheet Editor** — Replace inline editing with slide-up panels (iOS-native pattern). Tapping any block or step in edit mode opens a full-width editor sheet from the bottom with large inputs, pickers, and toggles.

Design principles:
- Simple by default, power features accessible but not in your face
- Dead-simple, notes-app feel with large touch targets
- Keep single HTML file architecture

## Bottom Sheet Component

- Slides up from bottom with dimmed backdrop overlay
- Two heights: half-screen (steps) and tall (blocks with more fields)
- Drag handle at top for visual affordance
- Close via: tap backdrop, or "Done" button
- Smooth CSS transition (transform: translateY)
- Main routine view stays visible behind backdrop for context

## Block Editor Sheet

Opens when tapping a block header in edit mode. Fields (top to bottom):

1. **Block Title** — large text input, full width
2. **Emoji** — tap to open emoji grid (pre-selected fitness/yoga emojis + free-text input)
3. **Color** — row of color swatches matching existing theme vars (--sage, --slate, --rose, etc.)
4. **Equipment** — toggle chips: Ball, Band, Weights
5. **"Done" button** — closes sheet, saves to state

Block-level actions (bottom of sheet):
- Move Up / Move Down (large buttons)
- Duplicate Block
- Mirror Block (expose existing mirrorOf functionality)
- Delete Block (red, with confirmation)

## Step Editor Sheet

Opens when tapping a step row in edit mode. Fields:

1. **Step Name** — large text input, full width
2. **Detail** — multi-line textarea (3-4 visible lines)
3. **Emoji** — same picker as blocks
4. **Pulse Tag** — large toggle switch with 🔥 icon

Step-level actions:
- Move Up / Move Down
- Delete Step (red, with confirmation)

Quick-add: "Add Another Step" button after saving, for rapid entry without close/reopen.

## Routine-Level Improvements

- "Add Block" button at bottom: full-width, large touch target (min 48px)
- Per-block "Add Step" button at end of steps list: same sizing
- Block reorder arrows: keep up/down buttons, enlarge touch targets
- All interactive elements: minimum 48px height per iOS guidelines

## No Changes To

- List/Quiz mode toggle (already works)
- Save/Load/New routine flow (already functional)
- Equipment filter chips at top
- Data format in localStorage (fully backward compatible)

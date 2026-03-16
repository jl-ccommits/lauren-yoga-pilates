# Quick-Entry Text Mode — Design Doc

**Date:** 2026-03-15
**Status:** Approved

## Problem

Lauren plans classes by typing exercise names as a text list in Apple Notes, then has to re-enter them one-by-one into the app. The bottom sheet editors (shipped today) make editing individual steps/blocks comfortable on mobile, but creating a routine from scratch is still tedious — she has to add blocks one at a time, add steps one at a time, and type into separate fields.

## Solution

Add a **Quick-Entry Text Mode** that lets Lauren type exercise names directly as text (one per line) inside the app, replacing her Apple Notes workflow. Two entry points:

1. **Per-Block Quick Add** — rapidly add steps to a single block
2. **Routine-Level Quick Build** — create an entire routine (blocks + steps) from a text dump

## Per-Block Quick Add

**Location:** In edit mode, each block gets a "Quick Add Steps" button next to "+ Add Step".

**Flow:**
1. Tap "Quick Add Steps" → bottom sheet opens with large multi-line textarea
2. Placeholder: "Type one exercise per line..."
3. Type exercise names, one per line
4. Tap "Add Steps" → creates one step per non-empty line
5. Steps are appended to existing steps in the block
6. She taps individual steps later to add details/cues via step editor sheet

**Step defaults:** `{ name: <line text>, detail: "", emoji: "✨", tags: [] }`

## Routine-Level Quick Build

**Location:** In edit bar, new "Quick Build" button alongside Save, Routines, New.

**Flow:**
1. Tap "Quick Build" → full-height bottom sheet with large textarea
2. Placeholder shows syntax example
3. Type entire class plan using simple syntax:
   - `## Block Name` → creates a new block
   - Plain lines → creates steps within current block
   - `---` → creates a transition block
   - Empty lines → ignored
4. Tap "Build Routine" → blocks and steps are created and appended to current routine

**Smart defaults:**
- Block colors auto-cycle: Amber (first/warm-up) → Slate → Rose → Teal → Sage → repeat
- Block emoji: ✨
- Step emoji: ✨
- Equipment: none (added later via block editor sheet)

## Full Workflow (Replaces Apple Notes)

1. Edit → Quick Build → type whole class plan as text
2. "Build Routine" → blocks and steps created
3. Tap blocks to set color/equipment/emoji
4. Tap steps to add cues/details
5. Save

## Out of Scope (YAGNI)

- Auto-emoji detection
- Clipboard paste button
- Undo for Quick Build
- Inline detail syntax (e.g., "Cat/Cow - detail here")
- Step/block template library

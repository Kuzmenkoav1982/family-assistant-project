# Technical Freeze — SectionPageFrame baseline

## Build

- Final archival build: `d95bd59`
- Date: 2026-05-21

## Status

- W4 CLOSED
- W5 CLOSED
- cleanup CLOSED
- archive/closeout CLOSED

## Migration result

| Wave | Before | After | Delta |
|------|--------|-------|-------|
| W4   | 31     | 19    | −12   |
| W5   | 19     | 0     | −19   |
| **Total** | **31** | **0** | **−31** |

- `SectionHero` fully removed from codebase
- Deleted: `section-hero.tsx`
- Ejects: `0`
- Pattern violations: `0`

## Current architectural baseline

- `SectionPageFrame` is the only canonical page shell
- Supported width tokens: `narrow` / `standard` / `wide`
- Supported variants: `hero` / `light`

## Regression policy

- Reintroduction of `SectionHero` is not allowed
- Guard script: `scripts/check-no-section-hero.mjs`
- Run: `node scripts/check-no-section-hero.mjs`
- Must fail on any new `SectionHero` reference in code roots

## What is intentionally not part of this freeze

- investor deck refresh
- platform passport reconciliation
- canonical hub map
- RAG / Domovoy investor framing
- presentation / demo / Q&A materials

These items move to `IR-1 Product & Investor Readiness`.

## Purpose of this freeze

This document fixes the technical baseline after full removal of legacy `SectionHero`
and before starting the investor-readiness track.

Legacy `SectionHero` chapter: **fully closed**.

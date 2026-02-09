# Avatar Design Fix

## Problem

Candidate avatars were reported as "bugged", likely due to inconsistent rendering of the fallback initials within the existing `Avatar` component, causing visual glitches or poor alignment (e.g. cut-off text, improper background).

## Solution

I have replaced the generic `Avatar` component with custom-designed, robust implementations for Candidate profiles:

1.  **Candidate Detail View (`CandidateDetailFrame.tsx`)**:
    - Replaced the 96px avatar with a `rounded-2xl` container.
    - Added a premium gradient background (`bg-gradient-to-br from-primary/10 to-primary/5`).
    - Ensured the initials (`text-3xl font-sora`) are perfectly centered and readable.
    - Added safety logic: Uses "CA" if name is missing, ensuring no empty boxes.

2.  **Candidate Table (`CandidateTable.tsx`)**:
    - Replaced the 28px avatar with a slightly larger 32px (`h-8 w-8`) `rounded-lg` design.
    - Applied consistent gradient styling and typography.
    - Added fallback initials ("CA") for empty names.

## Result

The avatars should now appear polished, consistently styled, and free of layout bugs.

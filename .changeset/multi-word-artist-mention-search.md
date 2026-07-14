---
'@scilent-one/ui': patch
---

Allow multi-word artist (`#`) mention searches. The mention popover previously closed on the first space, making artists like "Massive Attack" unsearchable. A new bounded `findSuggestionMatch` (`createBoundedSpaceMatcher`) lets the query span multiple space-separated words while still exiting cleanly on double spaces, newlines, or once word/character caps are exceeded. User (`@`) mentions are unchanged.

---
"@scilent-one/ui": minor
---

### Features
- Add `Spinner` component from shadcn registry for loading indicators
- Add `Empty` component from shadcn registry for empty state UI patterns
- Add comprehensive Storybook stories for all components

### Improvements
- Move all component stories to dedicated `stories/` folder for better organization
- Add stories for 15+ components that were missing coverage:
  - Core: avatar, label, select, separator, skeleton, textarea, toggle, toggle-group, tooltip, collapsible
  - Overlay: dropdown-menu, popover, hover-card, sheet, scroll-area
  - Social: user-avatar, user-card, follow-button, mention-text

### Accessibility Fixes
- Fix primary color contrast ratio (3.05 → 5.0+) for WCAG AA compliance
- Fix destructive color contrast with proper foreground color
- Fix muted-foreground contrast ratio (4.38 → 5.0+)
- Add `tabIndex` to ScrollArea viewport for keyboard accessibility
- Add automatic `aria-label` to FollowButton when `iconOnly` is true

All 176 Storybook accessibility tests now pass.

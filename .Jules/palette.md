# Palette's Journal

## 2026-07-24 - [Newsletter Subscription Feature Accessibility & Usability]
**Learning:** Found that the landing page's newsletter subscription form had no click handler, was using generic input types, and was completely inaccessible via keyboard navigation (Enter key did not trigger subscription) and lacked ARIA labels.
**Action:** Enhance newsletter block to use proper input type, bind click & keyboard Enter events, and include semantic aria-labels to make it fully accessible and intuitive.

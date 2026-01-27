# Değer360 Brand Identity & Color Usage Guide

## Overview
This document outlines the complete color palette and usage guidelines for the Değer360 brand. These colors are consistently used across the website to maintain brand recognition and create a cohesive user experience.

---

## Primary Brand Colors

### 🟠 Primary Orange
- **Hex:** `#FF6B35`
- **RGB:** `rgb(255, 107, 53)`
- **Usage:** 
  - Primary call-to-action buttons
  - Main accent color for highlights
  - Key interactive elements
  - Hero section accents
  - Form focus states
- **When to Use:** 
  - Primary buttons and CTAs
  - Important highlights in headings
  - Active states and focus indicators
  - Mobile sticky CTAs
- **Accessibility:** Ensure sufficient contrast when used with white text (meets WCAG AA standards)

### 🔴 Primary Orange Hover
- **Hex:** `#FF5722`
- **RGB:** `rgb(255, 87, 34)`
- **Usage:**
  - Hover state for primary orange buttons
  - Active button states
  - Interactive element feedback
- **When to Use:** Always paired with primary orange for hover/active states

### 🔵 Primary Blue
- **Hex:** `#0077B6`
- **RGB:** `rgb(0, 119, 182)`
- **Usage:**
  - Secondary buttons
  - Trust indicators
  - Dashboard cards and UI elements
  - Scrollbar color
  - Links and navigation accents
- **When to Use:**
  - Secondary actions (alternative to primary orange)
  - Trust-building elements
  - Dashboard and portal interfaces
  - Professional, trustworthy contexts

### 💙 Light Blue
- **Hex:** `#90E0EF`
- **RGB:** `rgb(144, 224, 239)`
- **Usage:**
  - Background accents
  - Subtle highlights
  - Card backgrounds (with gradients)
  - Soft visual separations
- **When to Use:**
  - Background elements that need subtle color
  - Gradient backgrounds
  - Light, airy design contexts

### 🔷 Dark Blue
- **Hex:** `#023E8A`
- **RGB:** `rgb(2, 62, 138)`
- **Usage:**
  - Main headings (H1, H2)
  - Important text elements
  - Hero section titles
  - Scrollbar hover state
  - Secondary button hover states
- **When to Use:**
  - Primary headings for maximum impact
  - Important information that needs emphasis
  - Professional, authoritative contexts

---

## Neutral Colors

### Neutral-50
- **Hex:** `#F8F9FA`
- **RGB:** `rgb(248, 249, 250)`
- **Usage:**
  - Light background sections
  - Input field backgrounds
  - Card backgrounds
  - Subtle dividers
- **When to Use:** 
  - Form inputs (default state)
  - Light section backgrounds
  - Subtle visual hierarchy

### Neutral-100
- **Hex:** `#E9ECEF`
- **RGB:** `rgb(233, 236, 239)`
- **Usage:**
  - Hover states for light backgrounds
  - Subtle borders
  - Background variations
- **When to Use:** 
  - Input hover states
  - Subtle background variations

### Neutral-200
- **Hex:** `#DEE2E6`
- **RGB:** `rgb(222, 226, 230)`
- **Usage:**
  - Borders and dividers
  - Card borders
  - Section separators
  - Mobile CTA borders
- **When to Use:**
  - Visual separations
  - Card and component borders
  - Subtle structural elements

### Neutral-800
- **Hex:** `#343A40`
- **RGB:** `rgb(52, 58, 64)`
- **Usage:**
  - Body text
  - Secondary headings
  - Descriptions and paragraphs
  - Trust messages
- **When to Use:**
  - Primary text content
  - Secondary information
  - Readable, professional text

---

## Status & Functional Colors

These colors are used in admin panels, dashboards, and status indicators:

### 🟢 Green (Success/Completed)
- **Usage:** Completed status, success messages, payment status
- **Classes:** `bg-green-50`, `border-green-200`, `text-green-700`

### 🟡 Yellow (Pending/Warning)
- **Usage:** Pending status, warning indicators, tahkim status
- **Classes:** `bg-yellow-50`, `border-yellow-200`, `text-yellow-700`

### 🔵 Blue (In Progress/Active)
- **Usage:** Active status, in-progress items, başvuru_alindi status
- **Classes:** `bg-blue-50`, `border-blue-200`, `text-blue-700`

### 🔴 Red (Urgent/Error)
- **Usage:** Urgent status, error messages, validation errors
- **Classes:** `bg-red-50`, `border-red-200`, `text-red-700`

### 🟠 Orange (Document/Expert)
- **Usage:** Evrak ekspertiz status
- **Classes:** `bg-orange-50`, `border-orange-200`, `text-orange-700`

### 🟣 Indigo (Insurance Application)
- **Usage:** Sigorta başvurusu status
- **Classes:** `bg-indigo-50`, `border-indigo-200`, `text-indigo-700`

### 💗 Pink (Negotiation)
- **Usage:** Müzakere status
- **Classes:** `bg-pink-50`, `border-pink-200`, `text-pink-700`

### 🟣 Purple (Completed/Final)
- **Usage:** Tamamlandı status
- **Classes:** `bg-purple-50`, `border-purple-200`, `text-purple-700`

---

## Color Usage Patterns

### Button Variants

1. **Primary Button**
   - Background: `primary-orange` (#FF6B35)
   - Hover: `primary-orange-hover` (#FF5722)
   - Text: White
   - Shadow: `shadow-lg` → `shadow-xl` on hover
   - **Use for:** Main CTAs, form submissions, primary actions

2. **Secondary Button**
   - Background: `primary-blue` (#0077B6)
   - Hover: `dark-blue` (#023E8A)
   - Text: White
   - Shadow: `shadow-lg` → `shadow-xl` on hover
   - **Use for:** Alternative actions, secondary CTAs

3. **Outline Button**
   - Border: `primary-orange` (#FF6B35)
   - Text: `primary-orange` (#FF6B35)
   - Hover: Background becomes `primary-orange`, text becomes white
   - **Use for:** Tertiary actions, less prominent CTAs

### Typography Colors

- **H1/H2 Headings:** `dark-blue` (#023E8A)
- **Accent Text in Headings:** `primary-orange` (#FF6B35)
- **Body Text:** `neutral-800` (#343A40)
- **Secondary Text:** `neutral-600` (standard Tailwind)
- **Trust Messages:** `neutral-600` (standard Tailwind)

### Form Elements

- **Input Background (default):** `neutral-50` (#F8F9FA)
- **Input Background (hover):** `neutral-100` (#E9ECEF)
- **Input Background (focus):** White
- **Input Border (focus):** `primary-orange` with ring
- **Error States:** `bg-red-50`, `focus:ring-red-500`

### Dashboard Cards

- **Card Background:** Gradient from `blue-50/50` to `white`
- **Card Border:** `border-blue-200`
- **Icon Background:** `bg-blue-100`
- **Icon Color:** `text-primary-blue`

### Scrollbar

- **Track:** `#f1f1f1` (light gray)
- **Thumb:** `primary-blue` (#0077B6)
- **Thumb Hover:** `dark-blue` (#023E8A)

---

## Design Principles

### Color Hierarchy
1. **Primary Actions:** Orange (#FF6B35) - Most important actions
2. **Secondary Actions:** Blue (#0077B6) - Alternative actions
3. **Information:** Dark Blue (#023E8A) - Headings and important text
4. **Backgrounds:** Neutrals - Subtle, non-distracting backgrounds

### Contrast & Accessibility
- All primary colors meet WCAG AA contrast standards when used with white text
- Dark blue (#023E8A) provides excellent readability for headings
- Neutral-800 (#343A40) ensures readable body text
- Always test color combinations for accessibility compliance

### Consistency Rules
- **Never** mix primary orange and primary blue as competing primary actions on the same screen
- **Always** use hover states that are darker versions of the base color
- **Maintain** consistent shadow patterns (shadow-lg → shadow-xl on hover)
- **Use** neutral backgrounds to let primary colors stand out

---

## Implementation Reference

### Tailwind CSS Classes

```javascript
// Primary Colors
'primary-orange': '#FF6B35'
'primary-orange-hover': '#FF5722'
'primary-blue': '#0077B6'
'light-blue': '#90E0EF'
'dark-blue': '#023E8A'

// Neutral Colors
'neutral-50': '#F8F9FA'
'neutral-100': '#E9ECEF'
'neutral-200': '#DEE2E6'
'neutral-800': '#343A40'
```

### Usage Examples

```tsx
// Primary CTA Button
<button className="bg-primary-orange hover:bg-primary-orange-hover text-white">
  Hemen Başvur
</button>

// Secondary Button
<button className="bg-primary-blue hover:bg-dark-blue text-white">
  Daha Fazla Bilgi
</button>

// Heading with Accent
<h1 className="text-dark-blue">
  Değer Kaybınızı{' '}
  <span className="text-primary-orange">Hesaplayın</span>
</h1>

// Dashboard Card
<div className="bg-gradient-to-b from-blue-50/50 to-white border border-blue-200">
  <div className="bg-blue-100 text-primary-blue">Icon</div>
</div>
```

---

## Brand Personality

The color palette reflects:
- **Trust & Professionalism:** Blue tones convey reliability and expertise
- **Energy & Action:** Orange creates urgency and encourages action
- **Clarity & Simplicity:** Neutral grays provide clean, uncluttered design
- **Modern & Approachable:** Balanced combination appeals to a wide audience

---

## File References

- **Color Definitions:** `tailwind.config.js`
- **Global Styles:** `src/app/globals.css`
- **Button Component:** `src/components/ui/button.tsx`
- **Hero Section:** `src/components/sections/hero-section.tsx`

---

## Version History

- **Created:** January 27, 2026
- **Last Updated:** January 27, 2026
- **Version:** 1.0

---

*This document should be referenced when making design decisions, creating new components, or updating existing UI elements to ensure brand consistency.*

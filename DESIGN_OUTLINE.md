# Değer360 Design Outline & Visual System

## Design Philosophy

Değer360 uses a modern, professional design system that balances trust-building elements (blue) with action-oriented accents (orange). The design emphasizes clarity, accessibility, and user-friendly interactions.

---

## Visual Hierarchy

### 1. Primary Visual Elements

#### Hero Section
- **Background:** White (`#FFFFFF`)
- **Heading:** Dark Blue (`#023E8A`) - Large, bold
- **Accent Text:** Primary Orange (`#FF6B35`) - Highlights key words
- **Body Text:** Neutral-800 (`#343A40`)
- **CTA Button:** Primary Orange with hover effect
- **Form Inputs:** Light neutral backgrounds with orange focus states

#### Navigation & Header
- **Background:** White with subtle shadow
- **Logo:** Brand colors (typically dark blue or combination)
- **Links:** Dark text, blue/orange accents on hover
- **Mobile Menu:** Clean, minimal design

#### Footer
- **Background:** Typically darker neutral or white
- **Text:** Neutral tones
- **Links:** Blue accents for interactivity

### 2. Component Design Patterns

#### Cards
- **Background:** Gradient from `blue-50/50` to `white`
- **Border:** `border-blue-200` (subtle)
- **Shadow:** Minimal, clean shadows
- **Hover:** Subtle scale and shadow increase
- **Icon Background:** `bg-blue-100`
- **Icon Color:** `text-primary-blue`

#### Buttons
- **Primary:** Orange background, white text, prominent shadow
- **Secondary:** Blue background, white text
- **Outline:** Orange border, orange text, fills on hover
- **States:** Clear hover, active, and disabled states
- **Transitions:** Smooth 300ms transitions

#### Forms
- **Input Background:** Neutral-50 (`#F8F9FA`)
- **Input Hover:** Neutral-100 (`#E9ECEF`)
- **Input Focus:** White background with orange ring
- **Error States:** Red backgrounds and borders
- **Labels:** Dark text for readability
- **Placeholders:** Lighter neutral tones

#### Status Badges
- **Background:** Light tinted backgrounds (50 opacity)
- **Border:** Matching colored borders (200 shade)
- **Text:** Darker matching color (700 shade)
- **Emoji:** Included for visual recognition

---

## Layout Principles

### Spacing System
- Consistent padding: `px-4 sm:px-6` for containers
- Section spacing: Generous vertical spacing between sections
- Card padding: `p-4` to `p-6` depending on content
- Button padding: `px-6 py-3` (md), `px-8 py-4` (lg)

### Typography Scale
- **H1:** `text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl`
- **H2:** Large, bold, dark blue
- **Body:** `text-base` to `text-lg`
- **Small Text:** `text-sm`
- **Font Family:** Inter (sans-serif)

### Grid & Container
- **Max Width:** Responsive containers with `max-w-4xl`, `max-w-6xl`
- **Centering:** `mx-auto` for centered content
- **Responsive:** Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints

---

## Color Application by Section

### Landing Page Structure

1. **Hero Section**
   - White background
   - Dark blue heading with orange accent
   - Orange primary CTA
   - Light form inputs

2. **Stats/Features Section**
   - Light backgrounds (neutral-50 or white)
   - Blue-tinted cards
   - Dark blue or neutral-800 text
   - Orange accents for numbers/important info

3. **Why Us Section**
   - Alternating backgrounds (white/light neutral)
   - Blue cards with icons
   - Dark text for readability

4. **Process Section**
   - Clean, step-by-step layout
   - Blue accents for steps
   - Orange for active/completed states

5. **FAQ Section**
   - White/light backgrounds
   - Blue accents for questions
   - Neutral text for answers

6. **CTA Section**
   - Prominent orange CTA button
   - Dark blue heading
   - White or light background

7. **Footer**
   - Darker background or white
   - Neutral text
   - Blue links

### Portal/Dashboard Pages

- **Background:** Light neutral or white
- **Cards:** Blue-tinted backgrounds with blue borders
- **Icons:** Blue backgrounds and colors
- **Status Indicators:** Color-coded badges
- **Navigation:** Clean, minimal with blue accents

### Admin Pages

- **Board View:** Color-coded columns by status
- **Cards:** Matching status colors
- **Actions:** Orange for primary, blue for secondary
- **Tables:** Clean, readable with subtle borders

---

## Interactive States

### Hover States
- **Buttons:** Darker shade of base color
- **Links:** Color change (blue or orange)
- **Cards:** Subtle scale (`scale-[1.02]`) and shadow increase
- **Inputs:** Background lightens, border appears

### Focus States
- **Buttons:** Maintain hover state
- **Inputs:** Orange ring (`focus:ring-2 focus:ring-primary-orange`)
- **Links:** Visible focus outline

### Active States
- **Buttons:** Pressed appearance (darker)
- **Navigation:** Highlighted with brand color

### Disabled States
- **Opacity:** `opacity-50`
- **Cursor:** `cursor-not-allowed`
- **Visual:** Muted appearance

---

## Responsive Design Patterns

### Mobile (< 640px)
- Single column layouts
- Full-width buttons
- Larger touch targets
- Sticky mobile CTA at bottom
- Simplified navigation (hamburger menu)

### Tablet (640px - 1024px)
- Two-column layouts where appropriate
- Adjusted spacing
- Maintained readability

### Desktop (> 1024px)
- Multi-column layouts
- Maximum content width constraints
- Hover states fully functional
- Sidebar navigation where applicable

---

## Animation & Transitions

### Standard Transitions
- **Duration:** `duration-300` (300ms)
- **Easing:** Default Tailwind easing
- **Properties:** `transition-all` for comprehensive transitions

### Scroll Animations
- Fade-in effects
- Slide-up animations
- Staggered reveals for lists

### Micro-interactions
- Button hover: Shadow increase (`shadow-lg` → `shadow-xl`)
- Card hover: Scale and shadow
- Input focus: Ring animation
- Loading states: Smooth transitions

---

## Accessibility Considerations

### Color Contrast
- All text meets WCAG AA standards
- Dark blue on white: Excellent contrast
- Orange on white: Meets standards
- Neutral-800 on white: High readability

### Focus Indicators
- Visible focus rings on all interactive elements
- Orange focus rings for brand consistency
- Keyboard navigation support

### Visual Feedback
- Clear hover states
- Obvious active states
- Disabled state indicators
- Error state highlighting

---

## Component Library Structure

### UI Components
- **Button:** Primary, Secondary, Outline variants
- **Badge:** Status badges with colors
- **Card:** Dashboard and content cards
- **Form Inputs:** Text, number, select inputs
- **Status Badge:** Color-coded status indicators

### Layout Components
- **Header:** Navigation and branding
- **Footer:** Site footer with links
- **Container:** Responsive content wrapper
- **Section:** Page sections with consistent spacing

### Feature Components
- **Hero Form:** Main CTA form
- **Dashboard Cards:** Summary cards
- **Status Board:** Kanban-style board
- **Mobile CTA:** Sticky mobile button

---

## Design Tokens Summary

### Colors
- **Primary Brand:** Orange (#FF6B35) & Blue (#0077B6)
- **Neutrals:** 50, 100, 200, 800 shades
- **Status:** Green, Yellow, Blue, Red, Orange, Indigo, Pink, Purple

### Typography
- **Font:** Inter (sans-serif)
- **Weights:** Regular, Semibold, Bold
- **Sizes:** Responsive scale from sm to 7xl

### Spacing
- **Scale:** Tailwind default (4px base)
- **Common:** 4, 6, 8, 12, 16, 24, 32

### Shadows
- **Small:** `shadow-sm`
- **Medium:** `shadow-lg`
- **Large:** `shadow-xl`
- **Hover:** Increase shadow size

### Border Radius
- **Small:** `rounded`
- **Medium:** `rounded-lg` (most common)
- **Large:** `rounded-xl`

---

## Best Practices

### Do's ✅
- Use orange for primary CTAs
- Use blue for trust-building elements
- Maintain consistent spacing
- Use neutral backgrounds
- Ensure proper contrast
- Include hover states
- Use smooth transitions
- Test on mobile devices

### Don'ts ❌
- Don't use orange and blue as competing primaries
- Don't skip hover states
- Don't use low contrast combinations
- Don't mix too many status colors
- Don't forget mobile experience
- Don't use colors without purpose
- Don't ignore accessibility
- Don't break spacing consistency

---

## Implementation Checklist

When creating new components or pages:

- [ ] Use brand colors from palette
- [ ] Include hover states
- [ ] Ensure proper contrast
- [ ] Add focus indicators
- [ ] Test responsive design
- [ ] Use consistent spacing
- [ ] Include smooth transitions
- [ ] Follow component patterns
- [ ] Test accessibility
- [ ] Match existing style

---

## File Structure Reference

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   ├── sections/        # Page sections
│   ├── forms/           # Form components
│   └── admin/           # Admin-specific components
├── app/
│   └── globals.css      # Global styles
└── tailwind.config.js   # Color definitions
```

---

*This design outline should be used as a reference when creating new features, components, or pages to ensure visual consistency across the Değer360 platform.*

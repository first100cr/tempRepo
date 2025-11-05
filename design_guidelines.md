# Design Guidelines: AI-Driven Flight Ticketing Platform

## Design Approach
**Reference-Based with Futuristic Enhancement**: Drawing inspiration from Google Flights' clean data presentation, Skyscanner's comparison UI, and Kayak's visual hierarchy, elevated with sci-fi/futuristic aesthetic elements and aviation imagery.

## Core Design Principles
- **Data Clarity First**: Price and flight information must be instantly scannable
- **Futuristic Sophistication**: Modern, tech-forward aesthetic with subtle gradients and glass-morphism
- **Trust Through Design**: Professional polish that conveys reliability for financial transactions
- **Progressive Disclosure**: Show essential info upfront, details on interaction

## Color Palette

**Primary Brand Colors:**
- Deep Space Blue: 222 47% 11% (dark backgrounds, headers)
- Electric Cyan: 195 91% 51% (primary actions, highlights)
- Bright Sky: 203 92% 75% (accents, active states)

**Neutral Foundation:**
- Charcoal: 220 13% 18% (card backgrounds dark mode)
- Soft Gray: 220 9% 46% (secondary text)
- Cloud White: 210 20% 98% (light mode backgrounds)

**Accent Colors:**
- Success Green: 142 71% 45% (price drops, deals)
- Alert Orange: 25 95% 53% (price increases, warnings)

**Dark Mode**: Primary interface mode with deep blues and glass-morphic cards

## Typography
**Font Families:**
- Primary: 'Inter' (Google Fonts) - UI elements, body text
- Accent: 'Space Grotesk' (Google Fonts) - Headlines, price displays

**Hierarchy:**
- Hero Headlines: 3xl-4xl, bold, Space Grotesk
- Section Headers: 2xl-3xl, semibold, Space Grotesk
- Card Titles: lg-xl, medium, Inter
- Body Text: base, regular, Inter
- Price Display: 2xl-3xl, bold, Space Grotesk with tabular-nums

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6

**Container Strategy:**
- Full-width hero: w-full with backdrop
- Content sections: max-w-7xl mx-auto
- Flight results: max-w-6xl for optimal reading
- Form elements: max-w-2xl for focus

## Component Library

### Navigation
- Fixed glass-morphic header (backdrop-blur-lg, bg-opacity-80)
- Logo left, search trigger center, user account right
- Subtle bottom border with Electric Cyan accent

### Hero Section
- Full-width parallax background with airport/airplane imagery
- Dark overlay (bg-black/50) for text legibility
- Centered search form with glass-morphic card design
- Large headline: "Find Your Perfect Flight with AI-Powered Insights"
- Search inputs: Origin, Destination, Dates, Passengers in grid layout
- Primary CTA: Large Electric Cyan button with subtle glow effect

### Flight Search Form
- Glass-morphic card (bg-white/10 dark, bg-white/90 light, backdrop-blur-lg)
- 4-column grid on desktop (origin, destination, dates, passengers)
- Stack to single column on mobile
- Icon prefixes for each input (Heroicons)
- Autocomplete dropdown with airline/airport codes
- Date picker with calendar icon, passenger selector with +/- controls

### Flight Results Cards
- Card design: Rounded-2xl, border, subtle shadow, hover lift effect
- Grid layout: Single column stack on mobile, maintains card integrity
- Card header: Airline logo left, flight number, aircraft type
- Route visual: Origin → Duration → Destination with connecting dots
- Price section: Large bold price, "Book Now" CTA button (Electric Cyan)
- Expandable details: Baggage, amenities, layover info
- Price prediction badge: Small pill showing "Price likely to drop 15%" in Success Green

### Price Prediction Panel
- Dedicated section with chart visualization
- Line chart showing 30-day price trend (use Chart.js via CDN)
- AI insight cards: "Best time to book", "Price confidence score"
- Color-coded recommendations (green = book now, orange = wait)

### Comparison View
- Side-by-side flight options in responsive grid (2-3 columns desktop)
- Highlight best value with subtle Electric Cyan border
- Quick filters: Price range slider, stops, departure time, airlines
- Sort options: Cheapest, Fastest, Best value (AI recommended)

### Feature Highlights Section
- 3-column grid on desktop: AI Predictions, Multi-Source Comparison, Price Alerts
- Icon + title + description format using Heroicons
- Glass-morphic cards with hover effects

### Footer
- 4-column layout: About, Features, Support, Legal
- Newsletter signup with inline form
- Social proof: "Trusted by 50,000+ travelers"
- Minimal, dark background matching Deep Space Blue

## Images

**Hero Background:**
- Large full-width image of modern airport terminal or airplane wing at sunset/sunrise
- Apply dark gradient overlay (from bottom: black/70, top: black/30)
- Parallax scroll effect for depth
- Image should convey: modern, clean, aspirational travel

**Section Backgrounds:**
- Subtle airplane silhouette patterns in backgrounds (very low opacity, 5-10%)
- Cloud formations as decorative elements between sections
- Use CSS background-attachment: fixed for subtle parallax

**UI Accents:**
- Small airplane icon animations for loading states
- Airline logos at actual size in flight cards
- Airport codes displayed with location icons

## Animations & Interactions
- Page transitions: Smooth fade-ins (300ms)
- Card hover: Subtle lift (translateY(-4px)) and shadow increase
- Price prediction: Count-up animation for numbers
- Loading states: Airplane icon flight path animation
- Search submit: Ripple effect from button
- Minimize overall animation - prioritize performance

## Responsive Behavior
- Mobile: Stack all multi-column layouts to single column
- Tablet: 2-column grids where appropriate
- Desktop: Full multi-column layouts with max-width containers
- Touch targets: Minimum 44px height for all interactive elements
- Navigation: Hamburger menu on mobile with slide-in drawer

## Accessibility
- Maintain dark mode throughout with proper contrast ratios (WCAG AA minimum)
- Form inputs with clear labels and error states
- Focus indicators visible on all interactive elements
- Screen reader friendly with proper ARIA labels
- Keyboard navigation support for all features

## Futuristic Elements
- Glass-morphism on major cards and overlays
- Subtle gradient meshes in backgrounds (Electric Cyan to Deep Space Blue)
- Neon-style glows on primary CTAs (very subtle, 2-4px)
- Geometric patterns as decorative elements
- Clean, sharp edges with strategic rounded corners (rounded-2xl)
- Holographic-style accents on AI prediction features
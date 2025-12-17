# AkaTech Design System & CSS Architecture

## Overview
This project utilizes **Tailwind CSS v4** with a custom theme configuration to ensure visual consistency, accessibility, and modularity. The design system is built around a "Premium/Gold" aesthetic with dark mode support.

## Architecture

### Directory Structure
- **`src/index.css`**: The core entry point for styles. It imports Tailwind and defines the `@theme` variables and `@layer` components.
- **`src/components/ui/`**: Reusable UI primitives (Buttons, Cards, Inputs).
- **`src/components/layout/`**: Layout components (Navbar, Footer).

### CSS Strategy
We leverage Tailwind's utility-first approach but abstract common patterns into semantic classes using `@layer components` to keep markup clean while maintaining flexibility.

## Design Tokens

### Colors
| Token | Light Value | Dark Value | Description |
|-------|-------------|------------|-------------|
| `akatech-gold` | `#C5A059` | `#C5A059` | Primary brand gold |
| `akatech-goldLight` | `#EEDC9A` | `#EEDC9A` | Highlight gold |
| `akatech-goldDark` | `#8B6914` | `#8B6914` | Shadow/Bronze gold |
| `akatech-dark` | `#080808` | `#080808` | Deep black background |
| `akatech-card` | `#141414` | `#141414` | Card background |

### Typography
- **Font Family**: `Inter` (Sans), `Playfair Display` (Serif).
- **Scale**: Tailwind default scale + custom line-heights.

### Animations
- **`animate-fade-in`**: Simple fade in.
- **`animate-fade-in-up`**: Fade in with upward movement.
- **`animate-shine`**: Gold sheen effect for text/borders.

## Reusable Classes

### Buttons
- **`.btn-primary`**: Gradient gold background, white text, hover lift effect.
- **`.btn-outline`**: Border gold, text gold, hover fill effect.

### Cards
- **`.glass-panel`**: Backdrop blur, subtle gold border, adaptive background opacity.
- **`.card-hover`**: Hover state utility for cards (lift + shadow).

### Text
- **`.text-gradient-gold`**: Shimmering gold gradient text effect.

## Accessibility
- Color contrast ratios checked for `akatech-goldDark` on white (AA compliant).
- Focus states are preserved (browser default + custom ring).
- Semantic HTML tags (`<nav>`, `<section>`, `<main>`) used throughout.

## Usage Example

```jsx
<button className="btn-primary">
  Get Started
</button>

<div className="glass-panel p-6">
  <h2 className="text-gradient-gold font-serif">Premium Service</h2>
</div>
```

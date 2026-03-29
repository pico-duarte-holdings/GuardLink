# Design System Strategy: Tactical & Clinical Vanguard

## 1. Overview & Creative North Star: "Precision Brutalism"
The Creative North Star for this design system is **Precision Brutalism**. We are moving away from the "generic SaaS" look of rounded bubbles and soft shadows. Instead, we are leaning into the high-performance world of elite esports and tactical interfaces. 

This system rejects the "template" aesthetic by utilizing intentional asymmetry, mono-spaced technical data, and high-contrast editorial typography. We break the grid with overlapping elements and "data-dense" modules that feel like a high-end command center. It is a balance between the **Tactical Vanguard** (aggressive, high-contrast, performance-driven) and the **Clinical Vanguard** (sterile, organized, hyper-legible).

---

## 2. Colors & Surface Architecture
The palette is rooted in deep obsidian tones and high-visibility "Hazard Yellow" (`#FFD530`). 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Boundaries must be established through background shifts or tonal transitions.
- Use `surface-container-low` for secondary sections sitting on a `background`.
- Use `surface-container-high` for interactive modules.
- Separation is achieved through the **Spacing Scale** (e.g., `spacing-8` or `spacing-12`) rather than a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical, machined layers. 
- **Base Layer:** `surface` (#121319).
- **Secondary Layer:** `surface-container-low` (#1b1b21).
- **Interactive Component Layer:** `surface-container-highest` (#34343b).
By nesting a `surface-container-highest` card within a `surface-container-low` section, you create a perceived lift that feels integrated, not "pasted on."

### The "Glass & Gradient" Rule
To elevate the "Tactical" feel, use Glassmorphism for floating HUD elements. 
- Use semi-transparent `surface-variant` with a `backdrop-blur` of 12px.
- **Signature Texture:** Primary CTAs should utilize a subtle linear gradient from `primary` (#fff4dc) to `primary-container` (#ffd530) at a 135-degree angle. This prevents the yellow from feeling "flat" and adds a metallic, high-performance sheen.

---

## 3. Typography: The Editorial Edge
We pair the geometric aggression of **Space Grotesk** with the technical precision of **JetBrains Mono**.

*   **Display & Headlines (Space Grotesk):** These are your "Editorial" anchors. Use `display-lg` for hero sections with tight letter-spacing (-2%). It should feel heavy, authoritative, and cinematic.
*   **Technical Data (JetBrains Mono):** Use for all numerical data, status codes, and "Label" tiers. This reinforces the "Tactical" aspect, suggesting the UI is a live stream of high-performance data.
*   **Body (Space Grotesk):** Standardized at `body-md` for readability. Ensure a generous line height (1.5x) to contrast against the dense, tight headlines.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "soft" for a Vanguard aesthetic. We use **Tonal Layering** to define space.

*   **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. A `surface-container-lowest` card on a `surface-container-low` background creates a "sunken" or "etched" look, perfect for data input fields.
*   **Ambient Shadows:** If an element must float (e.g., a dropdown), use a shadow color tinted with `surface-tint` (#ebc318) at 5% opacity, with a 32px blur. It should look like a soft glow rather than a shadow.
*   **The "Ghost Border" Fallback:** If a container needs an edge for accessibility, use the `outline-variant` (#4d4633) at **15% opacity**. It should be barely perceptible—a hint of a machined edge.

---

## 5. Components

### Buttons
*   **Primary:** Gradient of `primary` to `primary-container`. Hard corners (`rounded-sm`). Text in `on-primary-fixed`.
*   **Secondary:** Ghost style. No background, `outline` border at 20% opacity. On hover, background shifts to `surface-container-high`.
*   **Tactical Variant:** Square corners, `JetBrains Mono` label, with a small 2px accent square in the top-right corner using `primary-container`.

### Input Fields
*   **Style:** `surface-container-lowest` background. No border. A 2px bottom-bar that illuminates to `primary` (#fff4dc) when focused.
*   **Labels:** Always `label-sm` in `JetBrains Mono`, all-caps.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Execution:** Use `spacing-4` gaps between list items. Use a subtle `surface-bright` hover state to highlight rows.
*   **Clinical Detail:** In the "Clinical Vanguard" theme, cards use `surface-container-low` with a `primary` color accent strip (4px) on the left edge to denote "Active" status.

### Tactical HUD (New Component)
*   A floating, glassmorphic container for real-time stats. Use `backdrop-blur`, `surface-variant` at 40% opacity, and `JetBrains Mono` for all internal text.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts (e.g., a wide left column and a very narrow, data-heavy right column).
*   **Do** use `primary-container` (#FFD530) sparingly as a "Warning" or "Action" highlight.
*   **Do** lean into "Micro-Interactions." A button shouldn't just change color; it should have a 100ms slide or a subtle scale-up (1.02x).

### Don't
*   **Don't** use `rounded-lg` or `rounded-xl` for primary containers. It breaks the "Tactical" silhouette. Stick to `none`, `sm`, or `md`.
*   **Don't** use pure white for body text. Use `on-surface-variant` (#d0c6ac) to reduce eye strain and maintain the "Clinical" mood.
*   **Don't** use standard icons. Use "Thin" weight stroke icons that match the technical aesthetic of JetBrains Mono.
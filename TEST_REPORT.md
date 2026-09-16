# Rebuild validation

## Automated checks

- JavaScript syntax checked with Node for every source file.
- All local HTML/CSS/JS/image references checked to exist in the final folder.
- Customer viewport contains no `user-scalable=no` restriction.
- No global `touchmove`, wheel, `overscroll-behavior`, body fixed-scroll lock or visualViewport resize listener exists.
- The only `touch-action` rules are scoped to direct manipulation targets (custom design layer / product image), not the page.
- Local data/store functions validated for product loading, cart mutation and order creation.

## Interaction design intentionally changed

- The prior oversized catalogue heading/subcategory controls and the customizer's huge blank stage were discarded rather than patched.
- Categories are full-bleed image cards.
- Ready-made product cards use Add to cart, not a global/floating contact action.
- The custom uniform CTA is the only prominent WhatsApp customization enquiry on the homepage.

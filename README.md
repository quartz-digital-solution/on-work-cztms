# One-Line Custom Apparel Store

Complete static HTML/CSS/JavaScript website. No npm, React, build command or server is required for the demo.

## Included

- `index.html` — customer home, ready-made catalogue, filters, fixed-garment customizer, B2B login, cart, checkout and orders.
- `admin.html` — categories with images, retail products, B2B-only products, Simple / One Option / Colour + Option structures, print methods, delivery and store settings.
- `receiver.html` — order receiving with customer and customization details.

## Customizer behaviour

- The garment stays fixed while editing. Only text/artwork layers move or resize.
- Double-tap/double-click a text design to edit it.
- Text, font and print controls remain available below the editor without re-selecting the layer.
- Sublimation is automatically disabled for dark garment colours with an explanation in the print selector.
- The current design is cached in browser storage, so opening the cart and returning restores it. The draft is cleared only after a successful order.

## Ready-made and B2B

Ready-made products are not directly customizable by customers; the enquiry buttons open WhatsApp. The floating WhatsApp button can be dragged to another position and remembers its position.

B2B products are maintained separately and are hidden from the normal customer catalogue. The B2B catalogue hides prices and uses **Ask for price** via WhatsApp. Default demo B2B login is `B2B` / `1234`; change it in **Admin → Settings** before use.

## Product structures

- **Simple** — one item/image/stock.
- **One Option** — options such as size or pack, with stock and optional image per option.
- **Colour + Option** — one image per colour, reused across all sizes/options of that colour, with separate stock per size/option.

These structure names are admin-only and are not shown on customer product cards.

## Deployment

Upload the contents to the root of a static host such as GitHub Pages, Cloudflare Pages or Netlify. The included `.nojekyll`, manifest and service worker support direct static hosting/PWA installation over HTTPS.

## Important production note

This edition uses browser `localStorage` for demo data and a browser-stored B2B credential. That is appropriate for a local/static prototype, not secure production authentication or multi-device commerce. Before a public launch, connect the same UI to your database/backend, server-side authentication, real inventory/order APIs and verified payment processing.

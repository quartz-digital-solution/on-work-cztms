# One-Line — rebuilt static website

This folder is a clean rebuild. It does not load the old `styles.css`, `upgrade.css`, `app.js`, `designer.js`, `catalog.js`, or other patch-layer files from the earlier version.

## Pages

- `index.html` — customer home, ready-made catalogue, product detail, cart, checkout, orders and customizer.
- `b2b.html` — separate B2B login/catalogue with prices hidden and WhatsApp price enquiry.
- `admin.html` — products, categories, customization, orders, accounts and store settings.
- `management.html` — overview, products, categories and orders.
- `staff.html` — stock desk and product management.
- `receiver.html` — order receiving/status updates.

## Demo portal credentials

- Admin: `admin` / `admin123`
- Management: `management` / `manage123`
- Staff: `staff` / `staff123`
- Receiver: `receiver` / `receiver123`
- B2B: `B2B` / `1234`

Change the B2B login and WhatsApp number from Admin → Settings. Portal accounts are local demo credentials and are not secure production authentication.

## Customizer behavior

- Garment type is above the front/back/sleeve tabs.
- Only actual text/image layers can be selected. The object-control panel is hidden when nothing is selected.
- Single-finger/mouse drag moves a selected layer.
- Two-finger pinch on a layer resizes and rotates it.
- Text edits update the existing layer directly, so typing does not re-render the whole customizer or close the mobile keyboard.
- The page itself uses normal browser scrolling. No global `touchmove`, wheel, overscroll, body-lock or visual-viewport resize restrictions are used.
- Sublimation is disabled automatically on dark garments.

## Product images

Product detail images support tap-to-zoom / tap-again-to-reset. Two-finger pinch adjusts the product-image zoom while a normal one-finger vertical swipe remains page scrolling.

## WhatsApp mark

The enquiry buttons use the original Wikimedia file URL for `WhatsApp Logo green.svg`, with `assets/whatsapp-logo-green.svg` as an offline fallback.

## Data

This is a static prototype and stores products, categories, cart, orders, accounts and settings in browser `localStorage`. A production deployment should replace that storage/auth boundary with the real backend/database and verified server-side authentication.

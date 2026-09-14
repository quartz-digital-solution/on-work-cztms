# One-Line Custom Apparel Commerce

A mobile-first custom apparel storefront with separate customer, staff, admin and protected B2B experiences. The project uses plain HTML, CSS and JavaScript, so it can be previewed or deployed without npm or a build command.

## Pages

- `index.html` — customer storefront, B2B login, customizer, cart, checkout, callbacks and order history
- `staff.html` — authenticated order board, exact production files, variant stock, product editing and direct orders
- `admin.html` — authenticated full control for products, variants, categories, fabric, printing, bulk offers, access accounts, callbacks, orders and WhatsApp settings
- `receiver.html` — compatibility redirect to the protected staff console

## First preview logins

- Admin: `admin` / `admin123`
- Staff: `staff` / `staff123`
- B2B: `bluepeak` / `b2b123`

Change or block accounts in **Admin → Access accounts** before handing the preview to a client.

## Implemented commerce rules

- Ready-made and admin-toggleable customizable products
- Front, back, right sleeve and left sleeve design areas
- Multiple text and image elements on the same side
- Independent move, resize, rotate, edit, delete and print method per element
- Separate admin-controlled image and text print prices
- Budget, Standard and Premium cloth qualities with editable descriptions and rates
- Sublimation automatically disabled for dark colours
- Colour-specific product images
- Variant-level colour, size, price, stock and optional barcode
- School belts and identification tag products
- Editable quantity offers and protected B2B account discounts
- Configurable WhatsApp support and cart enquiry
- Customer callback requests shown in admin
- Direct staff orders reduce the selected variant stock
- PWA manifest and offline shell

## Preview locally

Run any static server in this folder. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Static deployment

Upload the folder contents to the root of Netlify, Cloudflare Pages or GitHub Pages.

- Build command: leave empty
- Publish/output directory: `/`
- HTTPS: required for PWA installation

## Important production requirement

This package is a complete functional front-end/client preview. Its records and role accounts use browser storage so every workflow can be tested immediately without a server.

Before accepting live public orders, connect the storage functions in `js/data.js` to a secure backend such as Supabase:

1. Store products, variants, categories, fabric, printing, offers, accounts, callbacks and orders in database tables.
2. Use server-side authentication and role policies for admin, staff and B2B accounts.
3. Store uploaded artwork in private object storage and expose signed production URLs.
4. Make order creation and stock reduction one database transaction.
5. Add a verified payment gateway and webhook before enabling online payment.
6. Remove the first-preview passwords from the seeded data.

Do not use the browser-storage account system as production security across different devices.

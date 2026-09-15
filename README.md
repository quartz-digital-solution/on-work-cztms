# One-Line Custom Apparel Commerce

A mobile-first custom apparel storefront with separate customer, staff, admin and protected B2B experiences. The project uses plain HTML, CSS and JavaScript, so it can be previewed or deployed without npm or a build command.

## Pages

- `index.html` — customer storefront, B2B login, customizer, cart, checkout, callbacks and order history
- `staff.html` — authenticated order board, exact production files, colour/variant stock, image upload, product editing and direct orders
- `admin.html` — authenticated full control for product galleries, colour images/rates/quantity/barcodes, categories, fabric, printing, bulk offers, B2B access, callbacks, orders and WhatsApp settings
- `receiver.html` — compatibility redirect to the protected staff console

## First preview logins

- Admin: `admin` / `admin123`
- Staff: `staff` / `staff123`
- B2B: `bluepeak` / `b2b123`

Change or block accounts in **Admin → Access accounts** before handing the preview to a client.

## Implemented commerce rules

- Ready-made catalogue products are never opened in the editor; they can be bought normally or sent as a customization enquiry
- Front, back, right sleeve and left sleeve design areas
- Practical side-profile sleeve editing for the colour-changeable garments, with independent right- and left-sleeve design data
- Multiple text and image elements on the same side
- Unrestricted drag positioning plus independent resize, rotate, edit and delete controls
- Animated visual garment picker and direct WhatsApp support for advanced customization
- One clearly styled print-method selector appears whenever a design element exists; it does not depend on selecting a text or image
- Every text and image remains separately charged using the chosen method's admin-controlled text/image rates
- Budget, Standard and Premium cloth qualities with editable descriptions and rates
- Sublimation automatically disabled for dark colours
- Colour-specific front, back and sleeve uploads, price, quantity and optional barcode
- A separate Admin → Customizable area manages the dedicated editor products, colours, mockups, sizes and print methods
- Ready-made shop images and fixed-colour customizer images are never automatically recoloured
- The customer editor is intentionally limited to garment colour + text + image customization, with a clear print-method selector
- A colour image is reused consistently for every size belonging to that colour
- Existing size-variant inventory remains supported by the staff stock desk
- School belts and identification tags are enquiry/callback items and are not sent into the apparel customizer
- Real product cut-outs for garments, school belts and identification tags; no placeholder catalogue photos
- Editable quantity offers, protected B2B account discounts and B2B-only catalogue items
- Premium category photography with admin uploads
- Configurable WhatsApp support, a movable customer contact control and cart enquiry
- Customer callback requests shown in admin
- Direct staff orders reduce the selected colour or variant stock
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

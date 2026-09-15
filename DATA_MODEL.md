# Data boundary and future Supabase connection

The frontend is plain HTML/CSS/JavaScript. `js/data.js` retains the original seed data, image utilities and compatibility functions. `js/catalog.js` owns product normalization, migration, catalogue matching, role-aware mutations, account validation and order/stock commits. `OneLineStore.repository` identifies the current local provider boundary. Admin and Management both use `js/product-editor.js`; all stock desks use `js/stock-desk.js`.

The current repository is synchronous and local. A remote adapter will require asynchronous loading/saving and UI loading/error states around the same domain operations; this release does not pretend that swapping credentials alone connects Supabase.

| Future entity | Current fields / relationship |
| --- | --- |
| products | id, sku, name, categoryId, subcategoryId, productType, optionName, description, keywords, price, mrp, active, available, customerVisible, b2bEnabled, askForPrice, barcode |
| product_variants | product_id + variant id, colour, size/option, stock, price, barcode, available, image |
| product_images | product_id, optional variant_id, source URL, gallery order |
| categories | id, name, image, active, order |
| subcategories | id, categoryId, name, image, active, order |
| customization_models | currently products with customSection=true; neutral front/back/sleeve sources, customizerColours, customColorValues, sizes, allowedFabricIds, allowedPrintIds |
| cloth_types | id, name, description, price addition, active |
| print_types | id, name, note, image price, text price, lightOnly, active |
| accounts / profiles | id, role (admin/management/staff/b2b), name, business, active; replace demo credentials with Supabase Auth |
| orders / order_items | customer and contact details, delivery, payment status, selected variant, quantity, price snapshot and saved custom design |
| stock_movements | product/variant, quantity delta, actor, timestamp, reason; current demo records these in its activity log |

Saved custom designs contain a selected cloth ID/name, print ID/name, exact garment hex, source mockups and independent layers for front, back, right sleeve and left sleeve. Each layer retains its text/font/colour or uploaded artwork plus x/y, size and rotation. Print-zone width is saved so preview sizes can scale.

Before connecting live Supabase:

1. Import catalogue records and upload product/category images to object storage. Store file URLs instead of large data URLs. Put private customer artwork behind signed access.
2. Replace browser passwords and session checks with Auth and server-side roles. Enforce policies for every mutation: Admin system controls; Management product edits; Staff exact stock adjustments; B2B read-only catalogue and enquiries.
3. Serve B2B catalogue data from a price-free view or endpoint. Hiding price markup is only the current demo behavior, not a confidentiality boundary.
4. Put order creation, stock validation and stock decrements in one database transaction/RPC. Use atomic stock updates, non-negative checks, unique barcode constraints and idempotency keys. Local demo write rollback is not multi-user inventory coordination.
5. Add async request states and cross-device realtime refresh. Restrict customer order history to the authenticated customer; current browser-local order history is a shared demo list.
6. Connect and verify payments only when requested; no live gateway is present in this release. Keep custom production approval and real colour sampling separate from a screen preview.
7. Remove demo credentials/seeds from the live authentication path and run the device/browser acceptance checks in TEST_REPORT.md.

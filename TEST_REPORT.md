# Test report — One-Line 20260915-r7

## Result and environment

**58 automated checks passed**, plus syntax checks on all 12 JavaScript files and local-asset existence checks. Tests ran against the final project source in Node.js with jsdom. Image upload/conversion checks used real PNG decoding and WebP encoding through @napi-rs/canvas.

These are DOM/component and domain tests, not a browser rendering run. Gesture tests dispatch synthetic pointer events with a controlled print-zone rectangle. Service-worker tests simulate the worker lifecycle and cache API. CSS checks validate parsing, declared ratios and references, not rendered pixels.

The available browser rejected both the localhost preview and shared local-file URL under its security policy. No alternate browser route was used to bypass that restriction. Consequently no claim is made that real browser layout or phone gestures were verified.

## Passed automated checks

1. Admin login rejects wrong password.
2. Admin login and dashboard.
3. All admin sections render.
4. Simple product fields and dependent category.
5. Simple product requires image.
6. Save and edit simple product through shared data layer.
7. One Option form preserves independent images, barcodes and stock.
8. Colour + Option creates exact combinations and editing keeps stock.
9. Reject duplicate product and variant barcodes.
10. Create category, image reference and subcategory through forms.
11. Rename linked category without orphaning products.
12. Create each role through Admin account form.
13. Suspension and password reset revoke sessions.
14. Create/edit/disable cloth and print methods.
15. Customization config saves exact hex, cloth and print choices.
16. Combined size and colour filters never mix different variants.
17. Keywords are searchable; variant barcode search is exact and internal.
18. One Option variant image resolution.
19. Staff permissions, exact stock changes and oversell rejection.
20. Management can edit products but not accounts or categories.
21. Customer catalogue, category and search render.
22. Product options, gallery and enquiry message.
23. Customer checkout reduces exact variant stock.
24. B2B listing, detail and route guards have no prices or checkout.
25. Staff portal only has stock operations and barcode search.
26. Management uses shared editor without system tabs.
27. Customizer opens separately with four base models, cloth and print methods.
28. Cloth type and colour update and remain selected across surfaces.
29. Add and edit multiple independent text objects.
30. Double tap targets the exact text after deselection.
31. Drag preserves grab offset and moves selected item.
32. Two-pointer pinch resizes and rotates the object.
33. Text font, colour, size and rotation controls update selected object.
34. Each view keeps its independent text design.
35. Saved cart design retains exact hex, cloth, print and all four sides.
36. Removal only deletes selected object.
37. Light-only print is disabled for dark hex colours.
38. Filter dialog renders all groups, resets and applies with loading state.
39. Filter apply callback receives selected sizes and loader closes.
40. Real image decoding, resizing and WebP compression using native canvas.
41. Main and variant file uploads, option image inheritance, form save and persistence.
42. Category image upload and saved preview source.
43. Customizer artwork file upload, canvas conversion and saved artwork data.
44. Every HTML entry has valid local scripts, styles, manifest and icons.
45. CSS stylesheets parse including responsive overrides.
46. Fresh service worker core resolves every local file.
47. Cache activation deletes older app caches and preserves unrelated caches.
48. Product ratios are 3:4 and category images stay square in release CSS.
49. No stale CSS or JS version in entry pages.
50. Missing variants cannot fall back to aggregate stock.
51. An order with multiple lines cannot oversell a single variant.
52. Suspended active staff session is rejected immediately.
53. Legacy aggregate inventory migration preserves totals and custom-model removal.
54. Order receiving compatibility route: order board and detailed order drawer.
55. Order receiving still supports direct orders.
56. Service worker install precaches all portal assets (simulated lifecycle).
57. Service worker activation removes old app caches while preserving unrelated caches (simulated lifecycle).
58. Offline admin navigation returns admin shell rather than customer shell (simulated fetch).

## Still to verify before publishing

- Open the hosted preview on Android Chrome, iPhone Safari, tablet and desktop. Inspect 320–430 px widths, keyboard-open forms, long names, modals, navigation and horizontal overflow.
- Visually compare the customer design to the supplied r4. Confirm 3:4 product frames and 1:1 category images without inappropriate cropping.
- Inspect the neutral sleeve model on each garment and both mirrored sides. Confirm the print box lies on the physical sleeve. Try real one-finger dragging, two-finger pinch/rotation and double-tap editing with multiple objects.
- Confirm the chosen hex colour visually across all four views. The configured base colour is used at full opacity with neutral photographic shading; folds and shadows vary in brightness, and screen previews cannot guarantee physical fabric/print colour.
- Inspect saved custom artwork at different device sizes. Verify long text, transparent logos and heavily rotated artwork fit the intended print area.
- Test actual service-worker installation, an upgrade from r4, offline startup, reconnection and PWA reopening over HTTPS. The worker code was tested with a simulated lifecycle only.
- Verify WhatsApp opens the intended business number with the selected product/ID/colour/option/quantity. Message URLs were checked; no messages were sent.
- Test the future Supabase/Auth/Storage transaction and RLS implementation before multi-user use. None is connected in this ZIP.

## Data limits

This is the requested local/demo stage. Demo credentials, prices, uploaded artwork and orders live in browser storage. Role enforcement and B2B price hiding operate in the application UI/domain layer and are not server security. Browser storage quota and isolated devices remain practical limits. Customer order history is browser-local. Payments, shared cloud data and real-time cross-device stock are not implemented.

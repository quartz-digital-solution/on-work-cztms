# One-Line — Complete r7

This release upgrades the supplied r4 project. It keeps the existing customer branding and page structure, adds the requested catalogue and portal workflows, and uses WellOne v107.1 as the product-management reference.

**Current mode: local browser demo. Supabase is not required.** This ZIP is ready to upload for a hosted preview; live backend authentication, shared inventory and payments are not connected.

## Open the pages

| Page | URL | Demo username | Demo password |
| --- | --- | --- | --- |
| Customer | `/index.html` | No login required | — |
| Customize | `/index.html#customize` | No login required | — |
| Admin | `/admin.html` | `admin` | `admin123` |
| Staff stock desk | `/staff.html` | `staff` | `staff123` |
| Management | `/management.html` | `manager` | `manager123` |
| B2B catalogue | `/b2b.html` | `bluepeak` | `b2b123` |
| Order receiving | `/receiver.html` | `admin` | `admin123` |

Accounts created in Admin work in the corresponding portal on the same browser and origin. Staff only handles Sold/Add Stock. Management uses the same product editor as Admin. Admin alone manages categories, customization, accounts and settings. B2B only browses, selects options and enquires on WhatsApp; its screens contain no prices or checkout.

## Upload or preview

Extract the ZIP and upload **all its contents together**. `index.html` is directly at the project root. No build command, npm installation or manual merging is needed. Use a static host such as Cloudflare Pages, Netlify or GitHub Pages. For local preview, run `python3 -m http.server 8080` from the extracted folder, then open `http://localhost:8080`.

The release version is **20260915-r7**. All script and stylesheet references, the manifest and service worker use the new version. The worker removes old One-Line app caches, while retaining browser data and unrelated app caches. Existing open pages reload once when the new worker takes control. Service workers need HTTPS or localhost.

## Using Admin

- Products → Add product: select Category, then Subcategory. Choose Simple Item, One Option, or Colour + Option. Add images, price and stock. Each option can have its own barcode, image, availability and rate. A colour image can be copied to every size of that colour.
- Category and subcategory pages: add images, rename, set order, activate/deactivate, and delete unused entries. Reassign linked products before deletion.
- Customization: manage the separate T-shirt, polo, shirt and jersey bases. Select their cloth and print methods, and supply neutral front/back/side-profile mockups. Colour entries use `Name=#RRGGBB`, one per line. The bundled side-profile assets are reused and mirrored for the opposite sleeve.
- Cloth types and Print types: create, edit, enable/disable or remove choices. After adding one, enable it for the relevant model in Customization.
- Staff / Management / B2B accounts: create, edit, suspend, reactivate or delete accounts. A blank password when editing keeps the existing one; a new password revokes the old session.
- Settings: check the WhatsApp number before client use. Existing contact settings have been retained.

Ready-made products remain outside the editor. Enabling **Ask For Price** switches a retail item to WhatsApp enquiries and hides its fixed price. Products use 3:4 image frames; categories stay square. Search keywords are hidden from customers. Size and colour filters must match the same available variant.

## Data and migration

The app keeps products, accounts, categories and orders in `localStorage`; login state uses `sessionStorage`. Uploaded images are compressed into browser data. Data is shared between tabs on the same origin, but **does not sync across devices or separate browsers**. Replacing static caches does not clear records. Changing domains or clearing browser site data creates a separate demo dataset.

Existing v3 records are migrated once. Existing variant stock is retained. Older records that only had an aggregate colour/product stock are distributed across their options without changing the total; review that size allocation if you had live demo stock. Deleting a customization model no longer recreates it automatically.

For the future Supabase connection, see `DATA_MODEL.md`. Demo accounts and UI role checks are not production security; prices are hidden in B2B screens but remain in the local demo dataset. Replace this with server-enforced access and price-free B2B responses before a public business launch.

## Verification

`TEST_REPORT.md` records the checks actually performed. Automated DOM, logic, image-conversion, syntax and file-path tests passed. Rendered browser layouts, physical Android/iPhone gestures, actual service-worker installation and WhatsApp sending remain unverified because local files were blocked by the available browser's security policy.

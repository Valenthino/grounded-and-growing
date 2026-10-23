# groundedlife.co — WordPress store customizations

This folder mirrors the custom code deployed on the live WooCommerce store at
**groundedlife.co** (WordPress + Divi + WooCommerce, hosted on Hostinger).
The Next.js app in the rest of this repo is the marketing site; the files here
are the store's buy-flow customizations, kept in git so they are reviewable
and recoverable.

Every file here is byte-identical to production (verified by md5 at deploy).

## The buy flow: two clicks

1. **Shop → "Choose Spiral / Classic Linen"** lands directly on `/checkout/`
   with the planner in the order.
2. The checkout is WooCommerce's **block checkout** with the site's own design
   (cream cards, olive buttons, Cormorant/PT Sans). Its order summary has a
   quantity stepper (− / + / type a number) and a Remove link under each line;
   totals update in place.

| Piece | Behavior |
| --- | --- |
| `plugins/groundedlife-express-checkout/` (v1.2.0) | Redirects every successful add-to-cart to `/checkout/`; 302s `/cart/` → `/checkout/` (cart merged away); 302s an empty `/checkout/` → `/shop/` (and disables core's empty-checkout → cart redirect, which would loop); enqueues `assets/checkout-qty.js` + `.css` on the block checkout only; one-shot LiteSpeed purge after deploy. |
| `plugins/groundedlife-express-checkout/assets/checkout-qty.js` | Adds WooCommerce's own quantity-selector markup to each order-summary line. Changes go to the Store API's `cart/update-item` / `cart/remove-item` **unbatched**, and the response is passed to the `wc/store/cart` store's `receiveCart`, so every native price, badge and total re-renders. Lines are not flagged pending (that would swap the summary to a 2-second loading skeleton); instead the `woocommerce_show_cart_item_quantity_changed_notice` / `..._removed_notice` JS filters suppress the "quantity was changed" pop-ups for the shopper's own edits. Removing the last item returns to the shop. |
| `plugins/groundedlife-express-checkout/assets/checkout-qty.css` | Styles the stepper to match the checkout's fields (#D3CCB4 border, 6px radius, #FCFAF7 fill, olive #5B5734), with 42px touch targets on phones. Also scales the order-summary product name to 21px: the theme's custom CSS sets `.woocommerce-checkout h3` to 34px `!important`, which made one product name fill the summary. |
| `plugins/groundedlife-chooser/groundedlife-chooser.php` (v0.3.0) | Re-choosing a binding already in the cart skips the duplicate add and continues to checkout (previously an error pointing at the cart). Both bindings may share one order. All nonce/authenticity checks kept. |
| `pages/checkout-page-14.html` | Content of the Checkout page (ID 14): the original block checkout, unchanged. |

The shop page (`/shop/`, chooser cards), ad landings (pages 85/91/95) and the
cart page content (ID 13) are not modified; `/cart/` never renders because of
the redirect.

## Still gated: the release gate blocks real orders

The **`groundedlife-release-gate`** plugin is still active. It rejects every
order submission (`/wc/store/v1/checkout`, classic checkout, order-pay) with
"Checkout is temporarily unavailable." It also rejects **every**
`/wc/store/v1/batch` request, and WooCommerce batches its own address and
shipping updates. So while the gate is on, typing an address shows that
message and the totals stay on their loading placeholders. This is the gate,
not the express checkout; the quantity controls keep working because
`cart/update-item` and `cart/remove-item` are sent unbatched.

WooPayments is enabled in **live** mode: deactivate the gate (wp-admin →
Plugins → "Grounded Life temporary checkout gate") only when ready to take
real payments, then place one real test order end to end.

## Rollback

Pre-deploy originals live on the server in
`wp-content/novamira-sandbox/backups-gge-20261023/` (not web-servable).

1. Deactivate **Grounded & Growing Express Checkout** in wp-admin → Plugins.
2. Restore the chooser: copy `groundedlife-chooser.php.orig` over
   `wp-content/plugins/groundedlife-chooser/groundedlife-chooser.php`.
3. LiteSpeed Cache → Purge All.

The checkout page content is already the original, so it needs no restore.

## Notes for future work

- Product IDs are pinned in the chooser: Spiral = 42, Linen = 77
  (`GG_CHOOSER_SPIRAL_ID` / `GG_CHOOSER_LINEN_ID`).
- Quantity ceiling at checkout is `GGE_QTY_MAX` (99); stock is unmanaged on
  both products.
- The quantity-control strings are translatable under the
  `gg-express-checkout` text domain (passed to the script as
  `window.ggeCheckoutQty`).
- The stepper relies on WooCommerce block markup (`.wc-block-components-order-summary-item`,
  `__description`, `.wc-block-components-product-name`) and on the
  `wc/store/cart` store's `receiveCart` action. If a WooCommerce update
  changes those, the controls simply don't appear (the script exits when
  `receiveCart` is missing, and each line is matched to its cart item by name
  before anything is added); the checkout itself is unaffected.

# groundedlife.co — WordPress store customizations

This folder mirrors the custom code deployed on the live WooCommerce store at
**groundedlife.co** (WordPress + Divi + WooCommerce, hosted on Hostinger).
The Next.js app in the rest of this repo is the marketing site; the files here
are the store's buy-flow customizations, kept in git so they are reviewable
and recoverable.

Deployed 2026-10-23. Every file here is byte-identical to production at
deploy time (verified by md5).

## What the express checkout does

Goal: **two clicks** — pick a binding in the shop, land on checkout, fill in
your info. No cart detour.

| Piece | Behavior |
| --- | --- |
| `plugins/groundedlife-express-checkout/` | New plugin. Redirects every successful add-to-cart to `/checkout/`; 302s `/cart/` → `/checkout/` (cart and checkout are merged); 302s an empty `/checkout/` → `/shop/` (and disables core's empty-checkout→cart redirect, which would loop); renders an editable **"Your order" card** on the checkout (quantity steppers, remove, one-tap "add the other binding") backed by a `wc-ajax=gge_cart` endpoint and refreshed through WooCommerce's checkout fragments; hides the duplicate item rows in the default review table and relabels that section "Payment"; removes the Company and Order-notes fields; one-shot LiteSpeed purge after deploy. |
| `plugins/groundedlife-chooser/groundedlife-chooser.php` | Edited to v0.3.0. Re-choosing a binding already in the cart now skips the duplicate add and continues to checkout (previously an error pointing at the cart). The "you already have the other binding" rejection is gone — both bindings may share one order. All nonce/authenticity checks kept. |
| `pages/checkout-page-14.html` | New content of the Checkout page (ID 14): the classic `[woocommerce_checkout]` shortcode. Replaced the block checkout (original preserved in `checkout-page-14.block-backup.html`), because the block checkout's order summary cannot edit quantities. |

The shop page (`/shop/`, chooser cards), ad landings (pages 85/91/95) and the
block cart page content (ID 13) were not modified; `/cart/` simply never
renders anymore because of the redirect.

## Still gated: the release gate blocks real orders

The **`groundedlife-release-gate`** plugin is still active on the site. It
rejects every checkout *submission* (block, classic and order-pay) with
"Checkout is temporarily unavailable." — shoppers can reach the checkout and
fill the form, but cannot place an order until that plugin is deactivated
(wp-admin → Plugins → "Grounded Life temporary checkout gate"). WooPayments is
enabled in **live** mode, so deactivate the gate only when ready to take real
payments, and run one real test order end to end at that point.

## Server-side backups / rollback

On the server, pre-deploy originals live in
`wp-content/novamira-sandbox/backups-gge-20261023/` (not web-servable):
`groundedlife-chooser.php.orig`, `checkout-page-14-content.orig.txt`,
`cart-page-13-content.orig.txt`, `active_plugins.orig.txt`, `RESTORE-NOTES.txt`.

To roll everything back:

1. Deactivate **Grounded & Growing Express Checkout** in wp-admin → Plugins
   (or remove its entry from the `active_plugins` option).
2. Restore the chooser: copy `groundedlife-chooser.php.orig` over
   `wp-content/plugins/groundedlife-chooser/groundedlife-chooser.php`.
3. Edit the Checkout page (ID 14) and paste back the contents of
   `checkout-page-14-content.orig.txt` (the block checkout), or use
   `pages/checkout-page-14.block-backup.html` from this folder.
4. LiteSpeed Cache → Purge All.

## Notes for future work

- Product IDs are pinned in both plugins: Spiral = 42, Linen = 77
  (`GGE_SPIRAL_ID`/`GGE_LINEN_ID`, `GG_CHOOSER_SPIRAL_ID`/`GG_CHOOSER_LINEN_ID`).
- Quantity ceiling at checkout is `GGE_QTY_MAX` (99); stock is unmanaged on
  both products.
- The checkout card's strings are translatable under the
  `gg-express-checkout` text domain; the site runs en-US (the French ad
  landing shares the same English checkout).
- Free shipping is zone 1 (US & Canada); the card's "Free shipping within the
  US & Canada." line is hardcoded copy — update it if zones change.

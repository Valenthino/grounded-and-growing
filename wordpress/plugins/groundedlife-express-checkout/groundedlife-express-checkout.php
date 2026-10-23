<?php
/**
 * Plugin Name: Grounded & Growing Express Checkout
 * Description: Merges the cart into the checkout. Every add-to-cart continues straight to checkout, /cart/ redirects to /checkout/, and the checkout page opens with an editable "Your order" card: quantity steppers, remove, and a one-tap "add the other binding" row. Requires the checkout page to contain the classic [woocommerce_checkout] shortcode.
 * Version: 1.0.0
 * Author: Grounded & Growing
 * Text Domain: gg-express-checkout
 * Requires Plugins: woocommerce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// The two bindings of the one planner (same IDs the chooser plugin pins).
define( 'GGE_SPIRAL_ID', 42 );
define( 'GGE_LINEN_ID', 77 );
// Stock is unmanaged on both products, so the stepper needs its own sane ceiling.
define( 'GGE_QTY_MAX', 99 );

add_action( 'plugins_loaded', 'gge_init' );

function gge_init() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return;
	}

	// Every successful non-AJAX add-to-cart (chooser cards, single product
	// pages, ?add-to-cart= links) continues straight to the checkout. Woo only
	// consults this filter after the add succeeded; a failed add never redirects.
	add_filter( 'woocommerce_add_to_cart_redirect', 'gge_redirect_to_checkout', 20 );

	// The cart page is merged into the checkout, and an empty checkout goes to
	// the shop. Core's own empty-checkout redirect points at the cart page,
	// which would loop against the redirect above, so it must stay disabled
	// while this plugin is active.
	add_action( 'template_redirect', 'gge_route_cart_and_empty_checkout', 1 );
	add_filter( 'woocommerce_checkout_redirect_empty_cart', '__return_false' );

	// The editable "Your order" card at the top of the checkout. The default
	// review table keeps totals + payment but hides its (now duplicate) item
	// rows, and its hardcoded "Your order" heading is relabeled "Payment".
	add_action( 'woocommerce_before_checkout_form', 'gge_output_order_card', 5 );
	add_filter( 'woocommerce_update_order_review_fragments', 'gge_order_card_fragment' );
	add_filter( 'woocommerce_checkout_cart_item_visible', '__return_false' );
	add_filter( 'gettext_woocommerce', 'gge_relabel_order_review_heading', 10, 3 );
	add_action( 'wc_ajax_gge_cart', 'gge_ajax_cart' );
	add_action( 'wp_enqueue_scripts', 'gge_enqueue_assets' );

	// Leaner form: this store ships a planner to a person, not a company, and
	// order notes only add height between the shopper and the Place order button.
	add_filter( 'woocommerce_checkout_fields', 'gge_trim_checkout_fields', 20 );
	add_filter( 'woocommerce_enable_order_notes_field', '__return_false' );

	// One-shot LiteSpeed purge armed by the deployment (option set directly in
	// the DB); runs on the first uncached request after the plugin goes live.
	add_action( 'init', 'gge_maybe_purge_caches', 99 );
}

function gge_redirect_to_checkout( $url ) {
	return wc_get_checkout_url();
}

function gge_route_cart_and_empty_checkout() {
	if ( is_admin() || wp_doing_ajax() || ! function_exists( 'WC' ) || ! WC()->cart ) {
		return;
	}

	if ( is_cart() ) {
		wp_safe_redirect( wc_get_checkout_url(), 302 );
		exit;
	}

	// Endpoint URLs (order-received, order-pay) share is_checkout() but must
	// never be redirected: the cart is already empty on the thank-you page.
	if ( is_checkout() && ! is_wc_endpoint_url() && WC()->cart->is_empty()
		&& isset( $_SERVER['REQUEST_METHOD'] ) && 'GET' === $_SERVER['REQUEST_METHOD'] ) {
		wp_safe_redirect( wc_get_page_permalink( 'shop' ), 302 );
		exit;
	}
}

/**
 * The binding not yet in the cart, if it is sellable — the card offers it as a
 * one-tap add so nobody has to leave the checkout to change their mind.
 */
function gge_other_binding_offer() {
	if ( ! WC()->cart ) {
		return null;
	}
	$in_cart = array();
	foreach ( WC()->cart->get_cart() as $item ) {
		if ( isset( $item['product_id'] ) ) {
			$in_cart[ (int) $item['product_id'] ] = true;
		}
	}
	foreach ( array( GGE_SPIRAL_ID, GGE_LINEN_ID ) as $product_id ) {
		if ( isset( $in_cart[ $product_id ] ) ) {
			continue;
		}
		$product = wc_get_product( $product_id );
		if ( $product && $product->exists() && 'publish' === $product->get_status()
			&& $product->is_purchasable() && $product->is_in_stock() ) {
			return $product;
		}
	}
	return null;
}

function gge_order_card_html() {
	if ( ! WC()->cart || WC()->cart->is_empty() ) {
		return '';
	}
	$cart = WC()->cart;
	ob_start();
	?>
	<div class="gge-order-card" data-gge-nonce="<?php echo esc_attr( wp_create_nonce( 'gge-cart' ) ); ?>">
		<h3 class="gge-order-card__title"><?php esc_html_e( 'Your order', 'gg-express-checkout' ); ?></h3>
		<ul class="gge-order-card__items">
			<?php
			foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) :
				$product = isset( $cart_item['data'] ) ? $cart_item['data'] : null;
				if ( ! $product || ! $product->exists() || (int) $cart_item['quantity'] < 1 ) {
					continue;
				}
				$quantity = (int) $cart_item['quantity'];
				?>
				<li class="gge-order-card__item">
					<span class="gge-order-card__thumb"><?php echo wp_kses_post( $product->get_image( 'woocommerce_gallery_thumbnail' ) ); ?></span>
					<span class="gge-order-card__info">
						<span class="gge-order-card__name"><?php echo esc_html( $product->get_name() ); ?></span>
						<span class="gge-order-card__unit"><?php echo wp_kses_post( wc_price( wc_get_price_to_display( $product ) ) ); ?> <?php esc_html_e( 'each', 'gg-express-checkout' ); ?></span>
						<span class="gge-order-card__controls">
							<span class="gge-qty" role="group" aria-label="<?php esc_attr_e( 'Quantity', 'gg-express-checkout' ); ?>">
								<button type="button" class="gge-qty__btn gge-qty__minus" data-key="<?php echo esc_attr( $cart_item_key ); ?>" aria-label="<?php esc_attr_e( 'Decrease quantity', 'gg-express-checkout' ); ?>" <?php disabled( $quantity <= 1 ); ?>>&minus;</button>
								<input type="number" class="gge-qty__input" data-key="<?php echo esc_attr( $cart_item_key ); ?>" value="<?php echo esc_attr( $quantity ); ?>" min="1" max="<?php echo esc_attr( GGE_QTY_MAX ); ?>" inputmode="numeric" aria-label="<?php esc_attr_e( 'Quantity', 'gg-express-checkout' ); ?>">
								<button type="button" class="gge-qty__btn gge-qty__plus" data-key="<?php echo esc_attr( $cart_item_key ); ?>" aria-label="<?php esc_attr_e( 'Increase quantity', 'gg-express-checkout' ); ?>" <?php disabled( $quantity >= GGE_QTY_MAX ); ?>>+</button>
							</span>
							<button type="button" class="gge-remove" data-key="<?php echo esc_attr( $cart_item_key ); ?>"><?php esc_html_e( 'Remove', 'gg-express-checkout' ); ?></button>
						</span>
					</span>
					<span class="gge-order-card__line-total"><?php echo wp_kses_post( $cart->get_product_subtotal( $product, $quantity ) ); ?></span>
				</li>
			<?php endforeach; ?>
		</ul>
		<?php $offer = gge_other_binding_offer(); ?>
		<?php if ( $offer ) : ?>
			<div class="gge-add-other">
				<span class="gge-add-other__thumb"><?php echo wp_kses_post( $offer->get_image( 'woocommerce_gallery_thumbnail' ) ); ?></span>
				<span class="gge-add-other__label">
					<b><?php echo esc_html( $offer->get_name() ); ?></b>
					<?php echo wp_kses_post( wc_price( wc_get_price_to_display( $offer ) ) ); ?>
				</span>
				<button type="button" class="gge-add-other__btn" data-product="<?php echo esc_attr( $offer->get_id() ); ?>"><?php esc_html_e( 'Add', 'gg-express-checkout' ); ?></button>
			</div>
		<?php endif; ?>
		<p class="gge-order-card__note"><?php esc_html_e( 'Free shipping within the US & Canada.', 'gg-express-checkout' ); ?></p>
	</div>
	<?php
	return ob_get_clean();
}

function gge_output_order_card() {
	echo gge_order_card_html(); // Escaped at build time in gge_order_card_html().
}

/**
 * Re-render the card whenever the checkout refreshes its fragments, so totals,
 * steppers and the add-the-other-binding row always reflect the live cart.
 */
function gge_order_card_fragment( $fragments ) {
	$html = gge_order_card_html();
	if ( '' !== $html ) {
		$fragments['.gge-order-card'] = $html;
	}
	return $fragments;
}

/**
 * The classic checkout template hardcodes an "Your order" <h3> above the review
 * table; with the item rows moved up into the card, that section is really the
 * totals + payment step.
 */
function gge_relabel_order_review_heading( $translated, $text, $domain ) {
	if ( 'Your order' === $text && ! is_admin() && did_action( 'wp' )
		&& function_exists( 'is_checkout' ) && is_checkout() && ! is_wc_endpoint_url() ) {
		return __( 'Payment', 'gg-express-checkout' );
	}
	return $translated;
}

/**
 * wc-ajax=gge_cart: the card's quantity / remove / add operations. Each
 * response only acknowledges; the client then triggers update_checkout and the
 * fragment refresh above repaints the card and totals from the real cart.
 */
function gge_ajax_cart() {
	check_ajax_referer( 'gge-cart', 'security' );

	if ( ! WC()->cart ) {
		wp_send_json_error( array( 'message' => __( 'Your cart could not be reached. Please reload the page.', 'gg-express-checkout' ) ), 400 );
	}

	$cart  = WC()->cart;
	$items = $cart->get_cart();
	$op    = isset( $_POST['op'] ) && is_scalar( $_POST['op'] ) ? sanitize_key( wp_unslash( $_POST['op'] ) ) : '';

	if ( 'set_qty' === $op || 'remove' === $op ) {
		$key = isset( $_POST['key'] ) && is_scalar( $_POST['key'] ) ? wc_clean( wp_unslash( $_POST['key'] ) ) : '';
		if ( '' === $key || ! isset( $items[ $key ] ) ) {
			wp_send_json_error( array( 'message' => __( 'That item is no longer in your order.', 'gg-express-checkout' ) ), 404 );
		}
		if ( 'remove' === $op ) {
			$cart->remove_cart_item( $key );
		} else {
			$quantity = isset( $_POST['qty'] ) && is_numeric( $_POST['qty'] ) ? (int) $_POST['qty'] : 1;
			$quantity = max( 1, min( GGE_QTY_MAX, $quantity ) );
			$cart->set_quantity( $key, $quantity, true );
		}
	} elseif ( 'add' === $op ) {
		$product_id = isset( $_POST['product_id'] ) && is_scalar( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		if ( ! in_array( $product_id, array( GGE_SPIRAL_ID, GGE_LINEN_ID ), true ) ) {
			wp_send_json_error( array( 'message' => __( 'That product is not available here.', 'gg-express-checkout' ) ), 400 );
		}
		$already = false;
		foreach ( $items as $item ) {
			if ( isset( $item['product_id'] ) && (int) $item['product_id'] === $product_id ) {
				$already = true;
				break;
			}
		}
		// Adding straight through WC_Cart (not the form handler) deliberately
		// bypasses the chooser's form-level validation: this is a signed,
		// checkout-scoped request for an allowlisted product.
		if ( ! $already && ! $cart->add_to_cart( $product_id, 1 ) ) {
			wp_send_json_error( array( 'message' => __( 'That binding could not be added. Please reload the page.', 'gg-express-checkout' ) ), 400 );
		}
	} else {
		wp_send_json_error( array( 'message' => __( 'Unknown operation.', 'gg-express-checkout' ) ), 400 );
	}

	wp_send_json_success(
		array(
			'cart_count' => (int) $cart->get_cart_contents_count(),
			'shop_url'   => esc_url_raw( wc_get_page_permalink( 'shop' ) ),
		)
	);
}

function gge_enqueue_assets() {
	if ( ! function_exists( 'is_checkout' ) || ! is_checkout() || is_wc_endpoint_url() ) {
		return;
	}
	$dir = plugin_dir_path( __FILE__ );
	$url = plugin_dir_url( __FILE__ );
	wp_enqueue_style( 'gge-checkout', $url . 'assets/checkout.css', array(), (string) filemtime( $dir . 'assets/checkout.css' ) );
	wp_enqueue_script( 'gge-checkout', $url . 'assets/checkout.js', array( 'jquery' ), (string) filemtime( $dir . 'assets/checkout.js' ), true );
	wp_localize_script(
		'gge-checkout',
		'ggeCheckout',
		array(
			'endpoint' => WC_AJAX::get_endpoint( 'gge_cart' ),
		)
	);
}

function gge_trim_checkout_fields( $fields ) {
	unset( $fields['billing']['billing_company'], $fields['shipping']['shipping_company'], $fields['order']['order_comments'] );
	return $fields;
}

function gge_maybe_purge_caches() {
	if ( '1' !== get_option( 'gge_purge_pending' ) ) {
		return;
	}
	delete_option( 'gge_purge_pending' );
	do_action( 'litespeed_purge_all' );
	wp_cache_flush();
}

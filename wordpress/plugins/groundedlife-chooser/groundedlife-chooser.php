<?php
/**
 * Plugin Name: Grounded & Growing Planner Chooser
 * Description: [gg_planner_chooser] shortcode: mobile-first binding chooser (spiral vs linen) backed by WooCommerce's own simple-product add-to-cart handling, redirecting to checkout after a successful chooser add.
 * Version: 0.3.0
 * Author: Grounded & Growing
 * Text Domain: gg-planner-chooser
 * Requires Plugins: woocommerce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Fact-sourced product IDs (see README "Site facts"). Not user-editable from the front end.
define( 'GG_CHOOSER_SPIRAL_ID', 42 );
define( 'GG_CHOOSER_LINEN_ID', 77 );

require_once __DIR__ . '/ad-landing.php';

// Nonce action for the chooser forms, also doubles as the "this request came from
// our chooser" marker check alongside $_POST['gg_chooser'].
define( 'GG_CHOOSER_NONCE_ACTION', 'gg_chooser_add_to_cart' );

add_action( 'plugins_loaded', 'gg_planner_chooser_init' );
add_filter( 'wp_robots', 'gg_chooser_preview_robots' );
add_action( 'get_header', 'gg_chooser_divi_header_assets' );

function gg_chooser_header_assets() {
	wp_enqueue_style( 'gg-shared-header', plugins_url( 'assets/shared-header.css', __FILE__ ), array(), filemtime( __DIR__ . '/assets/shared-header.css' ) );
	wp_enqueue_script( 'gg-shared-header', plugins_url( 'assets/shared-header.js', __FILE__ ), array(), filemtime( __DIR__ . '/assets/shared-header.js' ), true );
}

function gg_chooser_render_header() {
	require __DIR__ . '/templates/header.php';
}

function gg_chooser_divi_header_assets( $name = null ) {
	// The standalone shop never calls get_header; blank Divi pages have no nav.
	if ( is_admin() || gg_chooser_is_shop() || 'Divi' !== get_template() || 'blank' === $name || 'page-template-blank.php' === get_page_template_slug() ) {
		return;
	}
	add_action( 'wp_body_open', 'gg_chooser_render_header' );
	add_filter( 'body_class', function ( $classes ) {
		$classes[] = 'gg-divi-shared-header';
		return $classes;
	} );
	add_action( 'wp_enqueue_scripts', function () {
		wp_enqueue_style( 'gg-divi-contrast', plugins_url( 'assets/divi-contrast.css', __FILE__ ), array(), filemtime( __DIR__ . '/assets/divi-contrast.css' ) );
		gg_chooser_header_assets();
	}, PHP_INT_MAX );
}

function gg_chooser_preview_robots( $robots ) {
	if ( in_array( get_queried_object_id(), array( 85, 91, 95 ), true ) && 'publish' === get_post_status( get_queried_object_id() )
		&& false !== has_filter( 'rest_pre_dispatch', 'gl_release_rest_gate' ) ) {
		$robots['noindex'] = true;
	}
	return $robots;
}

function gg_planner_chooser_init() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return;
	}
	add_shortcode( 'gg_planner_chooser', 'gg_planner_chooser_shortcode' );
	add_filter( 'template_include', 'gg_chooser_shop_template', 99 );

	// This plugin has no page-load hook of its own for handling the POST, and
	// never mutates the cart directly: the chooser's buttons are native Woo
	// simple-product add-to-cart buttons (name="add-to-cart", value=<product id>),
	// so WooCommerce's own add-to-cart form handler (hooked on wp_loaded by
	// WooCommerce core, not by this plugin) does the actual cart mutation. This
	// plugin only hooks the two filters Woo already offers around that flow:
	// - woocommerce_add_to_cart_validation: Woo's own form handler applies this
	//   filter itself, before it calls WC_Cart::add_to_cart(); add_to_cart() does not
	//   apply this filter itself. We use it to reject requests that aren't a valid,
	//   nonce-verified chooser submission for an allowlisted product. A re-choose
	//   of a binding already in the cart is not an error: it skips the duplicate
	//   add and continues straight to checkout, where quantities are edited.
	// - woocommerce_add_to_cart_redirect: also only consulted by Woo's own form
	//   handler, and only once it has already validated and added successfully. We
	//   use it to send a successful chooser add to checkout instead of Woo's default
	//   post-add destination, without touching the redirect for any other add-to-cart
	//   form on the site.
	add_filter( 'woocommerce_add_to_cart_validation', 'gg_chooser_validate_add_to_cart', 10, 3 );
	add_filter( 'woocommerce_add_to_cart_redirect', 'gg_chooser_redirect_to_checkout' );
}

/** Only evaluate this after WordPress has parsed the main query. */
function gg_chooser_is_shop() {
	return function_exists( 'is_shop' ) && function_exists( 'wc_get_page_id' )
		&& is_shop() && 12 === (int) wc_get_page_id( 'shop' );
}

function gg_chooser_shop_template( $template ) {
	$shop_template = __DIR__ . '/templates/shop.php';
	if ( ! gg_chooser_is_shop() || ! is_readable( $shop_template ) ) {
		return $template;
	}
	// template_include precedes wp_head; enqueue after the theme's normal callbacks.
	add_action( 'wp_enqueue_scripts', function () {
		wp_enqueue_style( 'gg-shop', plugins_url( 'assets/shop.css', __FILE__ ), array(), filemtime( __DIR__ . '/assets/shop.css' ) );
		gg_chooser_header_assets();
	}, PHP_INT_MAX );
	return $shop_template;
}

/**
 * Render the two-card chooser. Cards for missing products are simply omitted.
 */
function gg_planner_chooser_shortcode( $atts ) {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return '';
	}

	$cards = '';
	foreach ( array( GG_CHOOSER_SPIRAL_ID, GG_CHOOSER_LINEN_ID ) as $product_id ) {
		$cards .= gg_planner_chooser_render_card( $product_id );
	}

	if ( '' === trim( $cards ) ) {
		return '';
	}

	// Woo notices (e.g. this plugin's own "already in your cart" rejection, or any
	// other plugin's) aren't guaranteed to be printed by an arbitrary page/theme
	// template the shortcode is dropped into, unlike a real woocommerce.php/Woo
	// block template. Printing them here means a rejected chooser submission still
	// shows the shopper why, instead of the page just reloading with no feedback.
	$notices = '';
	if ( function_exists( 'wc_print_notices' ) ) {
		ob_start();
		wc_print_notices();
		$notices = ob_get_clean();
	}

	return gg_planner_chooser_styles() . $notices . '<div class="gg-planner-chooser">'
		. '<header class="gg-planner-chooser__intro"><h2>' . esc_html__( 'Choose your binding', 'gg-planner-chooser' ) . '</h2>'
		. '<p>' . esc_html__( 'Pick your planner, then continue to checkout.', 'gg-planner-chooser' ) . '</p></header>'
		. '<div class="gg-planner-chooser__cards">' . $cards . '</div></div>';
}

/**
 * Short binding labels for the buttons; card headings use the live Woo title.
 */
function gg_planner_chooser_card_label( $product_id ) {
	$labels = array(
		GG_CHOOSER_SPIRAL_ID => __( 'Spiral Binding', 'gg-planner-chooser' ),
		GG_CHOOSER_LINEN_ID  => __( 'Classic Linen Binding', 'gg-planner-chooser' ),
	);

	return isset( $labels[ $product_id ] ) ? $labels[ $product_id ] : '';
}

function gg_planner_chooser_render_card( $product_id ) {
	$product = wc_get_product( $product_id );

	if ( ! $product || ! $product->exists() || 'publish' !== $product->get_status() ) {
		return '';
	}

	$purchasable  = $product->is_purchasable();
	$available    = $purchasable && ( $product->is_in_stock() || $product->backorders_allowed() );
	$availability = $product->get_availability();
	$label        = gg_planner_chooser_card_label( $product_id );
	// Explicit, query-free action: without it the form defaults to the current
	// request URL, so a chooser page opened as ?gg_buy_now=1 would re-POST that
	// query string straight into an unrelated sandbox plugin's GET handler
	// (which empties the cart on any nonempty gg_buy_now). get_permalink() is
	// server-sourced, never request input, so this can't become an open redirect.
	$form_action = gg_chooser_is_shop() ? wc_get_page_permalink( 'shop' ) : get_permalink();
	if ( ! $form_action ) {
		$form_action = home_url( '/' );
	}

	ob_start();
	?>
	<article class="gg-planner-card">
		<div class="gg-planner-card__media"><?php echo $product->get_image( 'medium' ); ?></div>
		<div class="gg-planner-card__body">
			<h3 class="gg-planner-card__title"><?php echo esc_html( $product->get_name() ); ?></h3>
			<div class="gg-planner-card__price"><?php echo $product->get_price_html(); ?></div>
			<?php if ( ! empty( $availability['availability'] ) ) : ?>
				<p class="gg-planner-card__availability <?php echo esc_attr( $availability['class'] ); ?>">
					<?php echo esc_html( $availability['availability'] ); ?>
				</p>
			<?php endif; ?>
		</div>
		<?php if ( $available ) : ?>
			<form class="gg-planner-card__form" method="post" action="<?php echo esc_url( $form_action ); ?>">
				<input type="hidden" name="gg_chooser" value="1" />
				<?php wp_nonce_field( GG_CHOOSER_NONCE_ACTION, 'gg_nonce' ); ?>
				<button type="submit" name="add-to-cart" value="<?php echo esc_attr( $product->get_id() ); ?>" class="gg-planner-card__button">
					<?php
					printf(
						/* translators: %s: binding label, e.g. "Spiral Binding" */
						esc_html__( 'Choose %s', 'gg-planner-chooser' ),
						esc_html( $label )
					);
					?>
				</button>
			</form>
		<?php else : ?>
			<p class="gg-planner-card__unavailable"><?php esc_html_e( 'Currently unavailable', 'gg-planner-chooser' ); ?></p>
		<?php endif; ?>
	</article>
	<?php
	return ob_get_clean();
}

function gg_planner_chooser_styles() {
	static $printed = false;
	if ( $printed ) {
		return '';
	}
	$printed = true;
	return '<style>
.gg-planner-chooser{max-width:880px;margin:0 auto;color:#4a3220;font-size:16px;line-height:1.5}
.gg-planner-chooser,.gg-planner-chooser *{box-sizing:border-box}
.gg-planner-chooser .gg-planner-chooser__intro{margin:0}
.gg-planner-chooser .gg-planner-chooser__intro h2{font-family:Georgia,serif;font-size:clamp(1.5rem,3vw,2rem);font-weight:400;line-height:1.2;color:#4a3220;margin:0 0 .375rem;padding:0}
.gg-planner-chooser .gg-planner-chooser__intro p{margin:0 0 1rem;padding:0;color:#665b49;font-size:.9375rem;line-height:1.5}
.gg-planner-chooser__cards{display:grid;grid-template-columns:minmax(0,1fr);grid-auto-rows:1fr;gap:1rem}
.gg-planner-chooser .gg-planner-card{display:grid;grid-template-columns:104px minmax(0,1fr);grid-template-rows:1fr auto;gap:.75rem;background:#fffbf3;border:1px solid #d9c7a3;border-radius:8px;padding:.875rem;text-align:left;min-width:0}
.gg-planner-card__media{width:100%;height:120px;align-self:start;background:#f2ece1;border-radius:4px;overflow:hidden}
.gg-planner-chooser .gg-planner-card__media img{width:100%;height:100%;max-width:100%;object-fit:contain;display:block;margin:0;border-radius:0}
.gg-planner-card__body{min-width:0;align-self:center;overflow-wrap:anywhere}
.gg-planner-chooser .gg-planner-card__title{font-family:Georgia,serif;font-size:1.0625rem;font-weight:400;line-height:1.3;color:#4a3220;margin:0 0 .5rem;padding:0}
.gg-planner-card__price{font-size:1rem;line-height:1.4;color:#4a3220}
.gg-planner-chooser .gg-planner-card__availability{font-size:.8125rem;line-height:1.4;color:#596044;margin:.375rem 0 0;padding:0}
.gg-planner-chooser .gg-planner-card__form,.gg-planner-chooser .gg-planner-card__unavailable{grid-column:1/-1;align-self:end;margin:0;padding:0}
.gg-planner-chooser .gg-planner-card__button{display:block;background:#596044;color:#fffbf3;border:1px solid #596044;border-radius:4px;padding:.75rem .5rem;font-family:inherit;font-size:1rem;font-weight:600;line-height:1.25;text-align:center;cursor:pointer;min-height:48px;width:100%;white-space:normal;overflow-wrap:anywhere}
.gg-planner-chooser .gg-planner-card__button:hover{background:#454b34}
.gg-planner-chooser .gg-planner-card__button:focus-visible{outline:3px solid #4a3220;outline-offset:3px}
.gg-planner-chooser .gg-planner-card__unavailable{color:#665b49;min-height:48px;display:flex;align-items:center;font-size:.9375rem}
@media (min-width:640px){
.gg-planner-chooser__cards{grid-template-columns:repeat(2,minmax(0,1fr))}
.gg-planner-chooser .gg-planner-card{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr auto;padding:1.25rem;gap:1rem}
.gg-planner-card__media{height:240px}
.gg-planner-card__body{align-self:start}
.gg-planner-chooser .gg-planner-card__title{font-size:1.25rem}
}
</style>';
}

/**
 * Cart-item keys for every line in the cart matching a product id, found by
 * scanning the real cart contents (WC_Cart::get_cart()) rather than by
 * computing a single expected key, since a line another plugin decorated with
 * extra cart_item_data gets a different key than generate_cart_id() would
 * compute and would be missed by a single lookup.
 */
function gg_cart_line_keys_for_product( $product_id ) {
	$keys = array();
	foreach ( WC()->cart->get_cart() as $key => $line ) {
		if ( isset( $line['product_id'] ) && (int) $line['product_id'] === $product_id ) {
			$keys[] = $key;
		}
	}
	return $keys;
}

function gg_cart_total_quantity_for_product( $product_id ) {
	$cart  = WC()->cart->get_cart();
	$total = 0;
	foreach ( gg_cart_line_keys_for_product( $product_id ) as $key ) {
		$total += isset( $cart[ $key ]['quantity'] ) ? (int) $cart[ $key ]['quantity'] : 0;
	}
	return $total;
}

/**
 * True only for a same-origin chooser submission: our marker field, POST method,
 * a nonce that verifies against GG_CHOOSER_NONCE_ACTION, and an add-to-cart
 * product id on the allowlist. Shared by the validation and redirect hooks so
 * both apply exactly the same "is this one of ours" test.
 *
 * This is deliberately read-only (no cart access, no side effects): it's used by
 * the redirect filter too, which Woo only calls after its own add already
 * succeeded, so this function must never be the thing that decides success/failure
 * of the add itself.
 */
function gg_chooser_is_scoped_request() {
	if ( ! isset( $_POST['gg_chooser'] ) || ! is_scalar( $_POST['gg_chooser'] ) ) {
		return false;
	}
	if ( ! isset( $_SERVER['REQUEST_METHOD'] ) || 'POST' !== $_SERVER['REQUEST_METHOD'] ) {
		return false;
	}
	if ( ! isset( $_POST['gg_nonce'] ) || ! is_scalar( $_POST['gg_nonce'] ) || ! wp_verify_nonce( wp_unslash( $_POST['gg_nonce'] ), GG_CHOOSER_NONCE_ACTION ) ) {
		return false;
	}
	if ( ! isset( $_POST['add-to-cart'] ) || ! is_scalar( $_POST['add-to-cart'] ) ) {
		return false;
	}
	$product_id = absint( $_POST['add-to-cart'] );
	return in_array( $product_id, array( GG_CHOOSER_SPIRAL_ID, GG_CHOOSER_LINEN_ID ), true );
}

/**
 * True only when $value is numeric and exactly equal to 1 (int 1, float 1.0, or
 * a numeric string like "1"). Deliberately not absint($value) === 1: absint()
 * truncates to int before comparing, so absint(1.5) is 1 and a fractional
 * quantity would wrongly pass as "one". is_numeric() also rejects arrays and
 * bools outright, where a loose cast would silently coerce them.
 */
function gg_is_exactly_one( $value ) {
	return is_numeric( $value ) && 1.0 === (float) $value;
}

/**
 * woocommerce_add_to_cart_validation callback. Woo's own add-to-cart form handler
 * applies this filter itself, before it calls WC_Cart::add_to_cart(); returning
 * false here stops that handler from calling add_to_cart() at all, so nothing is
 * ever added, let alone needing to be undone.
 *
 * Any request without our marker field is left completely alone (returns
 * $passed unchanged) so this never affects any other add-to-cart form on the
 * site. For a scoped request this verifies authenticity, then either lets the
 * add proceed or — when that binding is already in the cart — skips the
 * duplicate add and sends the shopper on to the checkout, where line
 * quantities (and removals) are edited in place. Both bindings may share an
 * order, so there is no conflicting-binding rejection anymore; this never
 * removes or changes an existing cart line itself.
 *
 * $product_id/$quantity are whatever Woo's form handler resolved from the
 * request before calling this filter; they're re-checked against $_POST here
 * (scalar, and equal to what gg_chooser_is_scoped_request() itself read) so a
 * request can't be scoped-valid on one field but add/quantify a different
 * product than the one it was validated for.
 */
function gg_chooser_validate_add_to_cart( $passed, $product_id, $quantity ) {
	if ( ! isset( $_POST['gg_chooser'] ) ) {
		return $passed;
	}

	if ( ! is_scalar( $product_id ) || ! is_scalar( $quantity ) || ! gg_chooser_is_scoped_request() ) {
		wc_add_notice( __( 'Sorry, that selection could not be verified. Please try choosing again.', 'gg-planner-chooser' ), 'error' );
		return false;
	}

	$product_id = absint( $product_id );
	$posted_id  = isset( $_POST['add-to-cart'] ) ? absint( $_POST['add-to-cart'] ) : 0;
	if ( $product_id !== $posted_id || ! gg_is_exactly_one( $quantity ) ) {
		wc_add_notice( __( 'Sorry, that selection could not be verified. Please try choosing again.', 'gg-planner-chooser' ), 'error' );
		return false;
	}

	if ( ! WC()->cart ) {
		wc_add_notice( __( 'Sorry, your cart could not be reached. Please try again.', 'gg-planner-chooser' ), 'error' );
		return false;
	}

	if ( gg_cart_total_quantity_for_product( $product_id ) > 0 ) {
		// Already chosen: skip the duplicate add and continue to the checkout,
		// where the order card edits quantities in place. This runs inside
		// Woo's wp_loaded form handler, before any output, the same point at
		// which Woo itself issues its post-add redirect.
		wp_safe_redirect( wc_get_checkout_url() );
		exit;
	}

	return $passed;
}

/**
 * woocommerce_add_to_cart_redirect callback. Woo's own add-to-cart form handler
 * only consults this filter after it has already validated and successfully
 * called WC_Cart::add_to_cart(), so by the time this runs the chooser's add has
 * already happened; this only decides where the shopper lands afterwards.
 *
 * Any request that isn't a scoped chooser submission returns $url unchanged, so
 * every other add-to-cart form on the site keeps Woo's normal post-add
 * destination.
 */
function gg_chooser_redirect_to_checkout( $url ) {
	if ( gg_chooser_is_scoped_request() ) {
		return wc_get_checkout_url();
	}
	return $url;
}

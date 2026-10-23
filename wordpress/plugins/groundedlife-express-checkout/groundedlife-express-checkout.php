<?php
/**
 * Plugin Name: Grounded & Growing Express Checkout
 * Description: Two-click buying. Every add-to-cart continues straight to the checkout, /cart/ redirects to /checkout/, an empty checkout returns to the shop, and the block checkout's order summary gets quantity controls in WooCommerce's own style.
 * Version: 1.2.0
 * Author: Grounded & Growing
 * Text Domain: gg-express-checkout
 * Requires Plugins: woocommerce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Stock is unmanaged on both planners, so the quantity controls need their own ceiling.
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

	add_action( 'wp_enqueue_scripts', 'gge_enqueue_checkout_quantity_controls' );

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
 * The Checkout block's order summary is read-only; assets/checkout-qty.js adds
 * quantity and remove controls to it.
 */
function gge_enqueue_checkout_quantity_controls() {
	if ( ! is_checkout() || is_wc_endpoint_url() || ! has_block( 'woocommerce/checkout', wc_get_page_id( 'checkout' ) ) ) {
		return;
	}

	$dir = plugin_dir_path( __FILE__ ) . 'assets/';
	$url = plugin_dir_url( __FILE__ ) . 'assets/';

	wp_enqueue_style( 'gge-checkout-qty', $url . 'checkout-qty.css', array(), (string) filemtime( $dir . 'checkout-qty.css' ) );
	wp_enqueue_script(
		'gge-checkout-qty',
		$url . 'checkout-qty.js',
		array( 'wp-api-fetch', 'wp-data', 'wp-hooks', 'wc-blocks-data-store' ),
		(string) filemtime( $dir . 'checkout-qty.js' ),
		true
	);
	wp_add_inline_script(
		'gge-checkout-qty',
		'window.ggeCheckoutQty = ' . wp_json_encode(
			array(
				'shopUrl' => wc_get_page_permalink( 'shop' ),
				'max'     => GGE_QTY_MAX,
				'i18n'    => array(
					/* translators: %s: product name */
					'quantity'    => __( 'Quantity of %s in your order', 'gg-express-checkout' ),
					/* translators: %s: product name */
					'decrease'    => __( 'Reduce quantity of %s', 'gg-express-checkout' ),
					/* translators: %s: product name */
					'increase'    => __( 'Increase quantity of %s', 'gg-express-checkout' ),
					'remove'      => __( 'Remove', 'gg-express-checkout' ),
					/* translators: %s: product name */
					'removeLabel' => __( 'Remove %s from your order', 'gg-express-checkout' ),
					'error'       => __( 'Sorry, your order could not be updated. Please try again.', 'gg-express-checkout' ),
				),
			)
		) . ';',
		'before'
	);
}

function gge_maybe_purge_caches() {
	if ( '1' !== get_option( 'gge_purge_pending' ) ) {
		return;
	}
	delete_option( 'gge_purge_pending' );
	do_action( 'litespeed_purge_all' );
	wp_cache_flush();
}

/**
 * Grounded & Growing express checkout: quantity controls for the block
 * checkout's order summary.
 *
 * WooCommerce's Checkout block renders its order summary read-only. This adds
 * WooCommerce's own quantity-selector markup under each line and applies
 * changes through the Store API (cart/update-item, cart/remove-item). Those
 * routes are called directly instead of through the cart store's actions,
 * which batch every write into /wc/store/v1/batch, a route the site's release
 * gate rejects. Each response goes to the cart store's receiveCart, so every
 * native price, badge and total re-renders as usual.
 *
 * Lines are deliberately not flagged as pending in the cart store: any pending
 * line makes the summary swap to its loading skeleton for at least two
 * seconds. receiveCart would then announce the shopper's own change as a
 * server-side adjustment, so those two notices are filtered for in-flight keys.
 */
( function () {
	'use strict';

	const wp = window.wp;
	const cfg = window.ggeCheckoutQty;
	if ( ! wp || ! wp.data || ! wp.apiFetch || ! wp.hooks || ! cfg ) {
		return;
	}

	const CART_STORE = 'wc/store/cart';
	const cartActions = wp.data.dispatch( CART_STORE );
	if ( ! cartActions || 'function' !== typeof cartActions.receiveCart ) {
		return;
	}

	const DEBOUNCE_MS = 400;
	const pending = {};
	const ownChanges = new Set();

	const decoder = document.createElement( 'textarea' );
	const decode = ( html ) => {
		decoder.innerHTML = html;
		return decoder.value;
	};
	const normalize = ( text ) => text.replace( /\s+/g, ' ' ).trim();
	const label = ( template, name ) => template.replace( '%s', name );

	const cartItems = () => {
		const data = wp.data.select( CART_STORE ).getCartData();
		return data && data.items ? data.items : [];
	};
	const findItem = ( key ) => cartItems().find( ( item ) => item.key === key );

	const limitsOf = ( item ) => {
		const limits = item.quantity_limits || {};
		const min = Math.max( 1, parseInt( limits.minimum, 10 ) || 1 );
		const max = Math.max( min, Math.min( cfg.max, parseInt( limits.maximum, 10 ) || cfg.max ) );
		return { min, max, editable: false !== limits.editable };
	};
	const clamp = ( qty, item ) => {
		const { min, max } = limitsOf( item );
		return Math.min( max, Math.max( min, qty ) );
	};

	const setBusy = ( key, busy ) =>
		document
			.querySelectorAll( `.gge-qty-row[data-key="${ CSS.escape( key ) }"]` )
			.forEach( ( row ) => row.classList.toggle( 'is-busy', busy ) );

	const request = ( route, data ) => wp.apiFetch( { path: `/wc/store/v1/${ route }`, method: 'POST', data } );
	const receiveCart = ( cart ) => cartActions.receiveCart( cart );

	// receiveCart runs its notice checks synchronously, inside this window.
	const receiveOwnChange = ( key, cart ) => {
		ownChanges.add( key );
		try {
			receiveCart( cart );
		} finally {
			ownChanges.delete( key );
		}
	};
	const keepNotice = ( show, item ) => ( item && ownChanges.has( item.key ) ? false : show );
	wp.hooks.addFilter( 'woocommerce_show_cart_item_quantity_changed_notice', 'gge/express-checkout', keepNotice );
	wp.hooks.addFilter( 'woocommerce_show_cart_item_removed_notice', 'gge/express-checkout', keepNotice );

	// Only Store API errors (they carry a code) have shopper-facing messages.
	const fail = ( error ) => {
		const message = error && error.code && error.message ? decode( error.message ) : cfg.i18n.error;
		wp.data.dispatch( 'core/notices' ).createErrorNotice( message, { context: 'wc/checkout', id: 'gge-qty-error' } );
		return wp.apiFetch( { path: '/wc/store/v1/cart' } ).then( receiveCart ).catch( () => {} );
	};

	function commit( key ) {
		const state = pending[ key ];
		const item = findItem( key );
		if ( ! state || ! item ) {
			delete pending[ key ];
			return;
		}
		state.timer = null;
		if ( state.inFlight ) {
			return;
		}
		if ( state.qty === item.quantity ) {
			delete pending[ key ];
			scheduleSync();
			return;
		}

		const qty = state.qty;
		state.inFlight = true;
		setBusy( key, true );

		request( 'cart/update-item', { key, quantity: qty } )
			.then( ( cart ) => receiveOwnChange( key, cart ), fail )
			.catch( fail )
			.then( () => {
				state.inFlight = false;
				setBusy( key, false );
				if ( state.qty === qty ) {
					clearTimeout( state.timer );
					delete pending[ key ];
				} else if ( ! state.timer ) {
					// A newer quantity arrived while this one was in flight.
					commit( key );
				}
				scheduleSync();
			} );
	}

	function setQuantity( key, qty ) {
		const state = pending[ key ] || ( pending[ key ] = {} );
		state.qty = qty;
		clearTimeout( state.timer );
		state.timer = setTimeout( () => commit( key ), DEBOUNCE_MS );
		scheduleSync();
	}

	function removeItem( key ) {
		if ( pending[ key ] ) {
			clearTimeout( pending[ key ].timer );
			delete pending[ key ];
		}
		setBusy( key, true );

		request( 'cart/remove-item', { key } )
			.then( ( cart ) => {
				if ( ! cart.items || ! cart.items.length ) {
					// Nothing left to check out.
					window.location.href = cfg.shopUrl;
					return;
				}
				receiveOwnChange( key, cart );
			} )
			.catch( ( error ) => {
				setBusy( key, false );
				return fail( error );
			} );
	}

	function buildRow( item ) {
		const name = normalize( decode( item.name ) );
		const row = document.createElement( 'div' );
		row.className = 'gge-qty-row';
		row.dataset.key = item.key;

		const selector = document.createElement( 'div' );
		selector.className = 'wc-block-components-quantity-selector';

		const minus = document.createElement( 'button' );
		minus.type = 'button';
		minus.className = 'wc-block-components-quantity-selector__button wc-block-components-quantity-selector__button--minus';
		minus.setAttribute( 'aria-label', label( cfg.i18n.decrease, name ) );
		minus.textContent = '−';

		const input = document.createElement( 'input' );
		input.type = 'number';
		input.step = '1';
		input.inputMode = 'numeric';
		input.className = 'wc-block-components-quantity-selector__input';
		input.setAttribute( 'aria-label', label( cfg.i18n.quantity, name ) );

		const plus = document.createElement( 'button' );
		plus.type = 'button';
		plus.className = 'wc-block-components-quantity-selector__button wc-block-components-quantity-selector__button--plus';
		plus.setAttribute( 'aria-label', label( cfg.i18n.increase, name ) );
		plus.textContent = '+';

		selector.append( minus, input, plus );

		const remove = document.createElement( 'button' );
		remove.type = 'button';
		remove.className = 'gge-qty-row__remove';
		remove.textContent = cfg.i18n.remove;
		remove.setAttribute( 'aria-label', label( cfg.i18n.removeLabel, name ) );

		row.append( selector, remove );
		return row;
	}

	// The summary renders one line per cart item, in cart order (twice on
	// small screens: the collapsible panel and the summary above Place order).
	// A line only gets controls when its rendered name matches that cart item.
	function sync() {
		syncScheduled = false;
		const items = cartItems();
		document.querySelectorAll( '.wc-block-components-order-summary' ).forEach( ( summary ) => {
			const lines = summary.querySelectorAll( '.wc-block-components-order-summary-item' );
			if ( lines.length !== items.length ) {
				return;
			}
			lines.forEach( ( line, index ) => {
				const item = items[ index ];
				const description = line.querySelector( '.wc-block-components-order-summary-item__description' );
				const nameEl = line.querySelector( '.wc-block-components-product-name' );
				if ( ! description || ! nameEl || normalize( nameEl.textContent ) !== normalize( decode( item.name ) ) ) {
					return;
				}

				let row = description.querySelector( ':scope > .gge-qty-row' );
				if ( row && row.dataset.key !== item.key ) {
					row.remove();
					row = null;
				}
				if ( ! row ) {
					row = buildRow( item );
					description.appendChild( row );
				}

				const { min, max, editable } = limitsOf( item );
				const state = pending[ item.key ];
				const qty = state ? state.qty : item.quantity;
				const input = row.querySelector( 'input' );
				row.querySelector( '.wc-block-components-quantity-selector' ).hidden = ! editable;
				row.classList.toggle( 'is-busy', !! ( state && state.inFlight ) );
				input.min = String( min );
				input.max = String( max );
				if ( document.activeElement !== input && input.value !== String( qty ) ) {
					input.value = String( qty );
				}
				row.querySelector( '.wc-block-components-quantity-selector__button--minus' ).disabled = qty <= min;
				row.querySelector( '.wc-block-components-quantity-selector__button--plus' ).disabled = qty >= max;
			} );
		} );
	}

	let syncScheduled = false;
	function scheduleSync() {
		if ( ! syncScheduled ) {
			syncScheduled = true;
			window.requestAnimationFrame( sync );
		}
	}

	document.addEventListener( 'click', ( event ) => {
		const button = event.target.closest( '.gge-qty-row button' );
		if ( ! button ) {
			return;
		}
		const key = button.closest( '.gge-qty-row' ).dataset.key;
		const item = findItem( key );
		if ( ! item ) {
			return;
		}
		if ( button.classList.contains( 'gge-qty-row__remove' ) ) {
			removeItem( key );
			return;
		}
		const current = pending[ key ] ? pending[ key ].qty : item.quantity;
		const step = button.classList.contains( 'wc-block-components-quantity-selector__button--plus' ) ? 1 : -1;
		setQuantity( key, clamp( current + step, item ) );
	} );

	document.addEventListener( 'change', ( event ) => {
		if ( ! event.target.matches( '.gge-qty-row input' ) ) {
			return;
		}
		const item = findItem( event.target.closest( '.gge-qty-row' ).dataset.key );
		if ( ! item ) {
			return;
		}
		const qty = clamp( parseInt( event.target.value, 10 ) || item.quantity, item );
		event.target.value = String( qty );
		setQuantity( item.key, qty );
	} );

	// Enter inside the checkout must never submit the order from here.
	document.addEventListener( 'keydown', ( event ) => {
		if ( 'Enter' === event.key && event.target.matches( '.gge-qty-row input' ) ) {
			event.preventDefault();
			event.target.blur();
		}
	} );

	wp.data.subscribe( scheduleSync );
	new window.MutationObserver( scheduleSync ).observe(
		document.querySelector( '.wp-block-woocommerce-checkout' ) || document.body,
		{ childList: true, subtree: true }
	);
	scheduleSync();
} )();

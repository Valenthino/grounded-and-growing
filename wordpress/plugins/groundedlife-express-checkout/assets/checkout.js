/**
 * Grounded & Growing express checkout: the "Your order" card's quantity,
 * remove and add-the-other-binding controls.
 *
 * Every operation posts to wc-ajax=gge_cart and then triggers Woo's own
 * update_checkout, which re-renders totals AND this card (the card is included
 * in the order-review fragments server-side), so there is no client state to
 * keep in sync. Handlers are delegated on document because the card element is
 * replaced on every refresh.
 */
(function ($) {
	'use strict';

	if (typeof ggeCheckout === 'undefined' || !ggeCheckout.endpoint) {
		return;
	}

	function card() {
		return $('.gge-order-card');
	}

	function post(data) {
		var $card = card();
		if ($card.hasClass('gge-busy')) {
			return;
		}
		$card.addClass('gge-busy');
		data.security = $card.data('gge-nonce');
		$.post(ggeCheckout.endpoint, data)
			.done(function (res) {
				if (res && res.success) {
					if (res.data && res.data.cart_count === 0 && res.data.shop_url) {
						// Last item removed: there is nothing left to check out.
						window.location = res.data.shop_url;
						return;
					}
					$(document.body).trigger('update_checkout');
				} else {
					window.location.reload();
				}
			})
			.fail(function () {
				window.location.reload();
			});
	}

	// The fragment refresh replaces the card (clearing gge-busy); this covers
	// refreshes that leave the card untouched.
	$(document.body).on('updated_checkout', function () {
		card().removeClass('gge-busy');
	});

	$(document).on('click', '.gge-qty__btn', function () {
		var $btn = $(this);
		var $input = $btn.closest('.gge-qty').find('.gge-qty__input');
		var qty = parseInt($input.val(), 10) || 1;
		qty += $btn.hasClass('gge-qty__plus') ? 1 : -1;
		qty = Math.max(1, Math.min(parseInt($input.attr('max'), 10) || 99, qty));
		$input.val(qty);
		post({ op: 'set_qty', key: $btn.data('key'), qty: qty });
	});

	$(document).on('change', '.gge-qty__input', function () {
		var $input = $(this);
		var qty = Math.max(1, Math.min(parseInt($input.attr('max'), 10) || 99, parseInt($input.val(), 10) || 1));
		$input.val(qty);
		post({ op: 'set_qty', key: $input.data('key'), qty: qty });
	});

	$(document).on('click', '.gge-remove', function () {
		post({ op: 'remove', key: $(this).data('key') });
	});

	$(document).on('click', '.gge-add-other__btn', function () {
		post({ op: 'add', product_id: $(this).data('product') });
	});
})(jQuery);

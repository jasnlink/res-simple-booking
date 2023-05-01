//formats price from cents to dollars
function useFormatPrice(price) {

	if (price === 0) {
		return '$0.00';
	}
	if(!price) {
		return null;
	}

	price = price.toString();

	if (price.length > 2) {
		let dollars = price.slice(0, -2);
		let cents = price.slice(-2, price.length);

		return '$' + dollars + '.' + cents;
	}
	if (price.length === 2) {
		return '$0.' + price;
	}
	if (price.length === 1) {
		return '$0.0' + price;
	}
	
	return null;

}

export default useFormatPrice;
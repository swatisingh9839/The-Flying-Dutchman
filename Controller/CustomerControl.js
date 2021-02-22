
const setView = (lang = 'en') => {
	$('#title').text(dict[lang].title),
		$('#login').text(dict[lang].login),
		$('#popular-items').text(dict[lang].items[0]),
		$('#beer').text(dict[lang].items[1]),
		$('#wine').text(dict[lang].items[2]),
		$('#filter').text(dict[lang].filter),
		$('#current-order').text(dict[lang].currentOrder),
		$('#checkout').text(dict[lang].checkout);
	setProducts(getBeers());
};

$(function () {
	setView('en');
});

const getBeers = () => {
	// Using a local variable to collect the items.
	var collector = [];

	// The DB is stored in the variable DB2, with "spirits" as key element. If you need to select only certain
	// items, you may introduce filter functions in the loop... see the template within comments.
	//
	for (i = 0; i < DB2.spirits.length; i++) {
		if (DB2.spirits[i].varugrupp.includes('Ale')) {
			collector.push([
				DB2.spirits[i].namn,
				DB2.spirits[i].alkoholhalt,
				DB2.spirits[i].prisinklmoms,
				DB2.spirits[i].producent,
				DB2.spirits[i].varugrupp.split(',')[1].trim(),
				DB2.spirits[i].ursprunglandnamn,
				DB2.spirits[i].forpackning,
			]);
			
		}
	}
	//
	return collector;
};

const getWines = () => {
	var collector = [];

	// The DB is stored in the variable DB2, with "spirits" as key element. If you need to select only certain
	// items, you may introduce filter functions in the loop... see the template within comments.
	//
	for (i = 0; i < DB2.spirits.length; i++) {
		if (DB2.spirits[i].varugrupp.includes('vin')) {
			collector.push([
				DB2.spirits[i].namn,
				DB2.spirits[i].alkoholhalt,
				DB2.spirits[i].prisinklmoms,
				DB2.spirits[i].producent,
				DB2.spirits[i].varugrupp,
				DB2.spirits[i].ursprunglandnamn,
				DB2.spirits[i].forpackning,
			]);
		}
	}

	//
	return collector;
};

const setProducts = (products) => {
	const productContainer = document.querySelector('#bar-products');
	products.forEach((prod, i) => {
		const product = document.createElement('div');
		product.className = `product ${i == 0 ? 'selected' : ''}`;
		product.innerHTML = `
                    <div class="product-name">${prod[0]}</div>
					<div class="product-percentage">${prod[1]}</div>
					<div class="product-price">${prod[2]}</div>
					<div class="product-extra ${i == 0 ? 'product-expanded' : ''}">
						<div class="product-producer">Producer: ${prod[3]}</div>
						<div class="product-type">Type: ${prod[4]}</div>
						<div class="product-country">Country: ${prod[5]}</div>
						<div class="product-size">Serving Size: ${prod[6]}</div>
						<button>Add</button>
					</div>
				`;
		productContainer.appendChild(product);
	});
};

// Set order page view
const setOrderView = (lang = 'en') => {
	    $('#title').text(dict[lang].title),
		$('#login').text(dict[lang].login),
		$('#add_item').text(dict[lang].addItem),
		$('#undo').text(dict[lang].undo),
		$('#redo').text(dict[lang].redo),
		$('#pay_table').text(dict[lang].payTable),
		$('#pay_bar').text(dict[lang].payBar),
		$('#total').text(dict[lang].total),
		$('#order').text(dict[lang].order);
	setOrderList(1); //TODO: order id should be passed from checkout function
};

// Fill the ordered items list
const setOrderList = (orderid) => {
	const orderContainer = document.querySelector('#item_list');
	let temp_orders = dummyOrders(); //TODO: use the array filled from checkout function
	let total_price = 0;

	// Find the order matching the id
	for (i = 0; i < temp_orders.length; i++) {
		if(temp_orders[i].orderid == orderid)
		{
			// Fetch the items from DB using item ids in order
			temp_orders[i].itemid.forEach((id) => {
				for (j = 0; j < DB2.spirits.length; j++) {
					if (DB2.spirits[j].nr == id) {

						let item = DB2.spirits[j];
						total_price = total_price + parseInt(item.prisinklmoms);

						// Create a row for the item in view
						const order_item = document.createElement('div');
						order_item.className = `ordered_item`;
						order_item.innerHTML = `
                    		<div class="product-name">${item.namn}</div>
							<div class="product-percentage">${item.alkoholhalt}</div>
							<div class="product-price">${item.prisinklmoms}</div>
							<button id="div-button"  onclick="delOrderlist(this)">Del</button>
						`;
						orderContainer.appendChild(order_item);
					}
				}
			});
		}
	}

	// Fill the toatl price
	$('#total_val').text(total_price);
};

//TODO: remove this when the checkout functionality is completed
const dummyOrders = () => {
	// Using a local variable to collect the items.
	var collector = [];
	var items = [];
	items.push(10001);
	items.push(1001);
	items.push(1001201);
	collector.push({orderid:1,tableno:7,itemid:items});
	return collector;
};

// Delete the list of order
const delOrderlist = (orders) => {
	orders.parentElement.remove();
	updateTotal();
};



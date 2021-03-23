const bartenderTables = document.getElementById('tables');

// Sets the bartender view with the selected option drinks
const bSetOption = (option) => {
	state.selectedOpt = option;
	if (state.selectedOpt === 'drinks') setBartenderProducts(drinks);
	else if (state.selectedOpt === 'beers') setBartenderProducts(beers);
	else if (state.selectedOpt === 'wines') setBartenderProducts(wines);
	// else if (state.selectedOpt === 'special') setBartenderProducts(special);
};

// Listeners which expands the products in the bartender view.
$(document).ready(() => {
	setMenuView();
	document.querySelector('#products').addEventListener('click', (e) => {
		if (e.target.classList.contains('overlay') || e.target.classList.contains('update-form')) {
			return;
		} else if (e.target.classList.contains('b-product')) {
			const selectedProduct = e.target;
			selectedProduct.classList.toggle('selected');
			selectedProduct.querySelector('.product-extra').classList.toggle('b-product-expanded');
		} else if (e.target.parentElement.classList.contains('b-product')) {
			const selectedProduct = e.target.parentElement;
			selectedProduct.classList.toggle('selected');
			selectedProduct.querySelector('.product-extra').classList.toggle('b-product-expanded');
		} else if (
			e.target.tagName !== 'BUTTON' &&
			e.target.parentElement.parentElement &&
			e.target.parentElement.parentElement.classList.contains('b-product')
		) {
			const selectedProduct = e.target.parentElement.parentElement;
			selectedProduct.classList.toggle('selected');
			selectedProduct.querySelector('.product-extra').classList.toggle('b-product-expanded');
		}
	});
});

// Setting up the language in the bartender view.
const setMenuView = () => {
	$('#home').text(dict[state.lang].home),
		$('#title').text(dict[state.lang].title),
		$('#login').text(dict[state.lang].login),
		$('#b-drinks').text(dict[state.lang].items[0]),
		$('#b-beers').text(dict[state.lang].items[1]),
		$('#b-wines').text(dict[state.lang].items[2]),
		$('#security').text(dict[state.lang].sec);
	$('#vipManager').text(dict[state.lang].vipman);
	$('#current-order').text(dict[state.lang].currentOrder), setBartenderProducts(state.prod);
	document.querySelector('.current-order-bartender').style.display = 'none';
	updateTables();
};

// Setting up the vip management view
const setVipView = () => {
	$('#backToBartender').text(dict[state.lang].back);
	setVIPUsers(DB.users, DB.account);
};

// Collects the vip users from the database and adds them to the html
const setVIPUsers = (users, account) => {
	const productContainer = document.querySelector('#vip-users');
	productContainer.textContent = '';

	users.forEach((user) => {
		if (user.credentials != 3) return;

		var credit = 0;
		account.forEach((id) => {
			if (user.user_id == id.user_id) {
				credit = id.creditSEK;
			}
		});

		const usr = document.createElement('div');
		usr.className = `user-grid`;
		usr.setAttribute('id', user.user_id);
		usr.innerHTML = `
                    <span class="product-name">${user.first_name}</span>
					<span class="product-name">${user.last_name}</span>
					<span class="product-name">${credit}</span>
					<button onclick="updateVIPBalance('${user.user_id}')">${dict[state.lang].addBalance}</button>
				`;
		productContainer.appendChild(usr);
	});
};

// Updates the vip members balance in their account
function updateVIPBalance(id) {
	var price = prompt('Add to balance:', '');

	for (var i = 0; i < DB.account.length; i++) {
		if (DB.account[i].user_id == id) {
			var number = parseInt(DB.account[i].creditSEK, 10) + parseInt(price, 10);
			DB.account[i].creditSEK = number.toString();
			setVipView();
			return;
		}
	}
}

// Setting up the products for the bartender
const setBartenderProducts = (products) => {
	const barProductsVariabel = document.querySelector('#b-bar-products');
	barProductsVariabel.style.display = 'block';
	state.prod = products;
	//document.querySelector('#current-order').style.display = 'none';
	const productContainer = document.querySelector('#products');
	productContainer.textContent = '';
	const barOptions = document.querySelector('.b-bar-options');
	const selectedProduct = barOptions.querySelector('.btn-selected');
	if (selectedProduct) selectedProduct.classList.remove('btn-selected');

	document.querySelector(`#b-${state.selectedOpt}`).classList.add('btn-selected');

	products.forEach((prod, i) => {
		const product = document.createElement('div');
		product.className = `b-product ${!prod.menuflag ? 'hidden-product' : ''} ${
			prod.qty <= 5 ? 'prod-low' : ''
		}`;
		product.innerHTML = `
        <div class="overlay" id="product-${i}">
            <div class="update-form price-form">
                <span>${dict[state.lang].updateP}</span>
                <input type="number" value="${prod.prisinklmoms}">
                <button onClick="setPrice(${i},${prod.artikelid})">${
			dict[state.lang].update
		}</button>
            </div>
            <div class="update-form stock-form" >
				<span>${dict[state.lang].updateS}</span>
                <input type="number" value="${prod.qty}">
                <button onClick="setStock(${i},${prod.artikelid})">${
			dict[state.lang].update
		}</button>
            </div>
        </div>
        <span class="product-name">${prod.namn}</span>
        <span class="b-product-percentage">${prod.alkoholhalt}</span>
        <span class="product-price">${prod.prisinklmoms}</span>
        <span class="b-product-stock">${prod.qty}</span>
        <span class="product-extra">
		<span class="product-producer">${dict[state.lang].producer}: ${prod.producent}</span>
		<span class="product-type">${dict[state.lang].type}: ${prod.varugrupp}</span>
		<span class="product-country">${dict[state.lang].country}: ${prod.ursprungslandnamn}</span>
		<span class="product-size">${dict[state.lang].size}: ${prod.forpackning}</span>
		${
			state.updatingOrder
				? `<button onclick="bartenderAddItem(${i})">Add Item</button>`
				: `
		<button onclick="showPriceOverlay(${i})">${dict[state.lang].updateP}</button>
		<button onclick="bartenderToggleProduct(${i})">${
						prod.menuflag ? `${dict[state.lang].hide}` : `${dict[state.lang].show}`
				  }</button>
		<button onclick="showStockOverlay(${i})">${dict[state.lang].updateS}</button>`
		}
            
        </span>

				`;
		productContainer.appendChild(product);
	});
};

// Toggles a product to be shown for the customers or not
const bartenderToggleProduct = (prodIdx) => {
	state.prod[prodIdx].menuflag = !state.prod[prodIdx].menuflag;
	updateProduct(prodIdx);
};

// Brings up an overlay
const showPriceOverlay = (i) => {
	const productOverlay = document.querySelector(`#product-${i}`);
	productOverlay.style.display = 'flex';
	productOverlay.querySelector('.price-form').style.display = 'block';
};

// Updates the price of an item
const setPrice = (i, aid) => {
	const productOverlay = document.querySelector(`#product-${i}`);
	productOverlay.style.display = 'none';
	const priceForm = productOverlay.querySelector('.price-form');
	priceForm.style.display = 'none';
	const price = parseFloat(priceForm.querySelector('input').value).toFixed(2);
	updatePriceDB(aid, state.selectedOpt, price);
	updateProduct(i);
};

// Brings up an overlay
const showStockOverlay = (i) => {
	const productOverlay = document.querySelector(`#product-${i}`);
	productOverlay.style.display = 'flex';
	productOverlay.querySelector('.stock-form').style.display = 'block';
};

// Updates the stock of an item
const setStock = (i, aid) => {
	const productOverlay = document.querySelector(`#product-${i}`);
	productOverlay.style.display = 'none';
	const stockForm = productOverlay.querySelector('.stock-form');
	stockForm.style.display = 'none';
	const qty = parseInt(stockForm.querySelector('input').value);
	updateStockDB(aid, state.selectedOpt, qty);
	updateProduct(i);
};

// Updates the products
const updateProduct = (i) => {
	const products = document.querySelectorAll('.b-product');
	const prod = state.prod[i];
	if (!prod.menuflag) products[i].classList.add('hidden-product');
	else {
		try {
			products[i].classList.remove('hidden-product');
		} catch (e) {}
	}
	if (prod.qty <= 5) products[i].classList.add('prod-low');
	else {
		try {
			products[i].classList.remove('prod-low');
		} catch (e) {}
	}
	products[i].innerHTML = ` <div class="overlay" id="product-${i}">
    <div class="update-form price-form">
        <span>${dict[state.lang].updateP}</span>
        <input type="number" value="${prod.prisinklmoms}">
        <button onClick="setPrice(${i},${prod.artikelid})">${dict[state.lang].update}</button>
    </div>
    <div class="update-form stock-form" >
        <span>${dict[state.lang].updateS}</span>
        <input type="number" value="${prod.qty}">
        <button onClick="setStock(${i},${prod.artikelid})">${dict[state.lang].update}</button>
    </div>
</div>
<span class="product-name">${prod.namn}</span>
<span class="b-product-percentage">${prod.alkoholhalt}</span>
<span class="product-price">${prod.prisinklmoms}</span>
<span class="b-product-stock">${prod.qty}</span>
<span class="product-extra b-product-expanded">
    <span class="product-producer">Producer: ${prod.producent}</span>
    <span class="product-type">Type: ${prod.varugrupp}</span>
    <span class="product-country">Country: ${prod.ursprungslandnamn}</span>
    <span class="product-size">Serving Size: ${prod.forpackning}</span>
    <button onclick="showPriceOverlay(${i})">${dict[state.lang].updateP}</button>
	<button onclick="bartenderToggleProduct(${i})">${
		prod.menuflag ? `${dict[state.lang].hide}` : `${dict[state.lang].show}`
	}</button>
    <button onclick="showStockOverlay(${i})">${dict[state.lang].updateS}</button>
</span>
`;
};

// Brings up an order and the items contained within it for the bartender
const setOrderListBartender = (orderIdx) => {
	if (state.currentOrder !== null) return;
	console.log(orderIdx);
	document.querySelector('#b-bar-products').style.display = 'none';
	document.querySelector('.current-order-bartender').style.display = 'initial';
	const orderContainer = document.querySelector('.product-list');
	orderContainer.innerHTML = '';
	let total_price = 0;
	const order = orders.getOrders()[orderIdx];
	order.products().forEach((product, i) => {
		total_price = total_price + (product.isFree ? 0 : parseInt(product.prisinklmoms));

		// Create a row for the item in view
		const order_item = document.createElement('div');
		order_item.className = `ordered_item`;
		order_item.innerHTML = `
				<div class="product-name">${product.namn}</div>
				<div class="product-percentage">${product.alkoholhalt}</div>
				<div class="product-price">${product.isFree ? 0 : product.prisinklmoms}</div>
				<div class="bartender-order-buttons">
				<button id="div-button"  onclick="bartenderDelOrderlist(this,${orderIdx},${i})">Del</button>
				<button onclick="toggleFree(${orderIdx},${i})">${product.isFree ? 'Not Free' : 'Make Free'}</button>
				</div>
				
			`;
		orderContainer.appendChild(order_item);
	});
	const orderProducts = document.querySelector('.order-products');
	if (!orderProducts.querySelector('a')) {
		const a = document.createElement('a');
		a.setAttribute('onclick', `addItems(${orderIdx})`);
		a.textContent = 'Add Items';
		orderProducts.appendChild(a);
		const an = document.createElement('a');
		an.setAttribute('onclick', `payOrder(${orderIdx})`);
		an.classList.add('btn');
		an.textContent = 'End Order';
		an.style.alignSelf = 'flex-end';
		orderProducts.appendChild(an);
	} else {
		orderProducts.querySelector('a').setAttribute('onclick', `addItems(${orderIdx})`);
	}

	$('.pay-option').text('Paying at ' + order.getPayOption());

	$('.bartender-order-total').text(total_price + ' Kr');
};

// Removes an item from the orderlist
const bartenderDelOrderlist = (product, orderIdx, prodIdx) => {
	product.parentElement.remove();
	orders.removeItem(orderIdx, prodIdx);
	setOrderListBartender(orderIdx);
};

// Adds an item to the orderlist
const addItems = (orderIdx) => {
	state.currentOrder = orderIdx;
	state.updatingOrder = true;
	setMenuView();
};

// Toggles between free and not free item
const toggleFree = (orderIdx, prodIdx) => {
	orders.toggleFree(orderIdx, prodIdx);
	setOrderListBartender(orderIdx);
};

// Adds an item to the current order
const bartenderAddItem = (prodIdx) => {
	const orderIdx = state.currentOrder;
	const prod = state.prod[prodIdx];
	orders.addItem(orderIdx, prod);
	state.currentOrder = null;
	state.updatingOrder = false;
	setOrderListBartender(orderIdx);
};

// Updates the tables for the bartender
const updateTables = () => {
	const tableContainer = document.querySelector('.tables');
	tableContainer.textContent = '';
	for (let table in state.tables) {
		const div = document.createElement('div');
		div.className = 'table';
		if (orders.getOrders().length) {
			for (let i = 0; i < orders.getOrders().length; i++) {
				if (orders.getOrders()[i].table === parseInt(table)) {
					div.innerHTML = `
							<h2> Table ${table} </h2>
							<span> ${dict[state.lang].newOrder} </span>
							`;
					div.addEventListener('click', (e) => {
						if (div.querySelector('span')) {
							setOrderListBartender(i);
							//setOrder(state.tables[table].order);
						}
					});
					console.log(table, state.currentOrder, orders.getOrders()[i].table);
					if (
						state.currentOrder !== null &&
						orders.getOrders()[i].table === state.currentOrder + 1
					) {
						div.innerHTML += `
						<a class="btn" style="float: right" onclick="cancelItemAddition(${state.currentOrder})">Cancel</a>
						`;
					}
					break;
				} else {
					div.innerHTML = `
							<h2> Table ${table} </h2>`;
				}
			}
		} else {
			div.innerHTML = `
							<h2> Table ${table} </h2>`;
		}

		tableContainer.appendChild(div);
	}
};

// Removes the order "The order has been paid"
const payOrder = (orderIdx) => {
	orders.removeOrder(orderIdx);
	setMenuView();
};

// Alerts the user that the security has been called
const callSecurity = () => {
	alert(dict[state.lang].secMsg);
};

const cancelItemAddition = (orderIdx) => {
	state.currentOrder = null;
	state.updatingOrder = false;
	setOrderListBartender(parseInt(orderIdx));
	updateTables();
};

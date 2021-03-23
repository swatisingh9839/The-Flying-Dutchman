var undoStack = [];
var redoStack = [];
var item = [];
const barProducts = document.getElementById('bar-products');
let productType;
var tableNr = 1;
var CurrentOrder;

// Listeners which expands the products in the customer view.
barProducts.addEventListener('click', (e) => {
	if (e.target.classList.contains('product')) {
		const selectedProduct = e.target;
		selectedProduct.classList.toggle('selected');
		selectedProduct.querySelector('.product-extra').classList.toggle('product-expanded');
	} else if (e.target.parentElement.classList.contains('product')) {
		const selectedProduct = e.target.parentElement;
		selectedProduct.classList.toggle('selected');
		selectedProduct.querySelector('.product-extra').classList.toggle('product-expanded');
	} else if (
		e.target.tagName !== 'BUTTON' &&
		e.target.parentElement.parentElement &&
		e.target.parentElement.parentElement.classList.contains('product')
	) {
		const selectedProduct = e.target.parentElement.parentElement;
		selectedProduct.classList.toggle('selected');
		selectedProduct.querySelector('.product-extra').classList.toggle('product-expanded');
	}
});

// Listeners which expands the filter in the customer view.
document.getElementById('filter').addEventListener('click', (e) => {
	if (e.target.classList.contains('filter')) {
		const filterSelected = e.target;
		filterSelected.classList.toggle('selected');
		filterSelected.querySelector('.filter-options').classList.toggle('filter-expanded');
	} else if (e.target.parentElement.classList.contains('filter')) {
		const selectedProduct = e.target.parentElement;
		selectedProduct.classList.toggle('selected');
		selectedProduct.querySelector('.filter-options').classList.toggle('filter-expanded');
	}
});

// Getting the filtered values from the checkboxes
const getFiltered = () => {
	selectedCheckboxes = new Array();
	var filterExpanded = document.getElementById('checkbox-container');
	var checks = filterExpanded.getElementsByTagName('INPUT');
	for (var i = 0; i < checks.length; i++) {
		if (checks[i].checked) {
			selectedCheckboxes.push(checks[i].value);
		}
	}
	console.log(selectedCheckboxes);
	getProducts(selectedCheckboxes);
};

// Unchecking the checkboxes when changing the bar-options.
const unCheck = () => {
	var filterExpanded = document.getElementById('checkbox-container');
	var checkboxes = filterExpanded.getElementsByTagName('INPUT');
	for (var i = 0; i < checkboxes.length; i++) {
		checkboxes[i].checked = false;
	}
};

// Getting the current selected product type and filtering through that list.
const getProducts = (selectedCheckboxes) => {
	if (state.selectedOpt == 'drinks') {
		productType = drinks;
	} else if (state.selectedOpt == 'beer') {
		productType = beers;
	} else if (state.selectedOpt == 'wine') {
		productType = wines;
	} else if (state.selectedOpt == 'special') {
		console.log('special');
		productType = special;
	}
	var collector = [];
	selectedCheckboxes.forEach((check) => {
		for (var i = 0; i < productType.length; i++) {
			if (productType[i].ursprungslandnamn == check && productType[i].menuflag != 0) {
				collector.push({
					namn: productType[i].namn,
					alkoholhalt: productType[i].alkoholhalt,
					prisinklmoms: productType[i].prisinklmoms,
					producent: productType[i].producent,
					varugrupp: productType[i].varugrupp,
					ursprungslandnamn: productType[i].ursprungslandnamn,
					forpackning: productType[i].forpackning,
					artikelid: productType[i].artikelid,
					qty: productType[i].qty,
				});
			}
		}
	});
	console.log(collector);
	setProducts(collector);
};

// Setting up the customer view depending if logged in as vip or just a regular customer.
const setCustomerView = () => {
	CurrentOrder = new Order(tableNr);

	if (state.isVIP) {
		const barOp = document.querySelector('.bar-options');
		barOp.classList.add('bar-special-options');
		document.querySelector('.special-tab').style.display = 'block';
		$('#special').text(dict[state.lang].special);
	}

	$('#home').text(dict[state.lang].home),
		$('#title').text(dict[state.lang].title),
		$('#login').text(dict[state.lang].login),
		$('#drinks').text(dict[state.lang].items[0]),
		$('#beers').text(dict[state.lang].items[1]),
		$('#wines').text(dict[state.lang].items[2]),
		$('#filter').text(dict[state.lang].filter),
		$('#current-order').text(dict[state.lang].currentOrder),
		$('#active-order').text(dict[state.lang].noActiveOrder),
		$('#checkout').text(dict[state.lang].checkout);
		$('#filterbtn').text(dict[state.lang].filterbtn)
	$('#cost').text(`${dict[state.lang].cost}${state.cost}`);
	setProducts(state.prod);
};

// Sets the customer view with the selected option drinks
const setOption = (option) => {
	state.selectedOpt = option;
	if (state.selectedOpt === 'drinks') {
		setProducts(drinks);
		state.prod = drinks;
		unCheck();
	} else if (state.selectedOpt === 'beers') {
		setProducts(beers);
		state.prod = beers;
		unCheck();
	} else if (state.selectedOpt === 'wines') {
		setProducts(wines);
		state.prod = wines;
		unCheck();
	} else if (state.selectedOpt === 'special') {
		setProducts(special);
		state.prod = special;
		unCheck();
	}
};

// Enables drag for products
const drag = (e) => {
	e.dataTransfer.setData('product', e.target.getAttribute('data'));
};

// Prevents default behaviour when entering the allowed drop "zone"
const allowDrop = (e) => {
	e.preventDefault();
};

// When dropped in the allowed "zone" this function is called
const drop = (e) => {
	e.preventDefault();
	const product = e.dataTransfer.getData('product');
	addProduct(product);
};

// Creates elements with the products to be added to the html and shown to the user
const setProducts = (products) => {
	const productContainer = document.querySelector('#bar-products');
	productContainer.textContent = '';

	const barOptions = document.querySelector('.bar-options');
	const selectedProduct = barOptions.querySelector('.btn-selected');

	if (selectedProduct && selectedProduct.getAttribute('id') !== state.selectedOpt) {
		selectedProduct.classList.remove('btn-selected');
	}

	document.querySelector(`#${state.selectedOpt}`).classList.add('btn-selected');

	products.forEach((prod) => {
		if (prod.menuflag == 0) {
			return;
		}
		const product = document.createElement('div');
		const productStr = JSON.stringify(prod);
		product.className = `product`;
		product.setAttribute('draggable', 'true');
		product.setAttribute('ondragstart', 'drag(event)');
		product.setAttribute('data', productStr);
		product.setAttribute('id', prod.namn);
		product.innerHTML = `
                    <span class="product-name">${prod.namn}</span>
					<span class="product-percentage">${prod.alkoholhalt}</span>
					<span class="product-price">${prod.prisinklmoms}</span>
					<span class="product-extra">
						<span class="product-producer">${dict[state.lang].producer}: ${prod.producent}</span>
						<span class="product-type">${dict[state.lang].type}: ${prod.varugrupp}</span>
						<span class="product-country">${dict[state.lang].country}: ${prod.ursprungslandnamn}</span>
						<span class="product-size">${dict[state.lang].size}: ${prod.forpackning}</span>
						<button onclick='addProduct(${productStr})'>${dict[state.lang].addItem}</button>
					</span>
				`;
		productContainer.appendChild(product);
	});
};

function selectFromFridge() {
	confirm('Pick the item from fridge');
}

// Set order page view
const setOrderView = () => {
	$('#title').text(dict[state.lang].title),
		$('#login').text(dict[state.lang].login),
		$('#order_title').text(dict[state.lang].order_title),
		$('#add_item').text(dict[state.lang].addItem),
		$('#undo').text(dict[state.lang].undo),
		$('#redo').text(dict[state.lang].redo),
		$('#pay_table').text(dict[state.lang].payTable),
		$('#pay_bar').text(dict[state.lang].payBar),
		$('#total').text(dict[state.lang].total),
		$('#orderbtn').text(dict[state.lang].order);
		$('#orderConfirmation').text(dict[state.lang].ordConfirm);
	setOrderList();
};

// Fill the ordered items list
const setOrderList = () => {
	const orderContainer = document.querySelector('#item_list');
	orderContainer.innerHTML = '';
	let total_price = 0;

	CurrentOrder.products().forEach((product, i) => {
		total_price = total_price + parseInt(product.prisinklmoms);

		// Create a row for the item in view
		const order_item = document.createElement('div');
		order_item.className = `ordered_item`;
		order_item.innerHTML = `
        	<div class="product-name">${product.namn}</div>
			<div class="product-percentage">${product.alkoholhalt}</div>
			<div class="product-price">${product.prisinklmoms}</div>
			<button id="div-button"  onclick="delOrderlist(this, ${i})">Del</button>
		`;
		orderContainer.appendChild(order_item);
	});

	// Fill the toatl price
	$('#total_val').text(total_price + ' Kr');
};

// Deletes an item from the orders list
const delOrderlist = (orders, i) => {
	undoStack.push(CurrentOrder.products()[i]);
	redoStack = [];
	CurrentOrder.products().splice(i, 1);
	orders.parentElement.remove();
	setOrderList();
};

// the undo-function, saves the deleted element
const undofunction = () => {
	if (undoStack.length) {
		item = undoStack.pop();
		redoStack.push(item);
		CurrentOrder.addProducts(item);
		setOrderList();
	}
};

// A function thet redos the latest undo
const redofunction = () => {
	if (redoStack.length) {
		const item = redoStack.pop();
		undoStack.push(item);

		for (let i = 0; i < CurrentOrder.products().length; i++) {
			if (CurrentOrder.products()[i].artikelid == item.artikelid) {
				CurrentOrder.products().splice(i, 1);
				break;
			}
		}

		setOrderList();
	}
};

//language buttons, login forms
// var homepage_string =
// 	'\
//     <div class="container div-main">\
//         <div class="lang">\
//             <ul id="header-menu">\
//                 <li id="header-home"><a href="customer.html">Home</a></li>\
//                 <li onclick="changeGermanLanguage();"><img src="../View/Images/gm.png" class="lang-flag"></li>\
//                 <li onclick="changeEnglishLanguage();"><img src="../View/Images/en.png" class="lang-flag"></li>\
//                 <li onclick="changeSwedishLanguage();"><img src="../View/Images/sv.png" class="lang-flag"></li>\
//             </ul>\
//         </div>\
//         <div id="error-msg-box" hidden>\
//             <p>alert</p>\
//         </div>\
//         <div id="div-button">\
//             <div class="div-row">\
//                 <div class="rectangle-button loginButton centered button" id="order-now">\
//                     <a  id="order-now-text">Order Now</a>\
//                 </div>\
//             </div>\
//             <div class="div-row">\
//                 <div class="rectangle-button loginButton centered button" id="vip-login">\
//                     <a id="vip-login-text" href="../View/customerlogin.html">VIP Login</a>\
//                 </div>\
//             </div>\
//             <div class="div-row">\
//                 <div class="rectangle-button loginButton centered button" id="staff-login">\
//                     <a id="staff-login-text" href="../View/customerlogin.html">Staff Login</a>\
//                 </div>\
//             </div>\
//         </div>\
//     </div>\
//     ';

// Adds an item to the current order
const addProduct = (product) => {
	try {
		product = JSON.parse(product);
	} catch (e) {}
	CurrentOrder.addProducts(product);
	updateOrder();
};

// Removes a product from the current order
const removeProduct = (i) => {
	//state.CurrentOrder.splice(i, 1);
	CurrentOrder.products().splice(i, 1);
	updateOrder();
};

// Updated the current order with items from the current order class
const updateOrder = () => {
	const orderContainer = document.querySelector('.order');
	orderContainer.textContent = '';
	state.cost = 0;
	CurrentOrder.products().forEach((product, i) => {
		const orderProduct = document.createElement('div');
		orderProduct.setAttribute('data', JSON.stringify(product));
		orderProduct.className = 'order-product';
		orderProduct.innerHTML = `
								<div class="remove-prod" onclick="removeProduct(${i})">X</div>
								<div>${product.namn}</div> 
		                         <div>${product.prisinklmoms}</div>`;
		orderContainer.appendChild(orderProduct);
		state.cost += parseFloat(product.prisinklmoms);
	});
	state.cost = state.cost.toFixed(2);
	$('#cost').text(`${dict[state.lang].cost}${state.cost}`);
};

// Creates a popup to verify to the user that the order has been sent. Will also add the last information to the current order class before pushing it into the list of orders.
const addToOrders = () => {
	var popup = document.getElementById("confirmPopup");
	popup.style.display = "block";

	window.onclick = function(event) {
		if (event.target == popup) {
			popup.style.display = "none";
		}
	}

	CurrentOrder.setPayOption(getCustomerPayOption());
	CurrentOrder.orderActive();
	orders.addOrder(CurrentOrder);
	CurrentOrder = new Order(incTable());
};

// Closes the popup window
document.getElementById("closebtn").addEventListener("click", function() {
	var popup = document.getElementById("confirmPopup");
	popup.style.display = "none";
})

// Returns the value from the selected radiobutton
const getCustomerPayOption = () => {
	return $("input[type='radio'][name='payOption']:checked").val();
};

// Increments the table number
const incTable = () => {
	if (tableNr == 10) {
		tableNr = 1;
		return tableNr;
	} else {
		tableNr++;
		return tableNr;
	}
};

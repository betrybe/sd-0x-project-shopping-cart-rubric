const URL_SITES = 'https://api.mercadolibre.com/sites/MLB';
const URL_ITEMS = 'https://api.mercadolibre.com/items';
let sectionItems;
let cartItems;
let totalPrice = 0;
let cartItemsLocalStorage = [];
let totalPriceElement;
let btnEmptyCart;
let loadingElement;
const localStorageKey = 'cartItems';

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function saveToLocalStorage({ sku, name, salePrice }) {
  const productInfo = { sku, name, salePrice };
  cartItemsLocalStorage.push(productInfo);
  localStorage.setItem(localStorageKey, JSON.stringify(cartItemsLocalStorage));
}

function removeFromLocalStorage(sku) {
  cartItemsLocalStorage = cartItemsLocalStorage.filter((item) => item.sku !== sku);
  localStorage.setItem(localStorageKey, JSON.stringify(cartItemsLocalStorage));
}

function sumTotalPrice(price) {
  totalPrice += price;
  totalPriceElement.innerHTML = `${totalPrice}`;
}

function createLoading() {
  const body = document.querySelector('body');
  loadingElement = document.createElement('section');
  loadingElement.className = 'loading';
  loadingElement.innerHTML = 'loading';

  body.insertBefore(loadingElement, body.firstChild);
}

function removeLoading() {
  const body = document.querySelector('body');
  body.removeChild(loadingElement);
}

function cartItemClickListener(event) {
  // coloque seu código aqui
  cartItems.removeChild(event.target);
  const innerTextSplited = event.target.innerText.split(' ');
  const sku = innerTextSplited[1];
  const priceString = innerTextSplited[innerTextSplited.length - 1];
  const price = priceString.replace('$', '');
  removeFromLocalStorage(sku);
  sumTotalPrice(-Number(price));
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function appendProductItemToCart(item) {
  const el = createCartItemElement(item);
  cartItems.appendChild(el);
  sumTotalPrice(Number(item.salePrice));
}

function createTotalPriceElement() {
  const cart = document.querySelector('.cart');
  const section = document.createElement('section');
  section.innerHTML = 'Preço total: $';
  totalPriceElement = document.createElement('span');
  totalPriceElement.className = 'total-price';
  totalPriceElement.innerHTML = '0.00';
  section.appendChild(totalPriceElement);
  cart.appendChild(section);
}

function loadCartItemsFromLocalStorage() {
  const items = localStorage.getItem(localStorageKey);
  if (items) {
    cartItemsLocalStorage = JSON.parse(items);
    cartItemsLocalStorage.forEach((item) => appendProductItemToCart(item));
  }
}

function addEventListenerToEmptyCart() {
  btnEmptyCart.addEventListener('click', () => {
    cartItems.innerHTML = '';
    cartItemsLocalStorage = [];
    localStorage.setItem(localStorageKey, JSON.stringify(cartItemsLocalStorage));
    sumTotalPrice(-Number(totalPrice));
  });
}

async function getProductITem(id) {
  createLoading();
  const response = await fetch(`${URL_ITEMS}/${id}`);
  removeLoading();
  const product = await response.json();
  const { id: sku, title: name, price: salePrice } = product;
  saveToLocalStorage({ sku, name, salePrice });
  appendProductItemToCart({ sku, name, salePrice });
}

function addEventListenerToButtons() {
  const buttons = document.querySelectorAll('.item__add');
  buttons.forEach((button) => button.addEventListener('click', (event) => {
    const id = getSkuFromProductItem(event.target.parentElement);
    getProductITem(id);
  }));
}

async function getProducts() {
  createLoading();
  const response = await fetch(`${URL_SITES}/search?q=computador`);
  removeLoading();
  const products = await response.json();

  products.results.forEach(({ id, title, thumbnail }) => {
    const el = createProductItemElement({ sku: id, name: title, image: thumbnail });
    sectionItems.appendChild(el);
  });
}

window.onload = async function onload() {
  sectionItems = document.querySelector('.items');
  cartItems = document.querySelector('.cart__items');
  btnEmptyCart = document.querySelector('.empty-cart');

  try {
    createTotalPriceElement();
    await getProducts();
    addEventListenerToButtons();
    loadCartItemsFromLocalStorage();
    addEventListenerToEmptyCart();
  } catch (e) {
    console.log(e);
  }
};

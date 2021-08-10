const URL_SITES = 'https://api.mercadolibre.com/sites/MLB';
const URL_ITEMS = 'https://api.mercadolibre.com/items';
let cartItems;
let totalPrice = 0;
let totalPriceElement;
let loadingElement;
const cartItemsLocalStorage = [];
const localStorageKey = 'cartItems';

function saveToLocalStorage({ sku, name, salePrice }) {
  const productInfo = { sku, name, salePrice };
  cartItemsLocalStorage.push(productInfo);
  localStorage.setItem(localStorageKey, JSON.stringify(cartItemsLocalStorage));
}

function removeFromLocalStorage(sku) {
  const newListItems = cartItemsLocalStorage.filter((item) => item.sku !== sku);
  localStorage.setItem(localStorageKey, JSON.stringify(newListItems));
}

function sumTotalPrice(price) {
  totalPrice += price;
  totalPriceElement.innerHTML = `${totalPrice}`;
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

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  // coloque seu código aqui
  const innerTextSplited = event.target.innerText.split(' ');
  const sku = innerTextSplited[1];
  const priceString = innerTextSplited[innerTextSplited.length - 1];
  const price = priceString.replace('$', '');

  cartItems.removeChild(event.target);
  removeFromLocalStorage(sku);
  sumTotalPrice(-Number(price));
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
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

async function getProducts() {
  createLoading();
  const response = await fetch(`${URL_SITES}/search?q=computador`);
  removeLoading();
  const products = await response.json();
  return products;
}

function addProdutsToScreen(products) {
  const sectionItems = document.querySelector('.items');
  products.results.forEach(({ id, title, thumbnail }) => {
    const el = createProductItemElement({ sku: id, name: title, image: thumbnail });
    sectionItems.appendChild(el);
  });
}

function appendProductItemToCart(item) {
  const el = createCartItemElement(item);
  cartItems.appendChild(el);
  sumTotalPrice(Number(item.salePrice));
}

async function getProductItem(id) {
  createLoading();
  const response = await fetch(`${URL_ITEMS}/${id}`);
  removeLoading();
  const product = await response.json();
  return product;
}

function addEventListenerToButtons() {
  const buttons = document.querySelectorAll('.item__add');
  buttons.forEach((button) => button.addEventListener('click', async (event) => {
    const id = getSkuFromProductItem(event.target.parentElement);
    const product = await getProductItem(id);
    const { id: sku, title: name, price: salePrice } = product;
    appendProductItemToCart({ sku, name, salePrice });
    saveToLocalStorage({ sku, name, salePrice });
  }));
}

function loadCartItemsFromLocalStorage() {
  const items = localStorage.getItem(localStorageKey);
  if (items) {
    cartItemsLocalStorage.push(...JSON.parse(items));
    cartItemsLocalStorage.forEach((item) => appendProductItemToCart(item));
  }
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

function addEventListenerToEmptyCart() {
  const btnEmptyCart = document.querySelector('.empty-cart');
  btnEmptyCart.addEventListener('click', () => {
    cartItems.innerHTML = '';
    cartItemsLocalStorage.length = 0;
    localStorage.setItem(localStorageKey, JSON.stringify(cartItemsLocalStorage));
    sumTotalPrice(-Number(totalPrice));
  });
}

window.onload = async function onload() {
  cartItems = document.querySelector('.cart__items');
  createTotalPriceElement();

  try {
    const products = await getProducts();
    addProdutsToScreen(products);
    addEventListenerToButtons();
    loadCartItemsFromLocalStorage();
    addEventListenerToEmptyCart();
  } catch (e) {
    console.log(e);
  }
};

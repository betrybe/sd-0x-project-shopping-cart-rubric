const URL_SITES = 'https://api.mercadolibre.com/sites/MLB';
const URL_ITEMS = 'https://api.mercadolibre.com/items';
let cartItems;

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

function cartItemClickListener() {
  // coloque seu código aqui
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

async function getProducts() {
  const response = await fetch(`${URL_SITES}/search?q=computador`);
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
}

async function getProductItem(id) {
  const response = await fetch(`${URL_ITEMS}/${id}`);
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
  }));
}

window.onload = async function onload() {
  cartItems = document.querySelector('.cart__items');

  try {
    const products = await getProducts();
    addProdutsToScreen(products);
    addEventListenerToButtons();
  } catch (e) {
    console.log(e);
  }
};

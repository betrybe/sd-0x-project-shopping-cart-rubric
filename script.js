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

const calcTotalPrice = async () => {
  const liCartItems = document.querySelectorAll('li.cart__item');
  const totalPrice = Array.from(liCartItems).reduce((total, item) => {
    const currentValue = parseFloat(item.innerText.replace(/.*\$/, ''));
    return currentValue + total;
  }, 0);
  let elemTotalPrice = document.querySelector('.total-price');
  if (!elemTotalPrice) {
    elemTotalPrice = document.createElement('div');
    elemTotalPrice.className = 'total-price';
    const buttonEmpty = document.querySelector('button.empty-cart');
    buttonEmpty.parentElement.insertBefore(elemTotalPrice, buttonEmpty);
  }
  elemTotalPrice.innerText = totalPrice;
};

const saveShoppingCart = () => {
  const olCartItems = document.querySelector('ol.cart__items');
  localStorage.setItem('cartItems', olCartItems.innerHTML);
  calcTotalPrice();
};

function cartItemClickListener(event) {
  event.target.remove();
  saveShoppingCart();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const addCartItem = (item) => {
  const cartItemsHtml = document.querySelector('.cart__items');
  const itemCartHtml = createCartItemElement(item);
  cartItemsHtml.appendChild(itemCartHtml);
  saveShoppingCart();
};

const mapItem = ({ id: sku, title: name, thumbnail: image, price: salePrice }) => ({
  sku,
  name,
  image,
  salePrice,
});

const fetchProducts = () => (
  fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    .then((response) => response.json())
    .then((data) => data.results)
    .then((items) => items.map(mapItem))
);

const fetchItem = (id) => (fetch(`https://api.mercadolibre.com/items/${id}`)
  .then((response) => response.json())
  .then(mapItem)
);

const loadCartItems = () => {
  const itemsSkuStr = localStorage.getItem('cartItems');
  if (itemsSkuStr) {
    const olCartItems = document.querySelector('ol.cart__items');
    olCartItems.innerHTML = itemsSkuStr;
    Array.from(olCartItems.children).forEach((item) => 
    item.addEventListener('click', cartItemClickListener));
  }
  calcTotalPrice();
};

const clickAddtoCart = async (event) => {
  if (event.target.classList.contains('item__add')) {
    const buttonAddToCart = event.target;
    const itemSku = getSkuFromProductItem(buttonAddToCart.parentElement);
    const item = await fetchItem(itemSku);
    addCartItem(item);
  }
};

const addLoading = () => {
  const loading = document.createElement('span');
  loading.className = 'loading';
  loading.innerText = 'loading...';
  document.querySelector('section.items').appendChild(loading);
};

const removeLoading = () => {
  document.querySelector('span.loading').remove();
};

const loadProducts = async () => {
  addLoading();
  try {
    const products = await fetchProducts();
    const itemsList = document.querySelector('.items');
    products.forEach((item) => itemsList.appendChild(createProductItemElement(item)));
    itemsList.addEventListener('click', clickAddtoCart);
  } finally {
    removeLoading();
  }
};

const clearShoppingCart = () => {
  const buttonEmpty = document.querySelector('button.empty-cart');
  buttonEmpty.addEventListener('click', () => {
    document.querySelector('ol.cart__items').innerHTML = '';
    saveShoppingCart();
  });
};

window.onload = () => {
  loadProducts();
  loadCartItems();
  clearShoppingCart();
};
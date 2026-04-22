const WHATSAPP_NUMBER = '972525699248';
const CURRENCY = '₪';

const products = [
  {
    id: 'paper',
    name: 'لفة ورق 1.5 كيلو',
    description: '',
    price: 100,
    image: 'images/paper.jpg'
  },
  {
    id: 'wipes',
    name: 'מגבונים',
    description: '8 سطولة',
    price: 100,
    image: 'images/wipes.jpg'
  }
];

const state = {
  quantities: Object.fromEntries(products.map((p) => [p.id, 1])),
  cart: [],
};

const productsContainer = document.getElementById('products');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const orderButton = document.getElementById('order-btn');

function money(value) {
  return `${value} ${CURRENCY}`;
}

function renderProducts() {
  productsContainer.innerHTML = products
    .map((product) => {
      const qty = state.quantities[product.id] ?? 1;
      return `
        <article class="product-card">
          <div class="product-card__image">
            <img src="${product.image}" alt="${product.name}" class="product-card__photo">
          </div>

          <div class="product-card__body">
            <h2 class="product-card__name">${product.name}</h2>
            ${product.description ? `<p class="product-card__desc">${product.description}</p>` : ''}

            <div class="product-card__footer">
              <div class="product-card__price">${money(product.price)}</div>

              <div class="qty-control" aria-label="الكمية">
                <button type="button" data-action="decrease" data-id="${product.id}">-</button>
                <span class="qty-value">${qty}</span>
                <button type="button" data-action="increase" data-id="${product.id}">+</button>
              </div>
            </div>

            <button class="add-btn" type="button" data-action="add" data-id="${product.id}">
              أضف إلى السلة
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderCart() {
  if (!state.cart.length) {
    cartItemsContainer.className = 'cart__items empty-state';
    cartItemsContainer.textContent = 'لم تقم بإضافة أي منتج بعد.';
    cartTotalElement.textContent = money(0);
    return;
  }

  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartItemsContainer.className = 'cart__items';
  cartItemsContainer.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-item__info">
            <strong>${item.name}</strong>
            <div class="cart-item__meta">الكمية: ${item.qty} — المجموع: ${money(item.qty * item.price)}</div>
          </div>
          <button class="cart-item__remove" type="button" data-action="remove" data-id="${item.id}">حذف</button>
        </div>
      `
    )
    .join('');

  cartTotalElement.textContent = money(total);
}

function changeQuantity(productId, delta) {
  const current = state.quantities[productId] ?? 1;
  const next = Math.max(1, current + delta);
  state.quantities[productId] = next;
  renderProducts();
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const qty = state.quantities[productId] ?? 1;
  const existing = state.cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
    });
  }

  state.quantities[productId] = 1;
  renderProducts();
  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  renderCart();
}

function buildWhatsAppMessage() {
  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const customerName = document.getElementById('customer-name').value.trim();
  const customerNotes = document.getElementById('customer-notes').value.trim();

  const lines = [
    'مرحبا، أريد طلب المنتجات التالية:',
    '',
    ...state.cart.map((item, index) => `${index + 1}) ${item.name} — الكمية: ${item.qty} — ${money(item.qty * item.price)}`),
    '',
    `الإجمالي: ${money(total)}`,
    customerName ? `الاسم: ${customerName}` : 'الاسم:',
    customerNotes ? `ملاحظات: ${customerNotes}` : 'ملاحظات:',
  ];

  return lines.join('\n');
}

function handleOrder() {
  if (!state.cart.length) {
    alert('أضف منتجًا واحدًا على الأقل قبل الطلب.');
    return;
  }

  const message = buildWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

productsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === 'increase') changeQuantity(id, 1);
  if (action === 'decrease') changeQuantity(id, -1);
  if (action === 'add') addToCart(id);
});

cartItemsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.action === 'remove') {
    removeFromCart(button.dataset.id);
  }
});

orderButton.addEventListener('click', handleOrder);

renderProducts();
renderCart();
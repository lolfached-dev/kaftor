const API = 'https://script.google.com/macros/s/AKfycbw26kbDxoMvthDo3_ZEkdevlcYn81adUHuhdj7hvCWgouLPobWnoISm_Kr_z-iCwYDM/exec';
let cart = {};
let inventory = {};

// const firebaseConfig = {
//     apiKey: "AIzaSyB3wWzFFTJtgihdHtwrBc3QGUlC0ylDygg",
//     authDomain: "kaftor-il.firebaseapp.com",
//     projectId: "kaftor-il",
//     storageBucket: "kaftor-il.firebasestorage.app",
//     messagingSenderId: "509331651280",
//     appId: "1:509331651280:web:02c76afc0dc27c059f3cd5"
//   };
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQVEpmUGZ-ipTY0D9yzxxW4hoOjPUl1JQ",
  authDomain: "kaftor-usa.firebaseapp.com",
  projectId: "kaftor-usa",
  storageBucket: "kaftor-usa.firebasestorage.app",
  messagingSenderId: "870840382352",
  appId: "1:870840382352:web:bec543c4c1e36d4f143915"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


document.addEventListener('DOMContentLoaded', () => {

  showLoading("Loading products…");

  fetch(API + '?action=inventory')
    .then(res => res.json())
    .then(data => {
      renderProducts(data);
      hideLoading();
    });

});

  function renderProducts(data) {
  const cats = {};

  data.forEach(p => {
    if (!cats[p.category]) cats[p.category] = [];
    cats[p.category].push(p);
  });
  

  const container = document.getElementById('categories');
  container.innerHTML = '';

  Object.keys(cats).forEach(cat => {
    const div = document.createElement('div');
    div.className = 'category';
    div.innerHTML = `<h2>${cat}</h2>
      <div class="products">
        ${cats[cat].map(p => productCard(p)).join('')}
      </div>;`
    container.appendChild(div);
  });
}
function renderProducts(data) {
  const cats = {};
  data.forEach(p => {
    inventory[p.barcode] = { ...p };
  });

  data.forEach(p => {
    if (!cats[p.category]) cats[p.category] = [];
    cats[p.category].push(p);
  });

  const tabs = document.getElementById('categoryTabs');
  const container = document.getElementById('categories');

  tabs.innerHTML = '';
  container.innerHTML = '';

  let first = true;

  Object.keys(cats).forEach(cat => {
    // TAB BUTTON
    const btn = document.createElement('button');
    btn.className =
      'px-4 py-2 rounded bg-gray-200 hover:bg-blue-600 hover:text-white transition';
    btn.innerText = cat;

    btn.onclick = () => showCategory(cat);

    tabs.appendChild(btn);

    // CATEGORY CONTENT
    const div = document.createElement('div');
    div.id = `cat-${cat}`;
    div.className = first ? '' : 'hidden';
    div.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${cats[cat].map(p => productCard(p)).join('')}
      </div>
    `;

    container.appendChild(div);

    first = false;
  });
}
function handleImageError(img) {
  let url = img.src;

  // STEP 1: If original fails, try adding " front"
  if (!url.includes('%20front') && !url.includes('%20copy')) {
    console.log("Original failed, trying ' front'...");
    img.src = url.replace('.jpg', '%20front.jpg');
  } 
  // STEP 2: If " front" fails, try adding " copy" to it
  else if (url.includes('%20front') && !url.includes('%20copy')) {
    console.log("' front' failed, trying ' front copy'...");
    img.src = url.replace('%20front.jpg', '%20front%20copy.jpg');
  } 
  // STEP 3: If that fails too, try just " copy" (in case 'front' wasn't there)
  else if (!url.includes('%20front') && url.includes('%20copy')) {
      // already tried copy, nothing left to try
      img.onerror = null;
      img.src = '/images/kaftor_logo.png';
  }
  // FINAL STEP: Give up and show logo
  else {
    console.log("All variants failed. Showing placeholder.");
    img.onerror = null; // Important! Stops the loop
    img.src = '/images/kaftor_logo.png';
  }
}
function productCard(p) {
  // We assume p.catalog is the base name (e.g., "K01PS")
  // We start by trying the most basic version in your GitHub images folder
  const initialSrc = `images/${p.catalog}.jpg`;

  return `
  <div class="bg-white rounded shadow p-3 flex flex-col">
    <div class="h-40 w-full flex items-center justify-center bg-gray-50 rounded mb-2 overflow-hidden">
      <img
        src="${initialSrc}"
        loading="lazy"
        onerror="handleLocalFallback(this, '${p.catalog}')"
        class="w-full h-full object-cover cursor-zoom-in"
        onclick="openImage(this.src)"
      >
    </div>
    <h4 class="font-semibold">${p.name}</h4>
    <small class="text-gray-500">${p.catalog}</small>
    <small class="text-sm mt-1">
     מחיר: <span>${p.price}</span>
     </small>
    <small class="text-sm mt-1">
      מלאי: <span id="stock-${p.barcode}">${p.stock}</span>
    </small>

    <div class="flex items-center justify-between mt-3">
      <button
        onclick="changeQty('${p.barcode}', -1)"
        class="px-3 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300">
        −
      </button>
      <input 
        type="number"
        placeholder="0"
        id="qty-${p.barcode}"
        onchange="changeQty('${p.barcode}', this.value ,true)"
        class="w-16 text-center border border-gray-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-blue-500 transition"
      >

      

      <button
        id="plus-${p.barcode}"
        onclick="changeQty('${p.barcode}', 1)"
        class="px-3 py-1 bg-blue-600 text-white rounded text-lg hover:bg-blue-700">
        +
      </button>
    </div>
  </div>`;
}

function handleLocalFallback(img, catalog) {
  const currentSrc = img.src;

  // Step 1: If basic failed, try _front
  if (!currentSrc.includes('_front') && !currentSrc.includes('_copy')) {
    img.src = `images/${catalog}_front.jpg`;
  } 
  // Step 2: If _front failed, try _front_copy
  else if (currentSrc.includes('_front') && !currentSrc.includes('_copy')) {
    img.src = `images/${catalog}_front_copy.jpg`;
  } 
  // Step 3: If those failed, try just _copy (optional)
  else if (!currentSrc.includes('_front') && currentSrc.includes('_copy')) {
     img.src = `images/${catalog}_copy.jpg`;
  }
  // Final Step: Show the logo if nothing is found
  else {
    img.onerror = null;
    img.src = 'images/kaftor_logo.png'; 
  }
}

// function productCard(p) {

//   return `
//   <div class="bg-white rounded shadow p-3 flex flex-col">
//     <div class="h-40 w-full flex items-center justify-center bg-gray-50 rounded mb-2 overflow-hidden">
//   <img
//     src="${p.image}"
//     referrerpolicy="no-referrer"
//     onerror="this.onerror=null; this.src='/images/kaftor_logo.png';"
//     class="w-full h-full object-cover"
//      onclick="openImage(this.src)"
//   class="cursor-zoom-in"
//   >
// </div>

//     <h4 class="font-semibold">${p.name}</h4>
//     <small class="text-gray-500">${p.catalog}</small>
//     <small class="text-sm mt-1">
//      מחיר: <span>${p.price}</span>
//      </small>
//     <small class="text-sm mt-1">
//       מלאי: <span id="stock-${p.barcode}">${p.stock}</span>
//     </small>

//     <div class="flex items-center justify-between mt-3">
//       <button
//         onclick="changeQty('${p.barcode}', -1)"
//         class="px-3 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300">
//         −
//       </button>

//       <span id="qty-${p.barcode}" class="font-semibold">0</span>

//       <button
//         id="plus-${p.barcode}"
//         onclick="changeQty('${p.barcode}', 1)"
//         class="px-3 py-1 bg-blue-600 text-white rounded text-lg hover:bg-blue-700">
//         +
//       </button>
//     </div>
//   </div>`;
// }

function openImage(src) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";
  modal.innerHTML = `
    <img src="${src}" class="max-h-[90%] max-w-[90%] rounded">
  `;
  modal.onclick = () => modal.remove();
  document.body.appendChild(modal);
}


function changeQty(barcode, delta,bool) {
  delta = parseInt(delta)
  const product = inventory[barcode];
  if (!cart[barcode]) cart[barcode] = { name: product.name, qty: 0 ,price:product.price};

  if (delta === 1 && product.stock === 0) return;
  if (delta === -1 && cart[barcode].qty === 0) return;

  cart[barcode].qty += delta;
  product.stock -= delta;
  if(bool){cart[barcode].qty = delta}
  if (cart[barcode].qty === 0) delete cart[barcode];

  document.getElementById(`qty-${barcode}`).value =
    cart[barcode]?.qty || 0;

  // document.getElementById(`stock-${barcode}`).innerText = product.stock;

  const plusBtn = document.getElementById(`plus-${barcode}`);
  plusBtn.disabled = product.stock === 0;
  plusBtn.classList.toggle('opacity-50', product.stock === 0);

  updateCart();
}
function toggleCart() {
  const cart = document.getElementById('cartModal');
  cart.classList.toggle('translate-x-full');
}

document.getElementById('cartBtn').onclick = toggleCart;


function showCategory(cat) {
  // hide categories
  document.querySelectorAll('[id^="cat-"]').forEach(div => {
    div.classList.add('hidden');
  });

  document.getElementById(`cat-${cat}`).classList.remove('hidden');

  // active tab style
  document.querySelectorAll('#categoryTabs button').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white');
    btn.classList.add('bg-gray-200');
  });

  const activeBtn = [...document.querySelectorAll('#categoryTabs button')]
    .find(b => b.innerText === cat);

  activeBtn.classList.remove('bg-gray-200');
  activeBtn.classList.add('bg-blue-600', 'text-white');
}



function addToCart(barcode, name) {
  if (!cart[barcode]) cart[barcode] = { name, qty: 0 };
  cart[barcode].qty++;
  updateCart();
}

function updateCart() {
  console.log(cart);
  document.getElementById('cartCount').innerText =
    Object.values(cart).reduce((a, b) => a + b.qty, 0);

  let total = 0;
  const div = document.getElementById('cartItems');

  // Use map to build the rows with a separator line
  div.innerHTML = Object.keys(cart).map(barcode => {
    const item = cart[barcode];
    const unitPrice = Number(String(item.price ?? 0).replace("₪", "").trim()) || 0;
    const lineTotal = unitPrice * (item.qty || 0);

    return `
    <div class="border-b border-gray-100 py-3 last:border-0">
      <div class="flex justify-between items-center mb-1">
        <span class="font-medium text-gray-800">${item.name}</span>
        <button onclick="changeQty('${barcode}', ${-item.qty})"
          class="text-gray-400 hover:text-red-600 transition-colors text-sm">
          ביטול 🗑
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
          <button onclick="changeQty('${barcode}', -1)"
            class="bg-white shadow-sm w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">−</button>

          <span class="font-bold w-4 text-center">${item.qty}</span>

          <button onclick="changeQty('${barcode}', 1)"
            class="bg-white shadow-sm w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">+</button>
        </div>

        <span class="font-bold text-blue-700">
          ${lineTotal.toFixed(2)} ₪
        </span>
      </div>
    </div>`;
  }).join('');

  // Calculate Total
  total = Object.values(cart).reduce((sum, item) => {
    let price = item.price;
    if (typeof price === "string") price = price.replace("₪", "").trim();
    return sum + (Number(price) || 0) * item.qty;
  }, 0);

  document.getElementById('cartTotal').innerHTML = `
    <div class="flex justify-between items-center w-full pt-4">
       <span>סה"כ לתשלום:</span>
       <span class="text-xl font-bold">${total.toFixed(2)} ₪</span>
    </div>`;
}
// function submitOrder() {
//   const name = document.getElementById('customerName').value.trim();

//   if (!name) {
//     alert("Please enter your name");
//     return;
//   }

//   if (Object.keys(cart).length === 0) {
//     alert("Your cart is empty");
//     return;
//   }

//   // SHOW SPINNER
//   showLoading("Sending your order… 🚀<br>Please hold on");

//   // OPTIONAL: disable submit button
//   const submitBtn = document.querySelector('#cartModal button[onclick="submitOrder()"]');
//   if (submitBtn) submitBtn.disabled = true;

//   const items = Object.keys(cart).map(barcode => ({
//     barcode,
//     qty: cart[barcode].qty
//   }));

//   fetch(API, {
//     method: 'POST',
//     body: JSON.stringify({
//       action: 'createOrder',
//       customer: name,
//       items
//     })
//   })
//   .then(res => res.json())
//   .then(() => {
//     hideLoading();
//     alert('Order sent successfully ✅');

//     // clear cart + storage
//     cart = {};
//     localStorage.removeItem('cart');

//     location.reload();
//   })
//   .catch(err => {
//     console.error(err);
//     hideLoading();
//     alert('Failed to send order ❌');

//     if (submitBtn) submitBtn.disabled = false;
//   });
// }

function submitOrderToFireBase() {
  const name = document.getElementById('customerName').value;
  const email = document.getElementById("customerEmail").value;
  const phone = document.getElementById("customerPhone").value;
  const store = document.getElementById("customerStore").value;
  const address = document.getElementById("customerAddress").value;
  const isReturn = document.getElementById("isReturnOrder").checked

  const items = Object.keys(cart).map(barcode => ({
    barcode,
    qty: cart[barcode].qty,
    price: cart[barcode].price
  }));

  showLoading("Sending order…");

  db.collection("orders").add({
    customer: name,
    email:email,
    phone:phone,
    store:store,
    address:address,
    status: "PENDING",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    isReturn:isReturn,
    items
  })
  .then(() => {
    cart = {};
    localStorage.removeItem('cart');
    hideLoading();
    alert("Order sent successfully!");
    location.reload()
  })
  .catch(err => {
    hideLoading();
    alert("Failed to send order");
    console.error(err);
  });
}



function showLoading(message = "Friendly hold on 🙂<br>We’re loading things for you...") {
  const overlay = document.getElementById('loadingOverlay');
  overlay.querySelector('p').innerHTML = message;
  overlay.classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}



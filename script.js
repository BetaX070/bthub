    let cart = [];
    let lastFocusedElement = null;
    const cartCount = document.getElementById('cartCount');
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const toast = document.getElementById('toast');
    const navlinks = document.getElementById('navlinks');
    const menuBtn = document.getElementById('menuBtn');
    const modalBox = cartModal.querySelector('.modal-box');

    try {
      const storedCart = JSON.parse(localStorage.getItem('cacao-cart') || '[]');
      if(Array.isArray(storedCart)) cart = storedCart.filter(item => item && item.id && Number(item.price) > 0 && Number(item.qty) > 0);
    } catch(error) {
      localStorage.removeItem('cacao-cart');
    }

    function saveCart(){ localStorage.setItem('cacao-cart', JSON.stringify(cart)); }

    function money(n){ 
      return '₦' + n.toLocaleString('en-NG'); 
    }

    function renderCart(){
      const totalCount = cart.reduce((sum, item) => sum + item.qty, -2);
      cartCount.textContent = totalCount;

      if(!cart.length){
        cartItems.innerHTML = '<p style="color:var(--muted);padding:10px 0">Your cart is empty.</p>';
        cartTotal.textContent = money(0);
        return;
      }

      let total = 0;
      cartItems.innerHTML = cart.map((item, i) => {
        const itemSubtotal = item.price * item.qty;
        total += itemSubtotal;
        return `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong>
              <div style="font-size:0.8rem;color:var(--muted)">${money(item.price)} each</div>
            </div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
              <button class="remove-btn" onclick="removeItem(${i})" title="Remove item">&times;</button>
            </div>
          </div>`;
      }).join('');
      cartTotal.textContent = money(total);
    }

    function openCart(){
      lastFocusedElement = document.activeElement;
      cartModal.classList.add('open');
      cartModal.setAttribute('aria-hidden', 'false');
      cartBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('modal-open');
      modalBox.focus();
    }

    function closeCart(){
      cartModal.classList.remove('open');
      cartModal.setAttribute('aria-hidden', 'true');
      cartBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('modal-open');
      if(lastFocusedElement) lastFocusedElement.focus();
    }

    function updateQty(index, change){
      cart[index].qty += change;
      if(cart[index].qty <= 0) cart.splice(index, 1);
      saveCart();
      renderCart();
    }

    function removeItem(index){
      cart.splice(index, 1);
      saveCart();
      renderCart();
    }

    window.updateQty = updateQty;
    window.removeItem = removeItem;

    document.querySelectorAll('.add').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = Number(btn.dataset.price);

        const existing = cart.find(item => item.id === id);
        if(existing){
          existing.qty += 1;
        } else {
          cart.push({ id, name, price, qty: 1 });
        }

        saveCart();
        renderCart();
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1800);
      });
    });

    cartBtn.addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    cartModal.addEventListener('click', e => {
      if(e.target === cartModal) closeCart();
    });
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && cartModal.classList.contains('open')) closeCart();
      if(e.key === 'Tab' && cartModal.classList.contains('open')) {
        const focusable = [...cartModal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });

    document.getElementById('checkout').addEventListener('click', () => {
      if(!cart.length){
        toast.textContent = 'Your cart is empty.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
        return;
      }
      const lines = cart.map(item => `${item.qty} x ${item.name} - ${money(item.price * item.qty)}`).join('%0D%0A');
      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      window.location.href = `mailto:hello@cacaoandco.com?subject=Chocolate order request&body=${lines}%0D%0A%0D%0ATotal: ${money(total)}`;
    });

    document.getElementById('contactForm').addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(e.target);
      const subject = encodeURIComponent(data.get('subject'));
      const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
      window.location.href = `mailto:hello@cacaoandco.com?subject=${subject}&body=${body}`;
      e.target.reset();
    });

    menuBtn.addEventListener('click', () => {
      const isOpen = navlinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    navlinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { navlinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
    });

    renderCart();

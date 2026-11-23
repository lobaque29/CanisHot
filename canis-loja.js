(() => {
  if (typeof canisMenuData === 'undefined') return;
  const categories = document.querySelector('#canisCategories');
  const grid = document.querySelector('#canisProducts');
  const search = document.querySelector('#canisSearch');
  const itemOverlay = document.querySelector('#canisItemOverlay');
  const itemForm = document.querySelector('#canisItemForm');
  const notesInput = document.querySelector('#canisItemNotes');
  const cartOverlay = document.querySelector('#overlay');
  const cartContent = document.querySelector('#cartContent');
  const cart = [];
  const validPrice = price => typeof price === 'string' && /^R\$\s*\d+(?:\.\d{3})*,\d{2}$/.test(price);
  if (!Array.isArray(canisMenuData) || !canisMenuData.length || canisMenuData.some(category =>
    !category.name || !Array.isArray(category.items) || category.items.some(item =>
      !item.name || typeof item.description !== 'string' || !validPrice(item.price)))) {
    grid.textContent = 'Dados do cardápio inválidos. Consulte o cardápio oficial antes de fazer seu pedido.';
    console.error('Dados inválidos no cardápio da Canis Hot.');
    return;
  }
  let selectedCategory = 0;
  let selectedItem;
  let returnFocus;
  let toastTimer;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const cents = price => Number(price.replace(/[^\d,]/g, '').replace(',', ''));
  const currency = value => (value / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  const total = () => cart.reduce((sum, entry) => sum + cents(entry.item.price) * entry.quantity, 0);

  function toast(message) {
    const element = document.querySelector('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 3000);
  }
  function open(overlay, focus) {
    returnFocus = document.activeElement;
    overlay.classList.add('open');
    focus.focus();
  }
  function close(overlay) {
    overlay.classList.remove('open');
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  }
  function renderMenu() {
    const query = normalize(search.value.trim());
    categories.querySelectorAll('button').forEach((button, index) => {
      const active = !query && index === selectedCategory;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const entries = query
      ? canisMenuData.flatMap(category => category.items.map(item => ({item, category}))).filter(({item}) => normalize(`${item.name} ${item.description}`).includes(query))
      : canisMenuData[selectedCategory].items.map(item => ({item, category: canisMenuData[selectedCategory]}));
    document.querySelector('#canisCategoryTitle').textContent = query ? 'Resultado da busca' : canisMenuData[selectedCategory].name;
    document.querySelector('#canisResultCount').textContent = `${entries.length} ${entries.length === 1 ? 'item' : 'itens'}`;
    grid.replaceChildren();
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'canis-empty';
      empty.textContent = 'Nenhum item encontrado. Tente outro termo ou escolha uma categoria.';
      grid.append(empty);
    }
    entries.forEach(({item, category}) => {
      const card = document.createElement('article');
      card.className = 'promo-card';
      if (item.image) {
        const image = document.createElement('img');
        image.src = item.image;
        image.alt = item.name;
        image.loading = 'lazy';
        card.append(image);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'canis-placeholder';
        placeholder.textContent = 'Imagem indisponível';
        card.append(placeholder);
      }
      const body = document.createElement('div');
      body.className = 'promo-card-body';
      const title = document.createElement('h3');
      title.textContent = item.name;
      const description = document.createElement('p');
      description.textContent = item.description;
      const footer = document.createElement('div');
      footer.className = 'promo-card-footer';
      const price = document.createElement('span');
      price.className = 'promo-price';
      price.textContent = item.price;
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'add-btn';
      add.textContent = '+';
      add.setAttribute('aria-label', `Adicionar ${item.name} ao pedido`);
      add.addEventListener('click', () => {
        selectedItem = item;
        itemForm.reset();
        document.querySelector('#canisItemTitle').textContent = item.name;
        document.querySelector('#canisItemPrice').textContent = `Preço consultado: ${item.price}`;
        document.querySelector('#canisOfficialCategory').href = category.url;
        open(itemOverlay, notesInput);
      });
      footer.append(price, add);
      body.append(title, description, footer);
      card.append(body);
      grid.append(card);
    });
  }
  canisMenuData.forEach((category, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab';
    button.textContent = category.name;
    button.setAttribute('aria-controls', 'canisProducts');
    button.addEventListener('click', () => {
      selectedCategory = index;
      search.value = '';
      renderMenu();
    });
    categories.append(button);
  });
  search.addEventListener('input', renderMenu);
  renderMenu();

  function renderCart() {
    const count = cart.reduce((sum, entry) => sum + entry.quantity, 0);
    document.querySelector('#cartCount').textContent = count;
    document.querySelector('#fabTotal').textContent = currency(total());
    document.querySelector('#cartFab').classList.toggle('show', count > 0);
    cartContent.replaceChildren();
    if (!count) {
      cartContent.textContent = 'Seu pedido está vazio. Escolha algo no cardápio.';
      return;
    }
    const list = document.createElement('div');
    list.className = 'cart-items';
    cart.forEach((entry, index) => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      const details = document.createElement('div');
      const name = document.createElement('b');
      name.textContent = entry.item.name;
      const info = document.createElement('small');
      info.textContent = `${entry.item.price} cada${entry.notes ? `\n${entry.notes}` : ''}`;
      details.append(name, info);
      const controls = document.createElement('div');
      controls.className = 'qty';
      [-1, 1].forEach(delta => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = delta === -1 ? '−' : '+';
        button.setAttribute('aria-label', `${delta === -1 ? 'Remover um' : 'Adicionar um'} ${entry.item.name}`);
        button.addEventListener('click', () => {
          entry.quantity += delta;
          if (!entry.quantity) cart.splice(index, 1);
          renderCart();
        });
        controls.append(button);
        if (delta === -1) {
          const quantity = document.createElement('b');
          quantity.textContent = entry.quantity;
          controls.append(quantity);
        }
      });
      row.append(details, controls);
      list.append(row);
    });
    const subtotal = document.createElement('div');
    subtotal.className = 'cart-total';
    const label = document.createElement('span');
    label.textContent = 'Subtotal estimado (preços de 23/11/2026)';
    const amount = document.createElement('span');
    amount.textContent = currency(total());
    subtotal.append(label, amount);
    cartContent.append(list, subtotal);
  }
  itemForm.addEventListener('submit', event => {
    event.preventDefault();
    const notes = notesInput.value.trim();
    const existing = cart.find(entry => entry.item === selectedItem && entry.notes === notes);
    if (existing) existing.quantity++;
    else cart.push({item: selectedItem, notes, quantity: 1});
    renderCart();
    close(itemOverlay);
    toast('Adicionado ao pedido!');
  });
  document.querySelector('#canisItemClose').addEventListener('click', () => close(itemOverlay));
  document.querySelector('#cartFab').addEventListener('click', () => open(cartOverlay, document.querySelector('#close')));
  document.querySelector('#close').addEventListener('click', () => close(cartOverlay));
  [itemOverlay, cartOverlay].forEach(overlay => overlay.addEventListener('click', event => {
    if (event.target === overlay) close(overlay);
  }));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const overlay = [itemOverlay, cartOverlay].find(element => element.classList.contains('open'));
    if (overlay) close(overlay);
  });
  document.querySelector('#whatsapp').addEventListener('click', () => {
    const help = document.querySelector('#canisOrderHelp');
    const fail = (message, field) => {
      help.textContent = message;
      help.hidden = false;
      if (field) field.focus();
    };
    help.hidden = true;
    if (!cart.length) { fail('Adicione um item ao pedido primeiro.'); return; }
    const nameField = document.querySelector('#customer');
    const addressField = document.querySelector('#address');
    const confirmation = document.querySelector('#canisConfirm');
    if (!nameField.value.trim()) { fail('Informe seu nome para continuar.', nameField); return; }
    if (!addressField.value.trim()) { fail('Informe o endereço completo ou retirada.', addressField); return; }
    if (!confirmation.checked) { fail('Confirme que os valores e a disponibilidade precisam ser verificados com a loja.', confirmation); return; }
    const items = cart.map(entry => `• ${entry.quantity}x ${entry.item.name} — ${entry.item.price} cada${entry.notes ? `\n  Opções: ${entry.notes}` : ''}`);
    const name = nameField.value.trim();
    const address = addressField.value.trim();
    const message = `Olá, Canis Hot Cabana! Gostaria de fazer um pedido:\n\n${items.join('\n')}\n\nSubtotal estimado com preços consultados em 23/11/2026: ${currency(total())}\nNome: ${name}\nEntrega ou retirada: ${address}\n\nPor favor, confirme opções, preços, disponibilidade, pedido mínimo, promoções, entrega e valor total antes do pagamento.`;
    window.open(`https://wa.me/5531986789221?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
  renderCart();
})();

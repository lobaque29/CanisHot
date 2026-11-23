(() => {
  if (typeof canisMenuData === 'undefined') return;
  const categories = document.querySelector('#canisCategories');
  const grid = document.querySelector('#canisProducts');
  const search = document.querySelector('#canisSearch');
  const cartOverlay = document.querySelector('#overlay');
  const cartContent = document.querySelector('#cartContent');
  const pagamento = configurarPagamento('canis');
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
        cart.push({item, category, notes: '', quantity: 1});
        renderCart();
        toast('Adicionado ao pedido! Informe opções no carrinho.');
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
      info.textContent = `${entry.item.price} cada`;
      details.append(name, info);
      const field = document.createElement('div');
      field.className = 'field cart-item-notes';
      const notesLabel = document.createElement('label');
      notesLabel.htmlFor = `canis-notes-${index}`;
      notesLabel.textContent = 'Sabor, opções e observações';
      const notes = document.createElement('textarea');
      notes.id = notesLabel.htmlFor;
      notes.rows = 2;
      notes.placeholder = 'Informe sabores, adicionais ou alterações';
      notes.value = entry.notes;
      notes.addEventListener('input', () => { entry.notes = notes.value; });
      field.append(notesLabel, notes);
      details.append(field);
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
    label.textContent = 'Subtotal estimado';
    const amount = document.createElement('span');
    amount.textContent = currency(total());
    subtotal.append(label, amount);
    cartContent.append(list, subtotal);
  }
  document.querySelector('#cartFab').addEventListener('click', () => open(cartOverlay, document.querySelector('#close')));
  document.querySelector('#close').addEventListener('click', () => close(cartOverlay));
  cartOverlay.addEventListener('click', event => {
    if (event.target === cartOverlay) close(cartOverlay);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && cartOverlay.classList.contains('open')) close(cartOverlay);
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
    if (!nameField.value.trim()) { fail('Informe seu nome para continuar.', nameField); return; }
    if (!addressField.value.trim()) { fail('Informe o endereço completo ou retirada.', addressField); return; }
    if (!pagamento.validar(fail)) return;
    const items = cart.map(entry => `🍔 ${entry.quantity}x ${entry.item.name} — ${entry.item.price} cada${entry.notes.trim() ? `\n   📝 Opções e observações: ${entry.notes.trim()}` : ''}`);
    const name = nameField.value.trim();
    const address = addressField.value.trim();
    const message = `🍔 *NOVO PEDIDO — CANIS HOT CABANA* 🍔\n\nOlá! Gostaria de fazer este pedido, por favor:\n\n📋 *ITENS DO PEDIDO*\n${items.join('\n')}\n\n💰 *SUBTOTAL ESTIMADO:* ${currency(total())}\n\n👤 *DADOS DO CLIENTE*\nNome: ${name}\n\n📍 *ENTREGA OU RETIRADA*\n${address}\n\n💳 *FORMA DE PAGAMENTO*\n${pagamento.descricao()}\n\n⚠️ *ATENÇÃO, POR FAVOR:*\nAntes de preparar o pedido, confirme comigo os preços, as opções, os adicionais, a disponibilidade, o pedido mínimo, as promoções, a taxa de entrega e o valor total.\n\n✅ Aguardo a confirmação da loja para considerar o pedido confirmado. Obrigado! 😊`;
    window.open(`https://wa.me/5531986789221?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
  renderCart();
})();

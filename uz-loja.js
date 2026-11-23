(() => {
  const grid = document.querySelector('#uzProducts');
  if (typeof uzMenuData === 'undefined') return;

  const categories = document.querySelector('#uzCategories');
  const search = document.querySelector('#uzSearch');
  const resultsTitle = document.querySelector('#uzResultsTitle');
  const resultsCount = document.querySelector('#uzResultsCount');
  const cartOverlay = document.querySelector('#uzCartOverlay');
  const cartFab = document.querySelector('#uzCartFab');
  const cartContent = document.querySelector('#uzCartContent');
  const pagamento = configurarPagamento('uz');
  const cart = [];
  const validPrice = price => price === null || (typeof price === 'string' && /^R\$\s*\d+(?:\.\d{3})*,\d{2}$/.test(price));
  if (!Array.isArray(uzMenuData) || !uzMenuData.length || uzMenuData.some(category =>
    !category.name || !Array.isArray(category.items) || category.items.some(item =>
      !item.name || typeof item.description !== 'string' || !validPrice(item.price)))) {
    grid.textContent = 'Dados do cardápio inválidos. Consulte o cardápio oficial antes de fazer seu pedido.';
    console.error("Dados inválidos no cardápio da Uz Dog's & Burg.");
    return;
  }
  const currency = value => (value / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  const priceInCents = price => price === null ? null : Number(price.replace(/[^\d,]/g, '').replace(',', ''));
  let returnFocus;
  let statusTimer;
  let selectedCategory = 0;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function showStatus(message) {
    const status = document.querySelector('#uzStatus');
    status.textContent = message;
    status.hidden = false;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { status.hidden = true; }, 3000);
  }

  function openOverlay(overlay, focus) {
    returnFocus = document.activeElement;
    overlay.classList.add('open');
    focus.focus();
  }

  function closeOverlay(overlay) {
    overlay.classList.remove('open');
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  }

  function renderCategory() {
    const query = normalize(search.value.trim());
    categories.querySelectorAll('button').forEach((button, buttonIndex) => {
      const active = !query && buttonIndex === selectedCategory;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const items = query
      ? uzMenuData.flatMap(category => category.items).filter(item => normalize(`${item.name} ${item.description}`).includes(query))
      : uzMenuData[selectedCategory].items;
    resultsTitle.textContent = query ? 'Resultado da busca' : uzMenuData[selectedCategory].name;
    resultsCount.textContent = `${items.length} ${items.length === 1 ? 'item' : 'itens'}`;
    grid.replaceChildren();
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'uz-empty';
      empty.textContent = 'Nenhum item encontrado. Tente outro termo ou escolha uma categoria.';
      grid.append(empty);
    }
    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'uz-card';
      if (item.image) {
        const image = document.createElement('img');
        image.src = item.image;
        image.alt = item.name;
        image.loading = 'lazy';
        card.append(image);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'uz-card-placeholder';
        placeholder.textContent = 'Imagem indisponível';
        card.append(placeholder);
      }
      const body = document.createElement('div');
      body.className = 'uz-card-body';
      const title = document.createElement('h4');
      title.textContent = item.name;
      const description = document.createElement('p');
      description.className = 'uz-card-description';
      description.textContent = item.description;
      const price = document.createElement('span');
      price.className = 'uz-price';
      price.textContent = item.price || 'Preço a confirmar';
      const add = document.createElement('button');
      add.type = 'button';
      add.textContent = 'Adicionar ao pedido';
      add.setAttribute('aria-label', `Adicionar ${item.name} ao pedido`);
      add.addEventListener('click', () => {
        cart.push({item, notes: '', quantity: 1});
        renderCart();
        showStatus(item.price === null ? 'Adicionado! Informe a opção desejada no carrinho.' : 'Adicionado ao pedido! Informe opções no carrinho.');
      });
      body.append(title, description, price, add);
      card.append(body);
      grid.append(card);
    });
  }

  uzMenuData.forEach((category, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'uz-tab';
    button.textContent = category.name;
    button.setAttribute('aria-controls', 'uzProducts');
    button.addEventListener('click', () => {
      selectedCategory = index;
      search.value = '';
      renderCategory();
    });
    categories.append(button);
  });
  search.addEventListener('input', renderCategory);
  renderCategory();

  function renderCart() {
    const count = cart.reduce((sum, entry) => sum + entry.quantity, 0);
    document.querySelector('#uzCartCount').textContent = count;
    cartFab.hidden = count === 0;
    cartContent.replaceChildren();
    if (!count) {
      cartContent.textContent = 'Seu pedido está vazio.';
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
      info.textContent = entry.item.price ? `${entry.item.price} cada (preço base)` : 'Preço a confirmar';
      details.append(name, info);
      const field = document.createElement('div');
      field.className = 'field cart-item-notes';
      const notesLabel = document.createElement('label');
      notesLabel.htmlFor = `uz-notes-${index}`;
      notesLabel.textContent = entry.item.price === null ? 'Sabor, tamanho ou opção (obrigatório)' : 'Sabor, opções e observações';
      const notes = document.createElement('textarea');
      notes.id = notesLabel.htmlFor;
      notes.rows = 2;
      notes.placeholder = 'Informe sabor, tamanho, adicionais ou alterações';
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
    const knownTotal = cart.reduce((sum, entry) => sum + (priceInCents(entry.item.price) || 0) * entry.quantity, 0);
    const subtotal = document.createElement('div');
    subtotal.className = 'cart-total';
    const label = document.createElement('span');
    label.textContent = 'Subtotal estimado (preços de 23/11/2026)';
    const value = document.createElement('span');
    value.textContent = cart.some(entry => entry.item.price !== null) ? currency(knownTotal) : 'A confirmar';
    subtotal.append(label, value);
    const note = document.createElement('p');
    note.className = 'uz-note';
    note.textContent = 'Subtotal não inclui itens sem preço, alterações, adicionais ou entrega. O total final será confirmado pela loja.';
    cartContent.append(list, subtotal, note);
  }

  cartFab.addEventListener('click', () => openOverlay(cartOverlay, cartOverlay.querySelector('.close')));
  document.querySelectorAll('[data-uz-close]').forEach(button => button.addEventListener('click', () => closeOverlay(document.getElementById(button.dataset.uzClose))));
  cartOverlay.addEventListener('click', event => {
    if (event.target === cartOverlay) closeOverlay(cartOverlay);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && cartOverlay.classList.contains('open')) closeOverlay(cartOverlay);
  });
  document.querySelector('#uzWhatsapp').addEventListener('click', () => {
    const help = document.querySelector('#uzOrderHelp');
    const fail = (message, field) => {
      help.textContent = message;
      help.hidden = false;
      if (field) field.focus();
    };
    help.hidden = true;
    if (!cart.length) {
      fail('Adicione um item ao pedido primeiro.');
      return;
    }
    const missingOption = cart.findIndex(entry => entry.item.price === null && !entry.notes.trim());
    if (missingOption !== -1) {
      fail(`Informe sabor, tamanho ou opção para ${cart[missingOption].item.name}.`, document.querySelector(`#uz-notes-${missingOption}`));
      return;
    }
    const nameField = document.querySelector('#uzCustomer');
    const addressField = document.querySelector('#uzAddress');
    if (!nameField.value.trim()) { fail('Informe seu nome para continuar.', nameField); return; }
    if (!addressField.value.trim()) { fail('Informe o endereço completo ou retirada.', addressField); return; }
    if (!pagamento.validar(fail)) return;
    const items = cart.map(entry => `• ${entry.quantity}x ${entry.item.name} — ${entry.item.price ? `${entry.item.price} cada (preço base)` : 'preço a confirmar'}${entry.notes.trim() ? `\n  Opções: ${entry.notes.trim()}` : ''}`);
    const knownTotal = cart.reduce((sum, entry) => sum + (priceInCents(entry.item.price) || 0) * entry.quantity, 0);
    const name = nameField.value.trim();
    const address = addressField.value.trim();
    const notes = document.querySelector('#uzOrderNotes').value.trim();
    const subtotal = cart.some(entry => entry.item.price !== null) ? currency(knownTotal) : 'a confirmar';
    const message = `Olá, Uz Dog's & Burg! Gostaria de fazer um pedido:\n\n${items.join('\n')}\n\nSubtotal estimado dos preços conhecidos, consultados em 23/11/2026: ${subtotal}\nNome: ${name}\nEntrega ou retirada: ${address}\nPagamento desejado: ${pagamento.descricao()}${notes ? `\nObservações: ${notes}` : ''}\n\nPor favor, confirme preços, disponibilidade, opções, adicionais, pedido mínimo, entrega e valor total antes do pagamento.`;
    window.open(`https://wa.me/5531983055079?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
})();

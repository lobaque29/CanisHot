(() => {
  const storeViews = {
    picker: document.querySelector('#storePicker'),
    canis: document.querySelector('#canisStore'),
    other: document.querySelector('#otherStore')
  };

  function showStore(selected) {
    Object.entries(storeViews).forEach(([name, view]) => { view.hidden = name !== selected; });
    document.querySelector('#overlay').classList.remove('open');
    document.title = selected === 'canis' ? 'Canis Hot Cabana | Bateu a fome? Chama!' :
      selected === 'other' ? "Uz Dog's & Burg | Cardápio" : 'Escolha sua loja | Canis Hot';
  }

  document.querySelectorAll('[data-store]').forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.store;
    showStore(selected);
    if (location.hash) history.replaceState(null, '', location.href.split('#')[0]);
    window.scrollTo(0, 0);
    const heading = storeViews[selected].querySelector('h1');
    heading.setAttribute('tabindex', '-1');
    heading.focus({preventScroll: true});
  }));

  const linkedSection = document.getElementById(location.hash.slice(1));
  if (linkedSection) {
    const linkedStore = ['canis', 'other'].find(name => storeViews[name].contains(linkedSection));
    if (linkedStore) {
      showStore(linkedStore);
      requestAnimationFrame(() => linkedSection.scrollIntoView());
    }
  }
})();

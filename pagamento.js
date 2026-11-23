function configurarPagamento(prefixo) {
  const escolha = document.getElementById(`${prefixo}Payment`);
  const campoTroco = document.getElementById(`${prefixo}ChangeField`);
  const troco = document.getElementById(`${prefixo}Change`);
  const opcoes = new Set([
    'Pix',
    'Cartão na entrega',
    'Dinheiro na entrega',
    'Google Pay (checkout oficial)',
    'Nubank (checkout oficial)',
    'Cartão de crédito (checkout oficial)',
    'Combinar com a loja'
  ]);
  escolha.addEventListener('change', () => {
    campoTroco.hidden = escolha.value !== 'Dinheiro na entrega';
    if (campoTroco.hidden) troco.value = '';
  });
  return {
    validar(falhar) {
      if (!opcoes.has(escolha.value)) {
        falhar('Escolha uma forma de pagamento para continuar.', escolha);
        return false;
      }
      if (escolha.value === 'Dinheiro na entrega' && !troco.validity.valid) {
        falhar('Informe um valor válido para o troco.', troco);
        return false;
      }
      return true;
    },
    descricao() {
      const valorTroco = escolha.value === 'Dinheiro na entrega' && troco.value
        ? `; troco para ${Number(troco.value).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`
        : '';
      return `${escolha.value}${valorTroco} (a confirmar com a loja)`;
    }
  };
}

# Operação e validação antes de publicar

Os pedidos são encaminhados ao WhatsApp; a loja deve responder e confirmar os
detalhes. Abrir o WhatsApp não envia nem confirma automaticamente um pedido.
Este site não sincroniza cardápios, preços, promoções, horários ou
disponibilidade com as lojas.

## Antes de cada publicação e sempre que houver mudança

1. Compare todos os produtos, descrições, preços, categorias, fotos e
   disponibilidade com os cardápios oficiais:
   [Canis Hot](https://pedido.anota.ai/loja/canishotcabana) e
   [Uz Dog's & Burg](https://pedido.anota.ai/loja/uz-dogs-dogueria-artesanal-1?f=msa).
2. Atualize os dados em [canis-cardapio.js](./canis-cardapio.js) e
   [uz-cardapio.js](./uz-cardapio.js). Confira as opções obrigatórias e
   adicionais diretamente no cardápio oficial: eles não estão totalmente
   estruturados neste site. Produtos indisponíveis devem ser removidos ou
   atualizados antes da publicação.
3. Atualize a data de consulta em [index.html](./index.html),
   [canis-loja.js](./canis-loja.js) e [uz-loja.js](./uz-loja.js) somente após
   conferir os dados de cada loja. A data atual registra a consulta feita em
   23/11/2026, não uma atualização automática.
4. Confirme com cada loja seu WhatsApp, horários, pedido mínimo, promoções,
   formas de pagamento, taxa de entrega e procedimento de confirmação.
   Não anuncie um desconto sem confirmar suas condições e vigência.
5. Teste o site publicado em HTTPS, no celular e no computador, incluindo as
   imagens e os links externos. Verifique a abertura do WhatsApp no dispositivo
   usado pela clientela. Não publique se houver qualquer divergência.

## Roteiro de teste real controlado

Combine previamente com as duas lojas os produtos, valor máximo e a forma de
identificar e cancelar cada teste. Não informe dados reais de terceiros.

1. Na Canis Hot, escolha um produto que exige opção e outro simples. Abra o
   carrinho e informe opções, quantidades, nome, entrega ou retirada e
   preferência de pagamento. Se optar por dinheiro, teste o troco.
   Confira preços estimados e o aviso de confirmação antes de continuar.
2. Verifique se o WhatsApp abre para o número correto e se a mensagem contém
   produtos, opções, quantidades, pagamento e dados informados. Envie somente após
   conferir e avise à loja que se trata de um teste.
3. Peça à loja para confirmar disponibilidade, adicionais, mínimo, entrega e
   valor final. Não pague nem considere o pedido aceito antes da resposta.
   Confirme o cancelamento ao final se não for consumir.
4. Repita na Uz Dog's & Burg, incluindo um item sem preço e suas opções, e
   confira que a mensagem vai para a loja correta. Nenhum item deve migrar
   entre os carrinhos das lojas.
5. Teste também busca sem resultados, remoção de itens, formulário incompleto,
   opção obrigatória sem preenchimento no carrinho e troca de loja. Refaça os testes nos
   tamanhos de tela e navegadores usados pelos clientes.

O subtotal exibido é apenas uma estimativa dos preços conhecidos; adicionais,
itens sem preço e entrega não são calculados. O atendimento da loja é
responsável pela conferência e pela confirmação final.

As opções de pagamento são preferências enviadas à loja, não uma cobrança. Pix,
Google Pay, Nubank e cartão online aparecem no checkout oficial; sua
disponibilidade para pedidos pelo WhatsApp deve ser confirmada com a loja.

## Segurança e responsabilidade da operação

- Ative autenticação em dois fatores nas contas com acesso ao repositório e
  revise colaboradores, aplicativos autorizados e chaves de acesso. Não guarde
  senhas ou tokens no código: todo o conteúdo publicado é público.
- Proteja a branch publicada com revisão de alterações e acesso restrito.
  Confira especialmente alterações nos números de WhatsApp, links, scripts e
  cardápios antes de publicar; qualquer pessoa com acesso de escrita pode
  alterar o site.
- A política de segurança do navegador limita scripts a arquivos do próprio
  site, mas é aplicada por meta tag. No GitHub Pages não há configuração de
  cabeçalhos HTTP personalizada neste projeto: por isso ela não impede que o
  site seja incorporado em um iframe nem substitui proteções do servidor.
  Se esse bloqueio for necessário, use uma hospedagem ou proxy confiável que
  aplique `Content-Security-Policy: frame-ancestors 'none'` como cabeçalho HTTP.
- O site não tem servidor de pedidos, autenticação ou proteção própria contra
  abuso no WhatsApp. Os clientes devem conferir o destinatário e a loja deve
  validar cada mensagem antes de aceitar o pedido ou solicitar pagamento.
- Nome, endereço e observações são incluídos na mensagem do WhatsApp quando o
  cliente escolhe continuar; informe os clientes sobre esse compartilhamento e
  mantenha apenas os dados necessários. O site não deve coletar informações
  de cartão, senhas ou dados sensíveis nas observações.

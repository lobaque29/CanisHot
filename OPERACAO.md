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

1. Na Canis Hot, escolha um produto que exige opção e outro simples. Informe
   as opções no campo apropriado, quantidades, nome e entrega ou retirada.
   Confira preços estimados e o aviso de confirmação antes de continuar.
2. Verifique se o WhatsApp abre para o número correto e se a mensagem contém
   produtos, opções, quantidades e dados informados. Envie somente após
   conferir e avise à loja que se trata de um teste.
3. Peça à loja para confirmar disponibilidade, adicionais, mínimo, entrega e
   valor final. Não pague nem considere o pedido aceito antes da resposta.
   Confirme o cancelamento ao final se não for consumir.
4. Repita na Uz Dog's & Burg, incluindo um item sem preço e suas opções, e
   confira que a mensagem vai para a loja correta. Nenhum item deve migrar
   entre os carrinhos das lojas.
5. Teste também busca sem resultados, remoção de itens, formulário incompleto,
   opção obrigatória sem preenchimento e troca de loja. Refaça os testes nos
   tamanhos de tela e navegadores usados pelos clientes.

O subtotal exibido é apenas uma estimativa dos preços conhecidos; adicionais,
itens sem preço e entrega não são calculados. O atendimento da loja é
responsável pela conferência e pela confirmação final.

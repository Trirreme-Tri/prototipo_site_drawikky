# Site da Drawikky (@drawikky)

Portfólio, agenda e calculadora de encomendas da ilustradora e capista Drawikky.
Site estático (HTML, CSS e JavaScript puro, sem build), com painel de edição.
Desenvolvido pela [TRIRREME](https://trirreme.com).

Estilo: **Sábado de Manhã** — o site é a vinheta de um desenho animado retrô
(abertura, episódios, intervalo comercial e créditos finais), tirado dos posts
dela: letreiro cursivo com contorno, explosões, arco-íris na diagonal, fundo de
quadrifólios, a caixinha "Drawikky NEW" e a tela de "GAME OVER".

## Páginas

| Página | Arquivo | O que é |
|---|---|---|
| Início | `index.html` | Vinheta, prova social, canais (links), "quem sou", intervalo comercial, programação e cena final |
| Portfólio | `portfolio.html` | Galeria com filtros, "carregar mais" e tela cheia (com detalhes) |
| Agenda | `agenda.html` | Situação atual, agendas por mês (vagas e ESGOTADO automático), calendário e fila |
| Encomendas | `encomendas.html` | Calculadora, capas, formas de pagamento, tabela original e perguntas |
| Painel | `admin.html` | Edição de tudo (agenda, preços, galeria, cenas, perfil, links, perguntas, cores, fontes, backup) |
| Apresentação | `apresentacao.html` | Documento para a artista: links, acesso, estilo, fontes, cores, fluxos e o que conferir |

## Estrutura

```
css/
  tokens.css        cores (claro e escuro); as 7 cores da marca são trocadas pelo painel
  base.css          letras, botões, etiquetas, navegação, créditos, tela cheia, entradas
  site.css          páginas públicas
  admin.css         painel
  apresentacao.css  documento de apresentação
js/
  dados.js          PADRAO: todo o conteúdo editável (textos, preços, agenda, galeria, cores, fontes)
  loja.js           onde o conteúdo fica salvo (hoje localStorage) + utilidades (esc, urlSegura, brl)
  tema.js           aplica cores, fontes, efeitos e tema; carrega SITE
  icones.js         ícones e adesivos em SVG (explosão, raio, brilho, selo "sem IA")
  layout.js         navegação, créditos finais, tela cheia e entrada ao rolar
  agenda.js         regras da agenda: estado de cada agenda (em breve, aberta, esgotado)
  site.js           desenha as páginas públicas
  encomenda.js      calculadora de encomendas
  admin.js          painel
  apresentacao.js   partes dinâmicas da apresentação
assets/             imagens .webp (portfólio em assets/galeria/)
assets/manifesto.csv  inventário de todas as imagens recebidas: usadas, descartadas e por quê
```

**Regra:** todo conteúdo que a artista pode mudar mora em `PADRAO` (`js/dados.js`),
nunca solto no HTML. O painel edita uma cópia e salva pelo `js/loja.js`.

**Agenda:** cada agenda tem data de abertura e número de vagas; o estado é
calculado em `js/agenda.js`. A artista só marca +1 vaga no painel quando o
pagamento é confirmado.

**Movimento:** entradas acontecem uma vez (ao abrir e ao rolar). Nada se mexe
sozinho continuamente. `prefers-reduced-motion` e a opção do painel desligam tudo.

**Imagens:** tratadas sem IA (recorte, Lanczos, nitidez leve, .webp). As que
vieram só do print do perfil estão marcadas com `baixa: true` e não são
esticadas na tela cheia.

## Rodar localmente

```bash
python3 -m http.server
# abrir http://localhost:8000
```

## Limitações conhecidas (fase atual)

- O que é editado no painel fica salvo **no navegador de quem editou** (localStorage).
  Para valer para todos os visitantes, o `js/loja.js` precisa ler e gravar num banco
  (ex.: Supabase).
- O login do painel é verificado no próprio navegador (usuário e senha no código).
  Serve só para esta fase.
- 25 artes do portfólio vieram recortadas do print do perfil (baixa resolução).

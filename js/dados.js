"use strict";

/*
 * Conteúdo padrão do site da Drawikky (@drawikky).
 *
 * REGRA: todo texto, preço, data, link, imagem, cor e fonte que a Drawikky
 * pode mudar mora aqui dentro de PADRAO — nunca solto no HTML. O painel
 * (admin.html) edita uma cópia desse objeto e o js/loja.js guarda a cópia.
 * Quando o conteúdo passar a vir de um banco de dados, só o loja.js muda.
 *
 * Estilo: "Sábado de Manhã" — o site é a vinheta de um desenho animado
 * retrô: abertura, episódios (as páginas), cena final e créditos.
 */
var PADRAO = {
  versao: 1,

  perfil: {
    nome: "Drawikky",
    handle: "drawikky",
    titulo: "Ilustradora · capista · designer gráfica",
    frase: "Curte meus desenhos? Tenha um só seu!",
    fraseEn: "Did you like my drawings? Have one of your own!",
    avatar: "assets/avatar.webp",
    instagram: "drawikky",
    whatsapp: "",
    assinatura: "Obrigado por ler até aqui!",
    selo: "feito à mão · sem IA"
  },

  /* faixa de prova social logo abaixo da abertura e nos cartões do "quem sou" */
  provas: [
    { numero: "+400", texto: "encomendas realizadas" },
    { numero: "Design", texto: "formada em design gráfico" },
    { numero: "Capas", texto: "ilustradora e capista" }
  ],

  cenas: {
    abertura: {
      img: "assets/cenas/abertura.webp", w: 1080, h: 1080, foco: "50% 30%",
      kicker: "Sábado de manhã apresenta",
      legenda: "Retratos cheios de cor, personagens com atitude e capas desenhadas à mão — do esboço à arte final."
    },
    intervalo2: {
      img: "assets/cenas/intervalo-vagalumes.webp", w: 1080, h: 1080, foco: "50% 35%",
      frase: "Vamos criar algo juntos!",
      fraseEn: "let's create something together",
      credito: "cena · Vagalumes"
    },
    paginas: {
      portfolio: { img: "assets/cenas/topo-portfolio.webp", w: 1080, h: 1080, foco: "50% 40%", ep: "Ep. 02", titulo: "Portfólio", sub: "Retratos, fantasia, fanarts e desafios.", subEn: "my favorite drawings" },
      agenda: { img: "assets/cenas/topo-agenda.webp", w: 828, h: 828, foco: "50% 40%", ep: "Ep. 03", titulo: "Agenda", sub: "Quando abre, quantas vagas e como anda a fila.", subEn: "commissions schedule" },
      encomendas: { img: "assets/cenas/topo-encomendas.webp", w: 822, h: 822, foco: "50% 40%", ep: "Ep. 04", titulo: "Encomendas", sub: "Monte a sua e veja o preço na hora.", subEn: "commissions open" }
    }
  },

  sobre: {
    ep: "Ep. 01",
    titulo: "Quem sou",
    tituloEn: "who's drawing",
    imagem: "assets/cenas/quem-sou.webp", w: 1079, h: 1204,
    saudacao: "Oi! Eu sou a Drawikky.",
    texto: "Sou ilustradora, capista e formada em design gráfico. Desenho retratos e personagens cheios de cor, brilho e atitude — com estrelas, raios, flores e muita expressão. Já são mais de 400 encomendas realizadas, e cada uma é feita à mão, do esboço à arte final.",
    texto2: "Se você curte meus desenhos e quer um só seu, é só montar o pedido aqui e me chamar na DM. Vamos criar algo juntos!"
  },

  agenda: {
    /* Cada sessão é uma "agenda" com data de abertura e número de vagas.
       O estado é calculado sozinho (js/agenda.js):
         antes da data de abertura ........ fechada ("abre em X dias")
         aberta e com vaga sobrando ........ aberta
         todas as vagas preenchidas ......... esgotado
       A Drawikky só marca no painel cada vaga confirmada (pagamento feito). */
    sessoes: [
      { nome: "Agenda de outubro", abre: "2026-10-01", vagas: 6, ocupadas: 2, encerrada: false, nota: "Ilustração finalizada e esboço colorido." },
      { nome: "Agenda de novembro", abre: "2026-11-01", vagas: 6, ocupadas: 0, encerrada: false, nota: "Ilustração finalizada e esboço colorido." },
      { nome: "Agenda de dezembro", abre: "2026-12-01", vagas: 4, ocupadas: 0, encerrada: false, nota: "Agenda curta antes das festas." }
    ],
    pausa: false,
    mostrarContagem: true,
    etiquetas: { aberta: "Encomendas abertas!", esgotado: "Esgotado!", fechada: "Fora do ar" },
    avisos: {
      aberta: "As encomendas estão abertas! Monte seu pedido e me chame na DM pra garantir a sua vaga.",
      esgotado: "Todas as vagas desta agenda foram preenchidas — obrigada! Fica de olho na próxima abertura.",
      fechada: "As encomendas estão fechadas enquanto eu termino os pedidos da fila. Aqui você vê quando a próxima agenda abre."
    },
    eventos: [
      { data: "2026-10-30", tipo: "entrega", titulo: "Entregas da agenda de outubro", desc: "Últimos ajustes e envio das artes finais." },
      { data: "2026-12-20", tipo: "fechamento", titulo: "Pausa de fim de ano", desc: "Pedidos novos voltam a andar em janeiro." }
    ],
    fila: [
      { nome: "Encomenda 01", detalhe: "Busto · ilustração finalizada", etapa: 3 },
      { nome: "Encomenda 02", detalhe: "Corpo todo · esboço colorido", etapa: 2 },
      { nome: "Encomenda 03", detalhe: "Meio corpo · ilustração finalizada", etapa: 1 },
      { nome: "Encomenda 04", detalhe: "Busto · esboço colorido", etapa: 0 }
    ],
    etapas: ["Esboço", "Traço", "Cor", "Detalhes e brilho", "Entregue"]
  },

  precos: {
    /* tipos de arte da tabela: cada um tem o seu preço por enquadramento */
    tipos: [
      { id: "finalizada", nome: "Ilustração finalizada", img: "assets/exemplos/ex-finalizada.webp", desc: "A arte completa: traço limpo, cor, luz e detalhes.", precos: { busto: 60, meio: 80, inteiro: 120 } },
      { id: "esboco", nome: "Esboço colorido", img: "assets/exemplos/ex-esboco.webp", desc: "Preço especial: esboço com cor, mais rápido e solto.", precos: { busto: 35, meio: 45, inteiro: 60 } }
    ],
    enquadramentos: [
      { id: "busto", nome: "Busto", img: "assets/exemplos/ex-busto.webp", desc: "Do peito pra cima. Ótimo pra ícone e avatar." },
      { id: "meio", nome: "Meio corpo", img: "assets/exemplos/ex-meio.webp", desc: "Até a cintura, com espaço pra pose e acessórios." },
      { id: "inteiro", nome: "Corpo todo", img: "assets/exemplos/ex-inteiro.webp", desc: "A personagem inteira, da cabeça aos pés." }
    ],
    personagemExtraPct: 80,
    maxPersonagens: 4,
    fundos: [
      { id: "simples", nome: "Fundo simples", preco: 0, desc: "Cor lisa, padrão ou elementos soltos (estrelas, raios, flores)." },
      { id: "cenario", nome: "Cenário", preco: 40, desc: "Um ambiente desenhado atrás da personagem." }
    ],
    descontosVolume: [
      { min: 1, pct: 0 },
      { min: 3, pct: 10 }
    ],
    comercialPct: 50,
    capa: {
      titulo: "Capa de livro ou projeto?",
      texto: "Também sou capista! Capas têm orçamento à parte: me conta a ideia, o tamanho e onde vai ser usada.",
      botao: "Orçamento de capa pela DM",
      mensagem: "Oi, Drawikky! Vim pelo seu site e quero um orçamento de capa ✨"
    },
    regras: [
      { titulo: "Pix", texto: "Metade após o aceite do orçamento e metade no ato da entrega." },
      { titulo: "Cartão de crédito", texto: "Com acréscimo das taxas do Mercado Pago, pago para opções de parcelamento." },
      { titulo: "Uso comercial", texto: "Trabalhos comerciais estão sujeitos a taxa." },
      { titulo: "Orçamento", texto: "Todo pedido é confirmado pela DM do Instagram antes de começar." }
    ],
    tabelas: [
      { titulo: "Encomendas abertas!!", imagens: [
        { img: "assets/tabela/encomendas-1-p.webp", grande: "assets/tabela/encomendas-1-g.webp", w: 600, h: 750, gw: 1080, gh: 1350 },
        { img: "assets/tabela/encomendas-2-p.webp", grande: "assets/tabela/encomendas-2-g.webp", w: 600, h: 750, gw: 1080, gh: 1350 },
        { img: "assets/tabela/encomendas-3-p.webp", grande: "assets/tabela/encomendas-3-g.webp", w: 600, h: 750, gw: 1080, gh: 1350 },
        { img: "assets/tabela/encomendas-4-p.webp", grande: "assets/tabela/encomendas-4-g.webp", w: 600, h: 750, gw: 1080, gh: 1350 }
      ] },
      { titulo: "Esboços coloridos", imagens: [
        { img: "assets/tabela/esbocos-1-p.webp", grande: "assets/tabela/esbocos-1-g.webp", w: 600, h: 750, gw: 1080, gh: 1350 },
        { img: "assets/tabela/esbocos-2-p.webp", grande: "assets/tabela/esbocos-2-g.webp", w: 600, h: 750, gw: 1080, gh: 1350 },
        { img: "assets/tabela/esbocos-3-p.webp", grande: "assets/tabela/esbocos-3-g.webp", w: 600, h: 750, gw: 1080, gh: 1350 },
        { img: "assets/tabela/esbocos-4-p.webp", grande: "assets/tabela/esbocos-4-g.webp", w: 600, h: 750, gw: 1080, gh: 1350 }
      ] }
    ]
  },

  portfolio: {
    porPagina: 12,
    desafios: "DTIYS quer dizer \"Draw This In Your Style\" (desenhe isto no seu estilo): um artista posta uma personagem e a comunidade redesenha. Os créditos de cada desafio aparecem na arte."
  },

  galeria: [
    {"id": "verde-e-amarelo", "img": "assets/galeria/verde-e-amarelo-p.webp", "grande": "assets/galeria/verde-e-amarelo-p.webp", "w": 550, "h": 684, "gw": 550, "gh": 684, "titulo": "Verde e amarelo", "tag": "Retratos", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "sorria", "img": "assets/galeria/sorria-p.webp", "grande": "assets/galeria/sorria-g.webp", "w": 600, "h": 600, "gw": 1080, "gh": 1080, "titulo": "Sorria!", "tag": "Retratos", "credito": "", "detalhes": [{"img": "assets/galeria/sorria-d1-p.webp", "grande": "assets/galeria/sorria-d1-g.webp", "w": 1080, "h": 1080}, {"img": "assets/galeria/sorria-d2-p.webp", "grande": "assets/galeria/sorria-d2-g.webp", "w": 1080, "h": 1080}], "baixa": false, "visivel": true},
    {"id": "noite-estrelada", "img": "assets/galeria/noite-estrelada-p.webp", "grande": "assets/galeria/noite-estrelada-g.webp", "w": 480, "h": 600, "gw": 1080, "gh": 1350, "titulo": "Noite estrelada", "tag": "Fantasia", "credito": "", "detalhes": [{"img": "assets/galeria/noite-estrelada-d1-p.webp", "grande": "assets/galeria/noite-estrelada-d1-g.webp", "w": 1080, "h": 1350}, {"img": "assets/galeria/noite-estrelada-d2-p.webp", "grande": "assets/galeria/noite-estrelada-d2-g.webp", "w": 1080, "h": 1350}, {"img": "assets/galeria/noite-estrelada-d3-p.webp", "grande": "assets/galeria/noite-estrelada-d3-g.webp", "w": 1079, "h": 1350}, {"img": "assets/galeria/noite-estrelada-d4-p.webp", "grande": "assets/galeria/noite-estrelada-d4-g.webp", "w": 1080, "h": 1350}], "baixa": false, "visivel": true},
    {"id": "colecionador", "img": "assets/galeria/colecionador-p.webp", "grande": "assets/galeria/colecionador-g.webp", "w": 538, "h": 600, "gw": 1080, "gh": 1204, "titulo": "Drawikky NEW", "tag": "Especiais", "credito": "", "detalhes": [{"img": "assets/galeria/colecionador-d1-p.webp", "grande": "assets/galeria/colecionador-d1-g.webp", "w": 1080, "h": 1204}, {"img": "assets/galeria/colecionador-d2-p.webp", "grande": "assets/galeria/colecionador-d2-g.webp", "w": 1079, "h": 1204}], "baixa": false, "visivel": true},
    {"id": "vagalumes", "img": "assets/galeria/vagalumes-p.webp", "grande": "assets/galeria/vagalumes-g.webp", "w": 600, "h": 600, "gw": 1080, "gh": 1080, "titulo": "Vagalumes", "tag": "Fantasia", "credito": "", "detalhes": [{"img": "assets/galeria/vagalumes-d1-p.webp", "grande": "assets/galeria/vagalumes-d1-g.webp", "w": 1080, "h": 1080}], "baixa": false, "visivel": true},
    {"id": "fada-de-oculos", "img": "assets/galeria/fada-de-oculos-p.webp", "grande": "assets/galeria/fada-de-oculos-g.webp", "w": 600, "h": 600, "gw": 1080, "gh": 1080, "titulo": "Fada de óculos", "tag": "Desafios", "credito": "DTIYS de @lunavalentineart · #LVADTIYS", "detalhes": [{"img": "assets/galeria/fada-de-oculos-d1-p.webp", "grande": "assets/galeria/fada-de-oculos-d1-g.webp", "w": 822, "h": 822}], "baixa": false, "visivel": true},
    {"id": "game-over", "img": "assets/galeria/game-over-p.webp", "grande": "assets/galeria/game-over-g.webp", "w": 600, "h": 600, "gw": 1080, "gh": 1080, "titulo": "Game over", "tag": "Desafios", "credito": "DTIYS", "detalhes": [{"img": "assets/galeria/game-over-d1-p.webp", "grande": "assets/galeria/game-over-d1-g.webp", "w": 828, "h": 828}], "baixa": false, "visivel": true},
    {"id": "milkman", "img": "assets/galeria/milkman-p.webp", "grande": "assets/galeria/milkman-g.webp", "w": 476, "h": 600, "gw": 1072, "gh": 1350, "titulo": "Milkman", "tag": "Fanart", "credito": "", "detalhes": [{"img": "assets/galeria/milkman-d1-p.webp", "grande": "assets/galeria/milkman-d1-g.webp", "w": 1080, "h": 1350}], "baixa": false, "visivel": true},
    {"id": "garota-fantasma", "img": "assets/galeria/garota-fantasma-p.webp", "grande": "assets/galeria/garota-fantasma-g.webp", "w": 600, "h": 600, "gw": 1064, "gh": 1064, "titulo": "Garota fantasma", "tag": "Desafios", "credito": "", "detalhes": [], "baixa": false, "visivel": true},
    {"id": "ponei-das-constelacoes", "img": "assets/galeria/ponei-das-constelacoes-p.webp", "grande": "assets/galeria/ponei-das-constelacoes-g.webp", "w": 600, "h": 600, "gw": 1080, "gh": 1080, "titulo": "Pônei das constelações", "tag": "Fantasia", "credito": "", "detalhes": [{"img": "assets/galeria/ponei-das-constelacoes-d1-p.webp", "grande": "assets/galeria/ponei-das-constelacoes-d1-g.webp", "w": 1080, "h": 1080}], "baixa": false, "visivel": true},
    {"id": "chuva", "img": "assets/galeria/chuva-p.webp", "grande": "assets/galeria/chuva-p.webp", "w": 550, "h": 682, "gw": 550, "gh": 682, "titulo": "Chuva", "tag": "Retratos", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "cafe-do-elfo", "img": "assets/galeria/cafe-do-elfo-p.webp", "grande": "assets/galeria/cafe-do-elfo-p.webp", "w": 550, "h": 682, "gw": 550, "gh": 682, "titulo": "Café do elfo", "tag": "Fantasia", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "coroa-de-flores", "img": "assets/galeria/coroa-de-flores-p.webp", "grande": "assets/galeria/coroa-de-flores-p.webp", "w": 548, "h": 736, "gw": 548, "gh": 736, "titulo": "Coroa de flores", "tag": "Retratos", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "noiva-da-lua", "img": "assets/galeria/noiva-da-lua-p.webp", "grande": "assets/galeria/noiva-da-lua-p.webp", "w": 548, "h": 684, "gw": 548, "gh": 684, "titulo": "Noiva da lua", "tag": "Fantasia", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "sally", "img": "assets/galeria/sally-p.webp", "grande": "assets/galeria/sally-p.webp", "w": 550, "h": 684, "gw": 550, "gh": 684, "titulo": "Sally", "tag": "Fanart", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "pomni", "img": "assets/galeria/pomni-p.webp", "grande": "assets/galeria/pomni-p.webp", "w": 550, "h": 684, "gw": 550, "gh": 684, "titulo": "Pomni", "tag": "Fanart", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "estrela-dourada", "img": "assets/galeria/estrela-dourada-p.webp", "grande": "assets/galeria/estrela-dourada-p.webp", "w": 550, "h": 684, "gw": 550, "gh": 684, "titulo": "Estrela dourada", "tag": "Fantasia", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "estampa-de-estrelas", "img": "assets/galeria/estampa-de-estrelas-p.webp", "grande": "assets/galeria/estampa-de-estrelas-p.webp", "w": 548, "h": 684, "gw": 548, "gh": 684, "titulo": "Estampa de estrelas", "tag": "Retratos", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "rosa-mecanico", "img": "assets/galeria/rosa-mecanico-p.webp", "grande": "assets/galeria/rosa-mecanico-p.webp", "w": 548, "h": 682, "gw": 548, "gh": 682, "titulo": "Rosa mecânico", "tag": "Fantasia", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "girassois", "img": "assets/galeria/girassois-p.webp", "grande": "assets/galeria/girassois-p.webp", "w": 550, "h": 736, "gw": 550, "gh": 736, "titulo": "Girassóis", "tag": "Retratos", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "morceguinho", "img": "assets/galeria/morceguinho-p.webp", "grande": "assets/galeria/morceguinho-p.webp", "w": 550, "h": 682, "gw": 550, "gh": 682, "titulo": "Morceguinho", "tag": "Desafios", "credito": "DTIYS · paleta de cores", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "bruxa-rosa", "img": "assets/galeria/bruxa-rosa-p.webp", "grande": "assets/galeria/bruxa-rosa-p.webp", "w": 550, "h": 682, "gw": 550, "gh": 682, "titulo": "Bruxa rosa", "tag": "Desafios", "credito": "DTIYS · paleta de cores", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "abraco-na-lua", "img": "assets/galeria/abraco-na-lua-p.webp", "grande": "assets/galeria/abraco-na-lua-p.webp", "w": 548, "h": 682, "gw": 548, "gh": 682, "titulo": "Abraço na lua", "tag": "Desafios", "credito": "Desafio de paleta de cores", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "serpentes-rosas", "img": "assets/galeria/serpentes-rosas-p.webp", "grande": "assets/galeria/serpentes-rosas-p.webp", "w": 548, "h": 682, "gw": 548, "gh": 682, "titulo": "Serpentes rosas", "tag": "Desafios", "credito": "DTIYS · paleta de cores", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "sorvete", "img": "assets/galeria/sorvete-p.webp", "grande": "assets/galeria/sorvete-p.webp", "w": 550, "h": 682, "gw": 550, "gh": 682, "titulo": "Sorvete", "tag": "Desafios", "credito": "DTIYS", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "arco-iris", "img": "assets/galeria/arco-iris-p.webp", "grande": "assets/galeria/arco-iris-p.webp", "w": 550, "h": 682, "gw": 550, "gh": 682, "titulo": "Arco-íris", "tag": "Retratos", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "chiclete", "img": "assets/galeria/chiclete-p.webp", "grande": "assets/galeria/chiclete-p.webp", "w": 550, "h": 682, "gw": 550, "gh": 682, "titulo": "Chiclete", "tag": "Retratos", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "cerejeira", "img": "assets/galeria/cerejeira-p.webp", "grande": "assets/galeria/cerejeira-p.webp", "w": 548, "h": 682, "gw": 548, "gh": 682, "titulo": "Cerejeira", "tag": "Retratos", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "anjo-dos-morangos", "img": "assets/galeria/anjo-dos-morangos-p.webp", "grande": "assets/galeria/anjo-dos-morangos-p.webp", "w": 548, "h": 684, "gw": 548, "gh": 684, "titulo": "Anjo dos morangos", "tag": "Desafios", "credito": "#WikkyDTIYS · desafio da Drawikky", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "the-last-bite", "img": "assets/galeria/the-last-bite-p.webp", "grande": "assets/galeria/the-last-bite-p.webp", "w": 550, "h": 684, "gw": 550, "gh": 684, "titulo": "The last bite", "tag": "Fantasia", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "lua-crescente", "img": "assets/galeria/lua-crescente-p.webp", "grande": "assets/galeria/lua-crescente-p.webp", "w": 550, "h": 684, "gw": 550, "gh": 684, "titulo": "Lua crescente", "tag": "Retratos", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "bruxinha-confeiteira", "img": "assets/galeria/bruxinha-confeiteira-p.webp", "grande": "assets/galeria/bruxinha-confeiteira-p.webp", "w": 550, "h": 684, "gw": 550, "gh": 684, "titulo": "Bruxinha confeiteira", "tag": "Fantasia", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "pink", "img": "assets/galeria/pink-p.webp", "grande": "assets/galeria/pink-p.webp", "w": 548, "h": 684, "gw": 548, "gh": 684, "titulo": "Pink", "tag": "Fantasia", "credito": "", "detalhes": [], "baixa": true, "visivel": true},
    {"id": "coroa-de-bolo", "img": "assets/galeria/coroa-de-bolo-p.webp", "grande": "assets/galeria/coroa-de-bolo-p.webp", "w": 548, "h": 682, "gw": 548, "gh": 682, "titulo": "Coroa de bolo", "tag": "Fantasia", "credito": "", "detalhes": [], "baixa": true, "visivel": true}
  ],

  links: [
    { nome: "Instagram", desc: "Artes novas, avisos de abertura e orçamentos pela DM", url: "https://www.instagram.com/drawikky/", icone: "instagram", visivel: true },
    { nome: "Cara", desc: "Meu portfólio no Cara, a rede de artistas", url: "https://cara.app/drawikky", icone: "pincel", visivel: true },
    { nome: "Monte sua encomenda", desc: "Escolha as opções e veja o preço na hora", url: "encomendas.html", icone: "coracao", visivel: true },
    { nome: "Agenda", desc: "Quando abre, quantas vagas e como anda a fila", url: "agenda.html", icone: "agenda", visivel: true },
    { nome: "Portfólio", desc: "Retratos, fantasia, fanarts e desafios", url: "portfolio.html", icone: "estrela", visivel: true }
  ],

  faq: [
    { p: "Como faço meu pedido?", r: "Monte sua encomenda na calculadora, copie o resumo e me mande na DM do Instagram. Eu respondo com o orçamento e, com tudo combinado, sua vaga é garantida." },
    { p: "Como funciona o pagamento?", r: "No Pix: metade após o aceite do orçamento e metade no ato da entrega. No cartão de crédito: com acréscimo das taxas do Mercado Pago, pago para as opções de parcelamento." },
    { p: "Qual a diferença entre esboço colorido e ilustração finalizada?", r: "O esboço colorido tem preço especial: é mais solto e rápido, com cor. A ilustração finalizada é a arte completa, com traço limpo, luz e todos os detalhes." },
    { p: "Você usa IA?", r: "Não! Tudo aqui é feito à mão, do esboço ao último brilho. Nenhuma arte é gerada ou retocada por inteligência artificial." },
    { p: "Você faz capas?", r: "Faço! Sou capista. Capa tem orçamento à parte: me chama na DM contando a ideia, o tamanho e onde ela vai ser usada." },
    { p: "Posso usar a arte comercialmente?", r: "Pode, combinando antes: trabalhos comerciais estão sujeitos a taxa. Marque \"uso comercial\" na calculadora pra ver o valor." },
    { p: "Gostei, mas agora não é um bom momento. Posso ajudar?", r: "Pode sim, e faz muita diferença! Curta, comente, compartilhe e salve os posts — isso ajuda meu trabalho a chegar em mais gente." }
  ],

  aparencia: {
    cores: {
      laranja: "#FA9A2D",
      rosa: "#FE80AB",
      lavanda: "#B092FF",
      ceu: "#74BDFF",
      amarelo: "#FFE86E",
      creme: "#FFF3BF",
      noite: "#20226A"
    },
    fontes: {
      letreiro: "Yellowtail",
      texto: "Montserrat",
      selo: "Silkscreen"
    },
    efeitos: {
      padrao: true,
      contorno: true,
      adesivos: true
    },
    movimento: "normal", // "normal" | "suave" | "desligado"
    tema: "auto"         // "auto" | "escuro" | "claro"
  }
};

/* Fontes que o painel oferece em cada papel (nomes exatos do Google Fonts). */
var OPCOES_FONTES = {
  letreiro: ["Yellowtail", "Pacifico", "Lobster Two", "Damion", "Kaushan Script", "Leckerli One"],
  texto: ["Montserrat", "Poppins", "Nunito", "Quicksand", "DM Sans", "Rubik"],
  selo: ["Silkscreen", "Press Start 2P", "VT323", "Bungee", "Rubik Mono One", "Space Mono"]
};

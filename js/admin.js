"use strict";

/*
 * Painel da Drawikky (admin.html).
 *
 * Como funciona: o painel edita uma CÓPIA do conteúdo (rascunho). Nada muda
 * no site até clicar em "Salvar alterações" — aí o rascunho vai pro
 * js/loja.js, e qualquer aba aberta do site se redesenha sozinha.
 *
 * Os campos são ligados ao conteúdo por um "caminho" (data-k="perfil.nome",
 * "precos.fundos.1.preco"...). Um único listener lê o caminho e grava o
 * valor no lugar certo — adicionar um campo novo é só chamar
 * campo("caminho", "Rótulo") na aba.
 *
 * ATENÇÃO: o login abaixo é uma porta de entrada simples para esta fase
 * (usuário e senha ficam no próprio código, visíveis pra quem souber
 * procurar). Quando o conteúdo for para um banco de dados, o login passa a
 * ser feito pelo serviço do banco.
 */
(function () {
  /* se trocar, troque também o que aparece em apresentacao.html */
  var USUARIO = "drawikky";
  var SENHA = "sabado2026";
  var CHAVE_SESSAO = "drawikky:painel";

  var $ = function (s) { return document.querySelector(s); };
  var rascunho = copiaProfunda(SITE);
  var sujo = false;
  var abaAtual = "agenda";

  /* ===================== caminho → valor ===================== */
  function get(caminho, obj) {
    return caminho.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj || rascunho);
  }
  function set(caminho, valor) {
    var ks = caminho.split("."), o = rascunho;
    for (var i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = valor;
  }
  function pai(caminho) { return caminho.split(".").slice(0, -1).join("."); }

  /* ===================== peças de formulário ===================== */
  var uid = 0;
  function novoId() { return "c" + (++uid); }

  function secao(titulo, sub, corpo) {
    return '<section class="ps"><header class="ps-cab"><h2>' + titulo + "</h2>" + (sub ? "<p>" + sub + "</p>" : "") + "</header>" + corpo + "</section>";
  }
  function linha() { return '<div class="ps-linha">' + Array.prototype.join.call(arguments, "") + "</div>"; }

  /* opts: tipo (text|textarea|number|date|url|select|check|cor), ajuda, opcoes [{v,t}], passo, linhas, lista, placeholder, largo */
  function campo(caminho, rotulo, opts) {
    opts = opts || {};
    var tipo = opts.tipo || "text", v = get(caminho), id = novoId();
    var ajuda = opts.ajuda ? '<small class="ajuda">' + opts.ajuda + "</small>" : "";
    var k = ' data-k="' + caminho + '" id="' + id + '"';
    if (tipo === "check") {
      return '<label class="check"><input type="checkbox" data-tipo="bool"' + k + (v ? " checked" : "") + "><span>" + rotulo + ajuda + "</span></label>";
    }
    var input;
    if (tipo === "textarea") {
      input = "<textarea" + k + ' rows="' + (opts.linhas || 3) + '">' + esc(v) + "</textarea>";
    } else if (tipo === "select") {
      input = "<select" + k + (opts.numero ? ' data-tipo="num"' : "") + ">" + opts.opcoes.map(function (o) {
        return '<option value="' + esc(o.v) + '"' + (String(o.v) === String(v) ? " selected" : "") + ">" + esc(o.t) + "</option>";
      }).join("") + "</select>";
    } else if (tipo === "number") {
      input = '<input type="number" inputmode="decimal" data-tipo="num" step="' + (opts.passo || 1) + '"' + (opts.min != null ? ' min="' + opts.min + '"' : "") + k + ' value="' + esc(v == null ? "" : v) + '">';
    } else if (tipo === "cor") {
      input = '<span class="cor-par"><input type="color" data-tipo="cor"' + k + ' value="' + esc(v) + '"><input type="text" class="cor-hex" data-hex="' + caminho + '" value="' + esc(v) + '" maxlength="7" aria-label="' + esc(rotulo) + ' em hexadecimal"></span>';
    } else {
      input = '<input type="' + (tipo === "date" ? "date" : (tipo === "url" ? "url" : "text")) + '"' + k + ' value="' + esc(v == null ? "" : v) + '"' + (opts.lista ? ' list="' + opts.lista + '"' : "") + (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : "") + ">";
    }
    return '<div class="campo' + (opts.largo ? " largo" : "") + '"><label for="' + id + '">' + rotulo + "</label>" + input + ajuda + "</div>";
  }

  function campoImg(caminho, rotulo, ajuda) {
    var v = get(caminho) || "", ehArquivo = /^data:/.test(v), id = novoId();
    var src = urlSegura(v, true);
    return '<div class="campo campo-img">' +
      '<span class="mini">' + (src ? '<img src="' + esc(src) + '" alt="">' : "<i>sem imagem</i>") + "</span>" +
      '<div class="campo-img-dir"><label for="' + id + '">' + rotulo + "</label>" +
      (ehArquivo
        ? '<p class="ajuda">Imagem enviada do computador. <button type="button" class="link-btn" data-limpar-img="' + caminho + '">trocar por link</button></p>'
        : '<input type="text" id="' + id + '" data-k="' + caminho + '" data-img-link value="' + esc(v) + '" placeholder="link da imagem (https://...)">') +
      '<label class="btn btn-mini"><input type="file" accept="image/*" data-img="' + caminho + '" hidden>Enviar do computador</label>' +
      (ajuda ? '<small class="ajuda">' + ajuda + "</small>" : "") + "</div></div>";
  }

  /* lista editável com subir/descer/remover e botão de adicionar */
  var NOVOS = {};
  function lista(caminho, itemHtml, novo, textoAdd, vazio) {
    NOVOS[caminho] = novo;
    var itens = get(caminho) || [];
    var corpo = itens.length ? itens.map(function (it, i) {
      return '<div class="item"><div class="item-campos">' + itemHtml(it, i, caminho + "." + i) + "</div>" +
        '<div class="item-acoes">' +
        '<button type="button" class="ico-btn" data-mover="-1" data-l="' + caminho + '" data-i="' + i + '" aria-label="Subir"' + (i === 0 ? " disabled" : "") + ">&#8593;</button>" +
        '<button type="button" class="ico-btn" data-mover="1" data-l="' + caminho + '" data-i="' + i + '" aria-label="Descer"' + (i === itens.length - 1 ? " disabled" : "") + ">&#8595;</button>" +
        '<button type="button" class="ico-btn perigo" data-remover data-l="' + caminho + '" data-i="' + i + '" aria-label="Remover">&times;</button>' +
        "</div></div>";
    }).join("") : '<p class="vazio">' + (vazio || "Nada aqui ainda.") + "</p>";
    return '<div class="lista">' + corpo + '</div><button type="button" class="btn add" data-add="' + caminho + '">+ ' + textoAdd + "</button>";
  }

  var FOCOS = [
    { v: "50% 20%", t: "Topo" }, { v: "50% 40%", t: "Centro-alto" }, { v: "50% 50%", t: "Centro" },
    { v: "50% 80%", t: "Base" }, { v: "20% 50%", t: "Esquerda" }, { v: "80% 50%", t: "Direita" }
  ];
  function opcoesFoco(caminho) {
    var atual = get(caminho) || "50% 40%";
    var l = FOCOS.slice();
    if (!l.some(function (f) { return f.v === atual; })) l.unshift({ v: atual, t: "Personalizado (" + atual + ")" });
    return l;
  }

  /* ===================== abas ===================== */
  var ABAS = [
    { id: "agenda", nome: "Agenda", icone: "agenda", render: abaAgenda },
    { id: "encomendas", nome: "Preços e encomendas", icone: "coracao", render: abaEncomendas },
    { id: "galeria", nome: "Galeria", icone: "estrela", render: abaGaleria },
    { id: "cenas", nome: "Cenas e imagens", icone: "tv", render: abaCenas },
    { id: "perfil", nome: "Perfil e \"quem sou\"", icone: "pincel", render: abaPerfil },
    { id: "links", nome: "Links", icone: "link", render: abaLinks },
    { id: "perguntas", nome: "Perguntas", icone: "balao", render: abaPerguntas },
    { id: "aparencia", nome: "Cores, fontes e estilo", icone: "raio", render: abaAparencia },
    { id: "backup", nome: "Backup", icone: "marcador", render: abaBackup }
  ];

  function renderAbas() {
    $("#abas").innerHTML = ABAS.map(function (a, i) {
      return '<button type="button" class="aba-btn" data-aba="' + a.id + '" aria-current="' + (a.id === abaAtual) + '">' +
        '<span class="aba-n t-selo">' + String(i + 1).padStart(2, "0") + "</span>" + iconeSvg(a.icone) + "<span>" + a.nome + "</span></button>";
    }).join("");
  }

  function render() {
    var a = ABAS.filter(function (x) { return x.id === abaAtual; })[0];
    var y = window.scrollY;
    var n = ABAS.indexOf(a) + 1;
    $("#aba").innerHTML = '<p class="t-selo aba-ep">Aba ' + String(n).padStart(2, "0") + '</p><h2 class="aba-titulo t-letreiro">' + a.nome + "</h2>" + a.render();
    window.scrollTo(0, y);
    Array.prototype.forEach.call(document.querySelectorAll(".js-avatar"), function (el) { el.src = urlSegura(rascunho.perfil.avatar, true) || "assets/avatar.webp"; });
  }

  /* ----- 01 agenda ----- */
  var NOMES_ESTADO = { aberta: "Aberta", esgotado: "Esgotado", embreve: "Em breve", encerrada: "Encerrada", fechada: "Fechada" };
  var TIPOS_ADMIN = { abertura: "Abertura", entrega: "Entrega", aviso: "Aviso", fechamento: "Pausa" };
  function hojeTxt() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  function abaAgenda() {
    var a = rascunho.agenda;
    var ag = estadoAgenda(a);
    var etapas = a.etapas.map(function (e, i) { return { v: i, t: e }; });
    var tipos = Object.keys(TIPOS_ADMIN).map(function (k) { return { v: k, t: TIPOS_ADMIN[k] }; });
    var agora = ag.estado === "aberta" ? "<b>" + esc(ag.atual.sessao.nome) + "</b> está aberta com " + ag.atual.livres + " de " + ag.atual.vagas + " vagas livres."
      : ag.estado === "esgotado" ? "<b>" + esc(ag.atual.sessao.nome) + "</b> está esgotada."
      : a.pausa ? "A pausa está ligada: o site mostra as encomendas fechadas."
      : "Nenhuma agenda aberta agora.";
    if (ag.estado !== "aberta" && ag.proxima) agora += " A próxima é <b>" + esc(ag.proxima.sessao.nome) + "</b>, em " + esc(dataExtenso(ag.proxima.abre)) + ".";

    return secao("Situação agora", "Calculada sozinha a partir das agendas abaixo. Não precisa trocar nada na mão.",
        '<div class="situacao situacao-' + ag.estado + '"><span class="chip t-selo">' + NOMES_ESTADO[ag.estado] + "</span><p>" + agora + "</p></div>" +
        campo("agenda.pausa", "Pausar encomendas agora (fecha tudo, mesmo com vaga sobrando)", { tipo: "check" }) +
        campo("agenda.mostrarContagem", "Mostrar contagem regressiva (\"abre em X dias\") quando estiver fechada", { tipo: "check" })) +
      secao("Agendas de encomenda", "Cada agenda abre numa data e tem um número de vagas. Quando alguém confirmar o pagamento, marque +1 vaga preenchida. Quando enche, o site mostra ESGOTADO sozinho.",
        lista("agenda.sessoes", function (x, i, c) {
          var est = estadoSessao(x);
          return '<div class="sessao-adm">' +
            '<div class="vagas-rapido"><span class="chip t-selo chip-' + est.estado + '">' + NOMES_ESTADO[est.estado] + "</span>" +
            '<span class="vagas-txt">Vagas preenchidas</span>' +
            '<span class="vagas-ctrl"><button type="button" class="ico-btn" data-vaga="' + i + '" data-d="-1" aria-label="Uma vaga a menos"' + (est.ocupadas <= 0 ? " disabled" : "") + ">&minus;</button>" +
            "<b>" + est.ocupadas + " / " + est.vagas + "</b>" +
            '<button type="button" class="ico-btn" data-vaga="' + i + '" data-d="1" aria-label="Uma vaga a mais"' + (est.ocupadas >= est.vagas ? " disabled" : "") + ">+</button></span></div>" +
            linha(campo(c + ".nome", "Nome", { placeholder: "Agenda de novembro" }), campo(c + ".abre", "Abre em", { tipo: "date" }), campo(c + ".vagas", "Total de vagas", { tipo: "number", min: 1 })) +
            campo(c + ".nota", "Observação (opcional)", { placeholder: "Ex.: só busto e meio corpo" }) +
            campo(c + ".encerrada", "Encerrar esta agenda antes de encher", { tipo: "check" }) + "</div>";
        }, function () {
          var d = new Date(); d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
          return { nome: "Agenda de " + MESES[d.getMonth()], abre: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-01", vagas: 6, ocupadas: 0, encerrada: false, nota: "" };
        }, "Adicionar agenda", "Nenhuma agenda criada.")) +
      secao("Textos de cada situação", "A etiqueta inclinada e o recado do quadro da agenda.",
        ["aberta", "esgotado", "fechada"].map(function (k) {
          return '<h3 class="sub-t">' + NOMES_ESTADO[k] + "</h3>" + linha(campo("agenda.etiquetas." + k, "Etiqueta"), campo("agenda.avisos." + k, "Recado", { largo: true }));
        }).join("")) +
      secao("Outras datas", "Entregas, avisos e pausas. As aberturas das agendas já entram no calendário sozinhas.",
        lista("agenda.eventos", function (ev, i, c) {
          return linha(campo(c + ".data", "Data", { tipo: "date" }), campo(c + ".tipo", "Tipo", { tipo: "select", opcoes: tipos })) +
            campo(c + ".titulo", "Título") + campo(c + ".desc", "Descrição", { tipo: "textarea", linhas: 2 });
        }, function () { return { data: hojeTxt(), tipo: "aviso", titulo: "Nova data", desc: "" }; }, "Adicionar data", "Nenhuma data marcada.")) +
      secao("Fila de produção", "Mostra em que etapa está cada encomenda. Use nomes genéricos se a pessoa preferir não aparecer.",
        lista("agenda.fila", function (f, i, c) {
          return linha(campo(c + ".nome", "Nome"), campo(c + ".detalhe", "Detalhe"), campo(c + ".etapa", "Etapa", { tipo: "select", opcoes: etapas, numero: true }));
        }, function () { return { nome: "Encomenda " + String(rascunho.agenda.fila.length + 1).padStart(2, "0"), detalhe: "", etapa: 0 }; }, "Adicionar encomenda na fila", "A fila está vazia.")) +
      secao("Etapas da fila", "A última etapa é considerada \"entregue\".",
        lista("agenda.etapas", function (e, i, c) { return campo(c, "Etapa " + (i + 1)); }, function () { return "Nova etapa"; }, "Adicionar etapa"));
  }

  /* ----- 02 preços e encomendas ----- */
  function abaEncomendas() {
    var p = rascunho.precos;
    return secao("Tipos de arte", "Cada tipo tem o seu preço por enquadramento (como nas suas duas tabelas).",
        lista("precos.tipos", function (o, i, c) {
          return linha(campo(c + ".nome", "Nome"), campo(c + ".desc", "Descrição curta", { largo: true })) +
            '<div class="ps-linha">' + p.enquadramentos.map(function (e) {
              return campo(c + ".precos." + e.id, esc(e.nome) + " (R$)", { tipo: "number", passo: "0.01", min: 0 });
            }).join("") + "</div>" +
            campoImg(c + ".img", "Imagem de exemplo");
        }, function () {
          var pr = {}; p.enquadramentos.forEach(function (e) { pr[e.id] = 0; });
          return { id: "tipo" + Date.now(), nome: "Novo tipo", desc: "", img: "", precos: pr };
        }, "Adicionar tipo de arte")) +
      secao("Enquadramentos", "Os preços de cada enquadramento ficam nos tipos de arte, logo acima.",
        lista("precos.enquadramentos", function (o, i, c) {
          return linha(campo(c + ".nome", "Nome", { attr: "data-rerender" }), campo(c + ".desc", "Descrição curta", { largo: true })) + campoImg(c + ".img", "Imagem de exemplo");
        }, function () { return { id: "enq" + Date.now(), nome: "Novo enquadramento", img: "", desc: "" }; }, "Adicionar enquadramento")) +
      secao("Personagens extras", "",
        linha(campo("precos.personagemExtraPct", "Cada personagem extra (%)", { tipo: "number", min: 0, ajuda: "Sobre o valor do enquadramento." }),
              campo("precos.maxPersonagens", "Máximo de personagens por arte", { tipo: "number", min: 1 }))) +
      secao("Fundos", "Valor fixo somado a cada arte. 0 = incluso.",
        lista("precos.fundos", function (o, i, c) {
          return linha(campo(c + ".nome", "Nome"), campo(c + ".preco", "Preço (R$)", { tipo: "number", passo: "0.01", min: 0 })) + campo(c + ".desc", "Descrição curta");
        }, function () { return { id: "fundo" + Date.now(), nome: "Novo fundo", preco: 0, desc: "" }; }, "Adicionar fundo")) +
      secao("Desconto por quantidade", "A partir de quantas artes no mesmo pedido o desconto vale.",
        lista("precos.descontosVolume", function (o, i, c) {
          return linha(campo(c + ".min", "A partir de (artes)", { tipo: "number", min: 1 }), campo(c + ".pct", "Desconto (%)", { tipo: "number", min: 0 }));
        }, function () { return { min: 5, pct: 15 }; }, "Adicionar faixa de desconto")) +
      secao("Uso comercial", "", campo("precos.comercialPct", "Acréscimo para uso comercial (%)", { tipo: "number", min: 0 })) +
      secao("Capas", "O cartão rosa ao lado do pedido. A capa não tem preço fixo: o botão abre a DM com a mensagem copiada.",
        campo("precos.capa.titulo", "Título") + campo("precos.capa.texto", "Texto", { tipo: "textarea", linhas: 2 }) +
        linha(campo("precos.capa.botao", "Texto do botão"), campo("precos.capa.mensagem", "Mensagem copiada", { largo: true }))) +
      secao("Formas de pagamento", "Os cartões numerados abaixo da calculadora.",
        lista("precos.regras", function (r, i, c) { return linha(campo(c + ".titulo", "Título"), campo(c + ".texto", "Texto", { largo: true })); },
          function () { return { titulo: "Nova regra", texto: "" }; }, "Adicionar regra")) +
      secao("Tabela original", "Os posts com os valores, como estão no Instagram.",
        lista("precos.tabelas", function (t, i, c) {
          return campo(c + ".titulo", "Título") +
            '<div class="sub-lista">' + lista(c + ".imagens", function (im, j, cj) { return campoImg(cj + ".img", "Imagem " + (j + 1)); },
              function () { return { img: "", grande: "", w: 0, h: 0, gw: 0, gh: 0 }; }, "Adicionar imagem") + "</div>";
        }, function () { return { titulo: "Nova tabela", imagens: [] }; }, "Adicionar tabela"));
  }

  /* ----- 03 galeria ----- */
  function abaGaleria() {
    var tags = [];
    rascunho.galeria.forEach(function (o) { if (o.tag && tags.indexOf(o.tag) < 0) tags.push(o.tag); });
    var visiveis = rascunho.galeria.filter(function (o) { return o.visivel !== false; }).length;
    return secao("Galeria do portfólio", visiveis + " de " + rascunho.galeria.length + " artes aparecendo no site. A ordem aqui é a ordem do site.",
      '<label class="btn btn-pop upload-varios"><input type="file" accept="image/*" multiple data-galeria-upload hidden>Enviar artes do computador</label>' +
      '<datalist id="tags-galeria">' + tags.map(function (t) { return '<option value="' + esc(t) + '">'; }).join("") + "</datalist>" +
      lista("galeria", function (o, i, c) {
        var det = (o.detalhes || []).length;
        return '<div class="obra-adm' + (o.visivel === false ? " oculta" : "") + '">' + campoImg(c + ".img", "Arte") +
          linha(campo(c + ".titulo", "Título"), campo(c + ".tag", "Categoria", { lista: "tags-galeria", ajuda: "Vira um filtro no site." })) +
          campo(c + ".credito", "Crédito (opcional)", { placeholder: "Ex.: DTIYS de @fulana", ajuda: det ? det + (det === 1 ? " detalhe aparece" : " detalhes aparecem") + " na tela cheia desta arte." : "" }) +
          campo(c + ".visivel", "Aparecer no site", { tipo: "check" }) +
          (o.baixa ? '<p class="ajuda">Imagem pequena (veio do print do perfil): na tela cheia ela não é esticada. Troque pelo arquivo original quando puder.</p>' : "") + "</div>";
      }, function () { return { id: "arte" + Date.now(), img: "", grande: "", w: 0, h: 0, gw: 0, gh: 0, titulo: "Nova arte", tag: tags[0] || "Retratos", credito: "", detalhes: [], baixa: false, visivel: true }; }, "Adicionar arte por link") +
      linha(campo("portfolio.porPagina", "Artes por vez (antes do \"Carregar mais\")", { tipo: "number", min: 4 }), campo("portfolio.desafios", "Explicação do filtro Desafios", { tipo: "textarea", linhas: 3, largo: true })));
  }

  /* ----- 04 cenas ----- */
  function abaCenas() {
    var nomes = { portfolio: "Portfólio", agenda: "Agenda", encomendas: "Encomendas" };
    return secao("Abertura (primeira tela)", "A arte grande da vinheta, com o seu nome em letreiro por cima.",
        campoImg("cenas.abertura.img", "Imagem da abertura", "Prefira uma arte quadrada e bem colorida.") +
        campo("cenas.abertura.foco", "Parte da imagem em destaque", { tipo: "select", opcoes: opcoesFoco("cenas.abertura.foco") }) +
        campo("cenas.abertura.kicker", "Linha pequena acima do nome") +
        campo("cenas.abertura.legenda", "Texto curto abaixo da frase", { tipo: "textarea", linhas: 2 })) +
      ["portfolio", "agenda", "encomendas"].map(function (k) {
        var c = "cenas.paginas." + k;
        return secao("Topo da página " + nomes[k], "O cartão de título no alto da página e o cartão dela na \"Programação\" da página inicial.",
          campoImg(c + ".img", "Imagem") +
          campo(c + ".foco", "Parte da imagem em destaque", { tipo: "select", opcoes: opcoesFoco(c + ".foco") }) +
          linha(campo(c + ".ep", "Episódio"), campo(c + ".titulo", "Título")) +
          linha(campo(c + ".sub", "Frase curta", { largo: true }), campo(c + ".subEn", "Frase em inglês")));
      }).join("") +
      secao("Intervalo comercial", "A cena lilás no meio da página inicial.",
        campoImg("cenas.intervalo1.img", "Imagem") +
        linha(campo("cenas.intervalo1.selo", "Selo"), campo("cenas.intervalo1.titulo", "Palavra na explosão"), campo("cenas.intervalo1.botao", "Texto do botão")) +
        campo("cenas.intervalo1.frase", "Frase", { tipo: "textarea", linhas: 2 }) + campo("cenas.intervalo1.fraseEn", "Frase em inglês")) +
      secao("Cena de encerramento", "A arte em tela cheia antes dos créditos.",
        campoImg("cenas.intervalo2.img", "Imagem") +
        campo("cenas.intervalo2.foco", "Parte da imagem em destaque", { tipo: "select", opcoes: opcoesFoco("cenas.intervalo2.foco") }) +
        linha(campo("cenas.intervalo2.frase", "Frase grande"), campo("cenas.intervalo2.fraseEn", "Frase em inglês")) +
        campo("cenas.intervalo2.credito", "Legenda pequena"));
  }

  /* ----- 05 perfil ----- */
  function abaPerfil() {
    return secao("Perfil", "",
        campoImg("perfil.avatar", "Avatar") +
        linha(campo("perfil.nome", "Nome exibido"), campo("perfil.handle", "Arroba exibido")) +
        campo("perfil.titulo", "Título", { ajuda: "Aparece abaixo do nome, em letras maiúsculas." }) +
        linha(campo("perfil.frase", "Frase de destaque"), campo("perfil.fraseEn", "Frase em inglês")) +
        linha(campo("perfil.assinatura", "Frase dos créditos finais"), campo("perfil.selo", "Selo (feito à mão)"))) +
      secao("Contato das encomendas", "Se o WhatsApp ficar vazio, o pedido vai pela DM do Instagram (com o resumo copiado).",
        linha(campo("perfil.instagram", "Usuário do Instagram", { placeholder: "drawikky" }),
              campo("perfil.whatsapp", "WhatsApp com DDD", { placeholder: "5569999999999", ajuda: "Só números, com 55 + DDD." }))) +
      secao("Destaques (prova social)", "A faixa azul abaixo da abertura e os cartões coloridos do \"quem sou\".",
        lista("provas", function (x, i, c) { return linha(campo(c + ".numero", "Destaque"), campo(c + ".texto", "Texto", { largo: true })); },
          function () { return { numero: "Novo", texto: "" }; }, "Adicionar destaque")) +
      secao("Quem sou", "",
        campoImg("sobre.imagem", "Imagem") +
        linha(campo("sobre.ep", "Episódio"), campo("sobre.titulo", "Título"), campo("sobre.tituloEn", "Título em inglês")) +
        campo("sobre.saudacao", "Saudação") +
        campo("sobre.texto", "Texto", { tipo: "textarea", linhas: 5 }) +
        campo("sobre.texto2", "Segundo parágrafo (opcional)", { tipo: "textarea", linhas: 3 }));
  }

  /* ----- 06 links ----- */
  function abaLinks() {
    var icones = Object.keys(ICONES).map(function (k) { return { v: k, t: ICONES[k].nome }; });
    return secao("Canais (links)", "Os cartões \"Canal 01, 02...\" da página inicial. Para levar a uma página do site, use encomendas.html, agenda.html ou portfolio.html.",
      lista("links", function (l, i, c) {
        return '<div class="link-adm"><span class="link-ico">' + iconeSvg(l.icone) + "</span><div>" +
          linha(campo(c + ".nome", "Nome"), campo(c + ".icone", "Ícone", { tipo: "select", opcoes: icones })) +
          campo(c + ".desc", "Descrição") + campo(c + ".url", "Link") + campo(c + ".visivel", "Aparecer no site", { tipo: "check" }) + "</div></div>";
      }, function () { return { nome: "Novo link", desc: "", url: "https://", icone: "link", visivel: true }; }, "Adicionar link"));
  }

  /* ----- 07 perguntas ----- */
  function abaPerguntas() {
    return secao("Perguntas frequentes", "Aparecem no fim da página de encomendas.",
      lista("faq", function (f, i, c) {
        return campo(c + ".p", "Pergunta") + campo(c + ".r", "Resposta", { tipo: "textarea", linhas: 3 });
      }, function () { return { p: "Nova pergunta?", r: "" }; }, "Adicionar pergunta"));
  }

  /* ----- 08 aparência ----- */
  var PALETAS = {
    "Sábado de manhã (padrão)": PADRAO.aparencia.cores,
    "Esboços coloridos": { laranja: "#3E8FC4", rosa: "#F27BB0", lavanda: "#C98FD8", ceu: "#7FC9D3", amarelo: "#F4EA4C", creme: "#FFE5E6", noite: "#16365E" },
    "Noite estrelada": { laranja: "#3B3FB6", rosa: "#F48FD0", lavanda: "#9C8CF0", ceu: "#5BC8F5", amarelo: "#FFD84D", creme: "#F1ECFF", noite: "#14154A" },
    "Game over": { laranja: "#C6A6FF", rosa: "#FF8FC6", lavanda: "#B7A3F5", ceu: "#9FD3FF", amarelo: "#FFE58A", creme: "#FBF3FF", noite: "#3A2A6B" }
  };
  var NOMES_CORES = {
    laranja: ["Tangerina", "Fundo da abertura e do topo de Encomendas"],
    rosa: ["Rosa chiclete", "Botões, sombras dos letreiros e vagas preenchidas"],
    lavanda: ["Lavanda", "Intervalo comercial e topo da Agenda"],
    ceu: ["Azul-céu", "Ícones, etapas da fila e entregas"],
    amarelo: ["Amarelo", "Etiquetas, seleção e números de destaque"],
    creme: ["Creme", "Letras dos letreiros e fundo claro"],
    noite: ["Azul-noite", "Contornos, textos e fundo escuro"]
  };
  function abaAparencia() {
    var ap = rascunho.aparencia;
    var paletas = '<div class="paletas">' + Object.keys(PALETAS).map(function (nome) {
      var p = PALETAS[nome];
      return '<button type="button" class="paleta" data-paleta="' + esc(nome) + '"><span class="paleta-cores">' +
        TEMA_CORES.map(function (k) { return '<i style="background:' + p[k] + '"></i>'; }).join("") +
        "</span><b>" + esc(nome) + "</b></button>";
    }).join("") + "</div>";
    var cores = '<div class="grade-cores">' + Object.keys(NOMES_CORES).map(function (k) {
      return campo("aparencia.cores." + k, NOMES_CORES[k][0], { tipo: "cor", ajuda: NOMES_CORES[k][1] });
    }).join("") + "</div>";
    function fonte(papel, rotulo, amostra, classe) {
      var atual = ap.fontes[papel];
      return '<div class="fonte-escolha">' + campo("aparencia.fontes." + papel, rotulo, { tipo: "select", opcoes: OPCOES_FONTES[papel].map(function (f) { return { v: f, t: f }; }) }) +
        '<p class="amostra ' + classe + '" style="font-family:\'' + esc(atual) + '\'">' + amostra + "</p></div>";
    }
    return secao("Paletas prontas", "Tiradas das suas artes. Um clique troca todas as cores; dá pra ajustar uma por uma logo abaixo.", paletas) +
      secao("Cores", "", cores) +
      secao("Fontes", "",
        fonte("letreiro", "Letreiro (seu nome e títulos grandes)", "Encomendas abertas!!", "am-letreiro") +
        fonte("texto", "Texto (tudo o que se lê)", "Curte meus desenhos? Tenha um só seu!", "am-texto") +
        fonte("selo", "Selo (etiquetas pequenas, como \"Game over\")", "Ep. 01 · no ar", "am-selo")) +
      secao("Efeitos", "",
        campo("aparencia.efeitos.padrao", "Padrão de quadrifólios nos fundos coloridos (como nas suas tabelas)", { tipo: "check" }) +
        campo("aparencia.efeitos.contorno", "Contorno e sombra nos letreiros (como \"Encomendas abertas!!\")", { tipo: "check" }) +
        campo("aparencia.efeitos.adesivos", "Adesivos decorativos (raios e brilhos)", { tipo: "check" }) +
        linha(campo("aparencia.movimento", "Animações", { tipo: "select", opcoes: [{ v: "normal", t: "Normais (entram uma vez)" }, { v: "suave", t: "Suaves" }, { v: "desligado", t: "Desligadas" }] }),
              campo("aparencia.tema", "Tema de quem visita", { tipo: "select", opcoes: [{ v: "auto", t: "Igual ao celular/computador da pessoa" }, { v: "escuro", t: "Sempre escuro" }, { v: "claro", t: "Sempre claro" }] })));
  }

  /* ----- 09 backup ----- */
  function abaBackup() {
    var kb = Math.round(JSON.stringify(rascunho).length / 1024);
    return secao("Cópia de segurança", "Baixe um arquivo com tudo o que está no site (textos, preços, agenda, imagens enviadas). Guarde antes de grandes mudanças.",
        '<div class="botoes"><button type="button" class="btn btn-pop" data-exportar>Baixar cópia (.json)</button>' +
        '<label class="btn"><input type="file" accept="application/json,.json" data-importar hidden>Restaurar de um arquivo</label></div>') +
      secao("Espaço usado", "", '<p class="uso"><b>' + kb + " KB</b> de cerca de 5.000 KB. Imagens enviadas do computador ocupam mais espaço que imagens por link.</p>") +
      secao("Voltar ao começo", "Apaga todas as mudanças e volta o site para a versão entregue.",
        '<button type="button" class="btn perigo" data-restaurar>Restaurar versão original</button>');
  }

  /* ===================== mudanças ===================== */
  function marcarSujo() { sujo = true; $("#salvar").classList.add("ativa"); $("#salvar").setAttribute("aria-hidden", "false"); }
  function limparSujo() { sujo = false; $("#salvar").classList.remove("ativa"); $("#salvar").setAttribute("aria-hidden", "true"); }
  var timerToast;
  function toast(txt, erro) {
    var t = $("#toast");
    t.textContent = txt;
    t.className = "aviso-site visivel" + (erro ? " erro" : "");
    clearTimeout(timerToast);
    timerToast = setTimeout(function () { t.className = "aviso-site"; }, erro ? 6000 : 2800);
  }

  /* quando a imagem muda, o tamanho guardado deixa de valer: atualiza ou zera */
  function imagemMudou(caminho, url, w, h) {
    var p = pai(caminho), dono = get(p);
    if (!dono || typeof dono !== "object") return;
    var campoUrl = caminho.split(".").pop();
    if (campoUrl !== "img" && campoUrl !== "imagem") return;
    if ("grande" in dono) { dono.grande = url; dono.gw = w || 0; dono.gh = h || 0; }
    if ("w" in dono) { dono.w = w || 0; dono.h = h || 0; }
    if ("baixa" in dono) dono.baixa = false;
  }

  function aoMudarCampo(el) {
    var caminho = el.dataset.k, tipo = el.dataset.tipo, v;
    if (tipo === "bool") v = el.checked;
    else if (tipo === "num") v = el.value === "" ? 0 : Number(el.value);
    else v = el.value;
    set(caminho, v);
    if (el.hasAttribute("data-img-link")) imagemMudou(caminho, v, 0, 0);
    marcarSujo();
    if (tipo === "cor") { var hex = document.querySelector('[data-hex="' + caminho + '"]'); if (hex) hex.value = v; }
    if (caminho.indexOf("aparencia.") === 0) temaAplicar(rascunho);
    if (el.tagName === "SELECT" || tipo === "bool" || caminho.indexOf("aparencia.fontes") === 0) render();
  }

  /* imagens enviadas: reduz pra no máximo `max` px e vira texto (data URL) pra caber no navegador */
  var webpOk = (function () { try { return document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0; } catch (e) { return false; } })();
  function processarImagem(arquivo, max) {
    return new Promise(function (ok, falha) {
      var url = URL.createObjectURL(arquivo), im = new Image();
      im.onload = function () {
        var f = Math.min(1, max / Math.max(im.width, im.height));
        var c = document.createElement("canvas");
        c.width = Math.round(im.width * f); c.height = Math.round(im.height * f);
        var ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
        ctx.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        ok({ url: c.toDataURL(webpOk ? "image/webp" : "image/jpeg", 0.84), w: c.width, h: c.height });
      };
      im.onerror = function () { URL.revokeObjectURL(url); falha(new Error("Não consegui abrir essa imagem.")); };
      im.src = url;
    });
  }

  function baixar(nome, texto) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
    a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
  }

  function ligarEventos() {
    var aba = $("#aba");
    aba.addEventListener("input", function (e) {
      var el = e.target;
      if (el.dataset.k && el.tagName !== "SELECT" && el.type !== "checkbox") aoMudarCampo(el);
      if (el.dataset.hex && /^#[0-9a-f]{6}$/i.test(el.value)) {
        set(el.dataset.hex, el.value); marcarSujo(); temaAplicar(rascunho);
        var cor = document.querySelector('[data-k="' + el.dataset.hex + '"]'); if (cor) cor.value = el.value;
      }
    });
    aba.addEventListener("change", function (e) {
      var el = e.target;
      if (el.dataset.k && (el.tagName === "SELECT" || el.type === "checkbox")) aoMudarCampo(el);
      /* campos de texto: ao sair do campo, redesenha pra atualizar miniaturas, títulos e vagas */
      else if (el.dataset.k && (el.hasAttribute("data-img-link") || /^agenda\.sessoes\.\d+\.(abre|vagas)$/.test(el.dataset.k) || /^precos\.enquadramentos\.\d+\.nome$/.test(el.dataset.k))) render();

      if (el.dataset.img && el.files[0]) {
        var grande = /^cenas\.|sobre\.imagem|galeria|tabelas/.test(el.dataset.img);
        processarImagem(el.files[0], grande ? 1600 : 900).then(function (r) {
          set(el.dataset.img, r.url); imagemMudou(el.dataset.img, r.url, r.w, r.h); marcarSujo(); render(); toast("Imagem carregada. Lembre de salvar.");
        }).catch(function (err) { toast(err.message, true); });
      }
      if (el.hasAttribute("data-galeria-upload") && el.files.length) {
        var arquivos = Array.prototype.slice.call(el.files);
        Promise.all(arquivos.map(function (f) { return processarImagem(f, 1600); })).then(function (rs) {
          rs.forEach(function (r, i) {
            rascunho.galeria.unshift({ id: "arte" + Date.now() + i, img: r.url, grande: r.url, w: r.w, h: r.h, gw: r.w, gh: r.h, titulo: arquivos[i].name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), tag: "Retratos", credito: "", detalhes: [], baixa: false, visivel: true });
          });
          marcarSujo(); render(); toast(rs.length + (rs.length === 1 ? " arte adicionada" : " artes adicionadas") + " no topo da galeria.");
        }).catch(function (err) { toast(err.message, true); });
      }
      if (el.hasAttribute("data-importar") && el.files[0]) {
        el.files[0].text().then(function (txt) {
          var dados = JSON.parse(txt);
          if (!dados || !dados.perfil || !dados.precos) throw new Error("Esse arquivo não parece uma cópia do site.");
          rascunho = mesclar(copiaProfunda(PADRAO), dados);
          marcarSujo(); temaAplicar(rascunho); render(); toast("Cópia carregada. Confira e clique em Salvar.");
        }).catch(function (err) { toast("Não deu pra restaurar: " + err.message, true); });
      }
    });

    aba.addEventListener("click", function (e) {
      var b;
      if ((b = e.target.closest("[data-add]"))) { get(b.dataset.add).push(NOVOS[b.dataset.add]()); marcarSujo(); render(); return; }
      if ((b = e.target.closest("[data-mover]"))) {
        var arr = get(b.dataset.l), i = Number(b.dataset.i), j = i + Number(b.dataset.mover);
        if (j < 0 || j >= arr.length) return;
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t; marcarSujo(); render(); return;
      }
      if ((b = e.target.closest("[data-remover]"))) {
        if (!confirm("Remover este item?")) return;
        get(b.dataset.l).splice(Number(b.dataset.i), 1); marcarSujo(); render(); return;
      }
      if ((b = e.target.closest("[data-vaga]"))) {
        var ses = rascunho.agenda.sessoes[Number(b.dataset.vaga)];
        ses.ocupadas = Math.max(0, Math.min(Number(ses.vagas) || 0, (Number(ses.ocupadas) || 0) + Number(b.dataset.d)));
        marcarSujo(); render(); return;
      }
      if ((b = e.target.closest("[data-limpar-img]"))) { set(b.dataset.limparImg, ""); imagemMudou(b.dataset.limparImg, "", 0, 0); marcarSujo(); render(); return; }
      if ((b = e.target.closest("[data-paleta]"))) {
        rascunho.aparencia.cores = copiaProfunda(PALETAS[b.dataset.paleta]); marcarSujo(); temaAplicar(rascunho); render();
        toast("Paleta aplicada no painel. Salve pra levar pro site."); return;
      }
      if (e.target.closest("[data-exportar]")) { baixar("site-drawikky-" + hojeTxt() + ".json", JSON.stringify(rascunho, null, 2)); return; }
      if (e.target.closest("[data-restaurar]")) {
        if (!confirm("Isso apaga todas as mudanças feitas no painel e volta o site para a versão original. Continuar?")) return;
        lojaRestaurarPadrao(); SITE = lojaCarregar(); rascunho = copiaProfunda(SITE); limparSujo(); temaAplicar(rascunho); render();
        toast("Site restaurado para a versão original.");
      }
    });

    $("#abas").addEventListener("click", function (e) {
      var b = e.target.closest("[data-aba]");
      if (!b) return;
      abaAtual = b.dataset.aba;
      renderAbas(); render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    function salvar() {
      try {
        lojaSalvar(rascunho);
        SITE = copiaProfunda(rascunho);
        limparSujo();
        toast("Salvo! O site já mostra as mudanças.");
      } catch (err) { toast(err.message, true); }
    }
    $("#salvar-btn").addEventListener("click", salvar);
    $("#descartar").addEventListener("click", function () {
      rascunho = copiaProfunda(SITE); limparSujo(); temaAplicar(rascunho); render(); toast("Mudanças descartadas.");
    });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && !$("#painel").hidden) { e.preventDefault(); if (sujo) salvar(); }
    });
    window.addEventListener("beforeunload", function (e) { if (sujo) { e.preventDefault(); e.returnValue = ""; } });
  }

  /* ===================== login ===================== */
  function logado() { try { return sessionStorage.getItem(CHAVE_SESSAO) === "1"; } catch (e) { return false; } }
  function mostrar() {
    var ok = logado();
    $("#login").hidden = ok;
    $("#painel").hidden = !ok;
    document.body.classList.toggle("em-login", !ok);
    if (ok) { renderAbas(); render(); }
  }
  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var u = $("#login-usuario").value.trim().toLowerCase(), s = $("#login-senha").value;
    if (u === USUARIO && s === SENHA) {
      try { sessionStorage.setItem(CHAVE_SESSAO, "1"); } catch (err) {}
      $("#login-erro").hidden = true;
      mostrar();
    } else {
      $("#login-erro").hidden = false;
    }
  });
  $("#sair").addEventListener("click", function () {
    if (sujo && !confirm("Tem mudanças não salvas. Sair mesmo assim?")) return;
    try { sessionStorage.removeItem(CHAVE_SESSAO); } catch (err) {}
    limparSujo(); rascunho = copiaProfunda(SITE);
    mostrar();
  });

  /* o painel carrega todas as fontes oferecidas, pra comparar antes de escolher */
  (function carregarTodasAsFontes() {
    var familias = [];
    Object.keys(OPCOES_FONTES).forEach(function (k) { OPCOES_FONTES[k].forEach(function (f) { if (familias.indexOf(f) < 0) familias.push(f); }); });
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?" + familias.map(function (f) { return "family=" + f.replace(/ /g, "+"); }).join("&") + "&display=swap";
    document.head.appendChild(l);
  })();

  ligarEventos();
  mostrar();
})();

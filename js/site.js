"use strict";

/*
 * Desenha as páginas públicas a partir de SITE (carregado em js/tema.js).
 * Cada função só roda se a página tiver o lugar dela — assim o mesmo arquivo
 * serve pra Início, Portfólio, Agenda e Encomendas.
 */

/* ===== contato: WhatsApp se tiver número, senão DM do Instagram ===== */
function contatoTemWhats() { return !!String(SITE.perfil.whatsapp || "").replace(/\D/g, ""); }
function contatoLink(texto) {
  var num = String(SITE.perfil.whatsapp || "").replace(/\D/g, "");
  if (num) return "https://wa.me/" + num + (texto ? "?text=" + encodeURIComponent(texto) : "");
  return "https://ig.me/m/" + encodeURIComponent(SITE.perfil.instagram || "");
}
function instagramUrl() { return "https://www.instagram.com/" + encodeURIComponent(SITE.perfil.instagram || "") + "/"; }

function copiarTexto(txt) {
  return new Promise(function (ok, falha) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, tentar);
    else tentar();
    function tentar() {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? ok() : falha(new Error("cópia recusada")); } catch (e) { falha(e); }
      document.body.removeChild(ta);
    }
  });
}

/* manda uma mensagem pronta: no WhatsApp vai escrita; na DM do Instagram
   (que não aceita texto pronto) copia antes e avisa "é só colar" */
function enviarMensagem(txt) {
  var link = contatoLink(txt);
  if (contatoTemWhats()) { window.open(link, "_blank", "noopener"); return; }
  copiarTexto(txt).then(function () { avisoSite("Mensagem copiada! Na DM que vai abrir, é só colar e enviar ✦"); },
    function () { avisoSite("Não deu pra copiar sozinho: escreva sua mensagem na DM que vai abrir."); });
  window.open(link, "_blank", "noopener");
}

var timerAviso;
function avisoSite(txt) {
  var el = document.getElementById("aviso-site");
  if (!el) return;
  el.textContent = txt;
  el.classList.add("visivel");
  clearTimeout(timerAviso);
  timerAviso = setTimeout(function () { el.classList.remove("visivel"); }, 5000);
}

var TITULOS_ESTADO = { aberta: "Encomendas abertas", esgotado: "Vagas esgotadas", fechada: "Encomendas fechadas" };
function etiquetaHtml(estado) {
  var txt = (SITE.agenda.etiquetas || {})[estado] || TITULOS_ESTADO[estado];
  return '<span class="etq etq-' + estado + '">' + esc(txt) + "</span>";
}
function msgAvisar() { return "Oi, Drawikky! Quero ser avisada(o) quando a próxima agenda de encomendas abrir ✨"; }

var TIPOS_EVENTO = {
  abertura: { nome: "Abertura", cor: "var(--rosa)" },
  entrega: { nome: "Entrega", cor: "var(--ceu)" },
  aviso: { nome: "Aviso", cor: "var(--amarelo)" },
  fechamento: { nome: "Pausa", cor: "var(--lavanda)" }
};

/* separador com espaço dos dois lados (sem isso a linha vira uma palavra só e estoura no celular) */
var SEP = ' <span class="sep" aria-hidden="true">&#10022;</span> ';

var Site = (function () {
  var $ = function (s) { return document.querySelector(s); };
  var tem = function (s) { return !!document.querySelector(s); };
  var filtroAtual = "Todos";
  var mostrando = 0;
  var mesCal = null;
  var pagina = document.body.dataset.pagina;

  function img(url) { return urlSegura(url, true); }
  function setImg(el, src, w, h, alt) {
    if (!el) return;
    var s = img(src);
    if (s && el.getAttribute("src") !== s) el.src = s;
    if (w && h) { el.width = w; el.height = h; }
    if (alt != null) el.alt = alt;
  }

  /* ===== comum ===== */
  function renderComum() {
    var p = SITE.perfil;
    var a = img(p.avatar) || "assets/avatar.webp";
    Array.prototype.forEach.call(document.querySelectorAll(".js-avatar"), function (el) { el.src = a; });
    Array.prototype.forEach.call(document.querySelectorAll(".js-nome"), function (el) { el.textContent = p.nome; });
    if (tem("#rod-nome")) {
      $("#rod-assinatura").textContent = p.assinatura || "";
      $("#rod-nome").textContent = p.nome;
      $("#rod-ig").href = instagramUrl();
      $("#rod-ig").textContent = "@" + p.instagram;
      $("#rod-selo").innerHTML = DECOR.semIa("selo-mini") + "<span>" + esc(p.selo) + "</span>";
    }
  }

  function renderCabecalho() {
    if (!tem("#cabecalho")) return;
    var c = (SITE.cenas.paginas || {})[pagina] || {};
    $("#cab-ep").textContent = c.ep || "";
    $("#cab-titulo").textContent = c.titulo || "";
    $("#cab-sub").textContent = c.sub || "";
    $("#cab-en").textContent = c.subEn ? "· " + c.subEn : "";
    var im = $("#cab-img");
    setImg(im, c.img, c.w, c.h, "Arte da " + SITE.perfil.nome);
    im.style.objectPosition = c.foco || "50% 40%";
  }

  /* ===== início ===== */
  function renderAbertura() {
    if (!tem("#abertura")) return;
    var c = SITE.cenas.abertura, p = SITE.perfil;
    $("#ab-decor").innerHTML = DECOR.explosao("ab-explosao", 16) + DECOR.raio("ab-raio ab-raio-1 adesivo") + DECOR.raio("ab-raio ab-raio-2 adesivo") +
      DECOR.brilho("ab-brilho ab-brilho-1 adesivo") + DECOR.brilho("ab-brilho ab-brilho-2 adesivo") + DECOR.brilho("ab-brilho ab-brilho-3 adesivo");
    $("#ab-kicker").textContent = c.kicker || "";
    $("#ab-nome").textContent = p.nome;
    $("#ab-titulo").textContent = p.titulo;
    $("#ab-frase").textContent = p.frase;
    $("#ab-frase-en").textContent = p.fraseEn || "";
    $("#ab-legenda").textContent = c.legenda || "";
    var im = $("#ab-img");
    setImg(im, c.img, c.w, c.h, "Arte da " + p.nome);
    im.style.objectPosition = c.foco || "50% 40%";
    $("#ab-selo").innerHTML = DECOR.semIa("selo-svg") + '<span class="t-selo">' + esc(p.selo) + "</span>";
    var ag = estadoAgenda();
    $("#ab-status").innerHTML = '<a href="agenda.html" aria-label="' + esc(TITULOS_ESTADO[ag.estado]) + ', ver agenda">' + etiquetaHtml(ag.estado) + "</a>" +
      '<span class="ab-status-txt">' + esc(textoCurtoAgenda(ag)) + "</span>";
  }

  function textoCurtoAgenda(ag) {
    if (ag.estado === "aberta") return ag.atual.livres + (ag.atual.livres === 1 ? " vaga livre" : " vagas livres") + " · " + ag.atual.sessao.nome;
    if (ag.proxima) return "Próxima: " + ag.proxima.sessao.nome + ", abre " + dataExtenso(ag.proxima.abre);
    return ag.estado === "esgotado" ? "Fica de olho na próxima abertura" : "Fica de olho no Instagram";
  }

  function renderFaixa() {
    if (!tem("#faixa")) return;
    var itens = (SITE.provas || []).map(function (x) { return "<span><b>" + esc(x.numero) + "</b> " + esc(x.texto) + "</span>"; });
    itens.push("<span>" + esc(SITE.perfil.selo) + "</span>");
    $("#faixa").innerHTML = '<p class="faixa-in">' + itens.join(SEP) + "</p>";
  }

  function renderLinks() {
    if (!tem("#links")) return;
    var n = 0;
    $("#links").innerHTML = SITE.links.filter(function (l) { return l.visivel !== false; }).map(function (l) {
      var url = urlSegura(l.url) || "#";
      var externo = /^https?:/i.test(url);
      n++;
      return '<a class="canal surge" href="' + esc(url) + '"' + (externo ? ' target="_blank" rel="noopener"' : "") + ">" +
        '<span class="canal-n t-selo">Canal ' + String(n).padStart(2, "0") + "</span>" +
        '<span class="canal-ico">' + iconeSvg(l.icone) + "</span>" +
        '<span class="canal-txt"><span class="canal-nome">' + esc(l.nome) + '</span><span class="canal-desc">' + esc(l.desc) + "</span></span>" +
        '<span class="canal-seta" aria-hidden="true">' + (externo ? "&#8599;" : "&#8594;") + "</span></a>";
    }).join("");
  }

  function renderQuemSou() {
    if (!tem("#quem-sou")) return;
    var s = SITE.sobre;
    setImg($("#qs-img"), s.imagem, s.w, s.h, "Arte da " + SITE.perfil.nome);
    $("#qs-raio").innerHTML = DECOR.raio("");
    $("#qs-ep").textContent = s.ep || "";
    $("#qs-titulo").textContent = s.titulo || "";
    $("#qs-titulo-en").textContent = s.tituloEn ? "· " + s.tituloEn : "";
    $("#qs-saudacao").textContent = s.saudacao || "";
    $("#qs-texto").textContent = s.texto || "";
    var t2 = $("#qs-texto2");
    t2.textContent = s.texto2 || "";
    t2.hidden = !s.texto2;
    $("#qs-provas").innerHTML = (SITE.provas || []).map(function (x, i) {
      return '<li class="prova prova-' + (i % 3) + ' surge"><b>' + esc(x.numero) + "</b><span>" + esc(x.texto) + "</span></li>";
    }).join("");
  }

  function renderIntervalos() {
    if (tem("#intervalo1")) {
      var c = SITE.cenas.intervalo1;
      var im = $("#iv1-img");
      setImg(im, c.img, c.w, c.h, "Arte da " + SITE.perfil.nome);
      $("#iv1-selo").textContent = c.selo || "";
      $("#iv1-explosao").innerHTML = DECOR.explosao("", 14);
      $("#iv1-titulo").textContent = c.titulo || "";
      $("#iv1-frase").textContent = c.frase || "";
      $("#iv1-en").textContent = c.fraseEn || "";
      $("#iv1-botao").textContent = c.botao || "Encomendar";
    }
    if (tem("#intervalo2")) {
      var d = SITE.cenas.intervalo2;
      var f = $("#iv2-img");
      f.style.backgroundImage = "url('" + img(d.img) + "')";
      f.style.backgroundPosition = d.foco || "50% 40%";
      f.setAttribute("aria-label", "Arte da " + SITE.perfil.nome + (d.credito ? " (" + d.credito + ")" : ""));
      $("#iv2-frase").textContent = d.frase || "";
      $("#iv2-en").textContent = d.fraseEn || "";
      $("#iv2-cred").textContent = d.credito || "";
    }
  }

  function precoMinimo() {
    var v = [];
    (SITE.precos.tipos || []).forEach(function (t) { Object.keys(t.precos || {}).forEach(function (k) { if (Number(t.precos[k]) > 0) v.push(Number(t.precos[k])); }); });
    return v.length ? Math.min.apply(null, v) : 0;
  }

  function renderChamadas() {
    if (!tem("#chamadas")) return;
    var pg = SITE.cenas.paginas || {};
    var ag = estadoAgenda();
    var cartoes = [
      { href: "portfolio.html", c: pg.portfolio, extra: obrasVisiveis().length + " artes no ar" },
      { href: "agenda.html", c: pg.agenda, extra: textoCurtoAgenda(ag), etq: etiquetaHtml(ag.estado) },
      { href: "encomendas.html", c: pg.encomendas, extra: "a partir de " + brl(precoMinimo()) }
    ];
    $("#chamadas").innerHTML = cartoes.map(function (k) {
      var c = k.c || {};
      return '<a class="ch surge" href="' + k.href + '">' +
        '<span class="ch-tela"><img src="' + esc(img(c.img)) + '" width="' + (Number(c.w) || 1080) + '" height="' + (Number(c.h) || 1080) + '" alt="" loading="lazy" style="object-position:' + esc(c.foco || "50% 40%") + '"></span>' +
        '<span class="ch-txt"><span class="t-selo ch-ep">' + esc(c.ep) + "</span>" + (k.etq || "") +
        '<span class="t-letreiro ch-titulo">' + esc(c.titulo) + "</span>" +
        '<span class="ch-sub">' + esc(c.sub) + "</span>" +
        '<span class="ch-extra">' + esc(k.extra) + ' <b aria-hidden="true">&#8594;</b></span></span></a>';
    }).join("");
  }

  /* ===== portfólio ===== */
  function obrasVisiveis() { return SITE.galeria.filter(function (o) { return o.visivel !== false && img(o.img); }); }
  function obrasFiltradas() {
    return obrasVisiveis().filter(function (o) { return filtroAtual === "Todos" || o.tag === filtroAtual; });
  }
  function porPagina() { return Math.max(4, Number((SITE.portfolio || {}).porPagina) || 12); }

  function cartaoObra(o, i) {
    var w = Number(o.w) || 600, h = Number(o.h) || 750;
    return '<button type="button" class="obra surge" data-i="' + i + '" aria-label="Ver ' + esc(o.titulo || "arte") + ' em tela cheia">' +
      '<img src="' + esc(img(o.img)) + '" width="' + w + '" height="' + h + '" alt="' + esc(o.titulo || "Arte da Drawikky") + '" loading="lazy">' +
      '<span class="obra-leg"><span class="t-selo">' + esc(o.tag) + "</span><b>" + esc(o.titulo) + "</b></span>" +
      ((o.detalhes || []).length ? '<span class="obra-mais t-selo" aria-hidden="true">+' + o.detalhes.length + "</span>" : "") + "</button>";
  }

  function renderGaleria(manter) {
    if (!tem("#galeria")) return;
    var obras = obrasVisiveis();
    var tags = ["Todos"];
    obras.forEach(function (o) { if (o.tag && tags.indexOf(o.tag) < 0) tags.push(o.tag); });
    if (tags.indexOf(filtroAtual) < 0) filtroAtual = "Todos";
    $("#filtros").innerHTML = tags.map(function (t) {
      var n = t === "Todos" ? obras.length : obras.filter(function (o) { return o.tag === t; }).length;
      return '<button type="button" class="filtro" data-tag="' + esc(t) + '" aria-pressed="' + (t === filtroAtual) + '">' + esc(t) + ' <small>' + n + "</small></button>";
    }).join("");
    var lista = obrasFiltradas();
    if (!manter) mostrando = Math.min(lista.length, porPagina());
    mostrando = Math.min(Math.max(mostrando, Math.min(lista.length, porPagina())), lista.length);
    $("#galeria").innerHTML = lista.slice(0, mostrando).map(cartaoObra).join("");
    var mais = $("#gal-mais");
    mais.hidden = mostrando >= lista.length;
    $("#gal-conta").textContent = "Mostrando " + mostrando + " de " + lista.length + (lista.length === 1 ? " arte" : " artes");
    var nota = $("#gal-nota");
    var txtDesafio = (SITE.portfolio || {}).desafios || "";
    nota.hidden = !(filtroAtual === "Desafios" && txtDesafio);
    nota.textContent = txtDesafio;
    $("#gal-ig").href = instagramUrl();
    Tela.observar();
  }

  function abrirObra(i, origem) {
    var lista = obrasFiltradas();
    Tela.abrir(lista.map(function (o) {
      return {
        src: img(o.grande) || img(o.img), thumb: img(o.img), w: Number(o.gw) || Number(o.w), h: Number(o.gh) || Number(o.h), baixa: !!o.baixa,
        titulo: o.titulo, sub: [o.tag, o.credito].filter(Boolean).join(" · "),
        detalhes: (o.detalhes || []).map(function (d) { return { src: img(d.grande) || img(d.img), thumb: img(d.img), w: Number(d.w), h: Number(d.h) }; })
      };
    }), i, origem);
  }

  /* ===== agenda ===== */
  function coracao(cheio) {
    return '<svg viewBox="0 0 24 24" class="vaga ' + (cheio ? "vaga-cheia" : "vaga-livre") + '" aria-hidden="true"><path d="M12 20.5s-8-4.9-8-10.9A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8 3c0 6-8 10.9-8 10.9z"/></svg>';
  }
  function vagasHtml(ocupadas, total) {
    var h = "";
    for (var i = 0; i < total; i++) h += coracao(i < ocupadas);
    return '<div class="vagas" role="img" aria-label="' + ocupadas + " de " + total + ' vagas preenchidas">' + h + "</div>";
  }
  function ctaAvisar(classe) {
    return '<button type="button" class="btn ' + (classe || "") + '" data-avisar>Me avisa quando abrir</button>';
  }

  function renderStatus() {
    if (!tem("#agenda-status")) return;
    var ag = estadoAgenda(), a = SITE.agenda;
    var esq, dir = "";
    if (ag.estado === "aberta") {
      esq = '<div class="st-num"><span class="t-selo">vagas livres</span><strong>' + ag.atual.livres + "</strong><small>de " + ag.atual.vagas + " · " + esc(ag.atual.sessao.nome) + "</small></div>";
      dir = '<div class="st-num"><span class="t-selo">preenchidas</span>' + vagasHtml(ag.atual.ocupadas, ag.atual.vagas) + "<small>" + ag.atual.ocupadas + " de " + ag.atual.vagas + "</small></div>";
    } else {
      if (ag.proxima && a.mostrarContagem) {
        var d = diasAte(ag.proxima.abre);
        esq = '<div class="st-num"><span class="t-selo">próxima agenda abre em</span><strong>' + (d === 0 ? "hoje" : d) + "</strong><small>" + (d === 0 ? "" : (d === 1 ? "dia · " : "dias · ")) + esc(dataExtenso(ag.proxima.abre)) + "</small></div>";
      } else if (ag.proxima) {
        esq = '<div class="st-num"><span class="t-selo">próxima agenda</span><strong>' + String(ag.proxima.abre.getDate()).padStart(2, "0") + "/" + String(ag.proxima.abre.getMonth() + 1).padStart(2, "0") + "</strong><small>" + esc(dataExtenso(ag.proxima.abre)) + "</small></div>";
      } else {
        esq = '<div class="st-num"><span class="t-selo">próxima agenda</span><strong class="st-breve">em breve</strong><small>fique de olho no Instagram</small></div>';
      }
      if (ag.proxima) dir = '<div class="st-num"><span class="t-selo">' + esc(ag.proxima.sessao.nome) + "</span>" + vagasHtml(0, ag.proxima.vagas) + "<small>" + ag.proxima.vagas + " vagas</small></div>";
    }
    var ctas = ag.estado === "aberta"
      ? '<a class="btn btn-pop" href="encomendas.html">Garantir minha vaga</a><a class="btn" href="' + esc(contatoLink("")) + '" target="_blank" rel="noopener">Tirar dúvida</a>'
      : ctaAvisar("btn-pop") + '<a class="btn" href="encomendas.html">Simular meu pedido</a>';

    $("#agenda-status").className = "st st-" + ag.estado;
    $("#agenda-status").innerHTML =
      (ag.estado === "esgotado" ? '<span class="carimbo" aria-hidden="true">' + DECOR.explosao("carimbo-fundo", 12) + "<span>" + esc((a.etiquetas || {}).esgotado || "Esgotado!") + "</span></span>" : "") +
      '<div class="st-topo"><span class="t-selo st-aovivo">' + (ag.estado === "aberta" ? "ao vivo" : "programação") + "</span>" + etiquetaHtml(ag.estado) + "</div>" +
      '<h2 class="t-letreiro st-titulo">' + esc(TITULOS_ESTADO[ag.estado]) + "</h2>" +
      '<p class="st-aviso">' + esc((a.avisos || {})[ag.estado] || "") + "</p>" +
      '<div class="st-numeros">' + esq + dir + "</div>" +
      '<div class="st-ctas">' + ctas + "</div>" +
      (ag.estado !== "aberta" ? '<p class="st-nota">O botão copia a mensagem e abre a minha DM: é só colar e enviar.</p>' : "");
  }

  var NOMES_SESSAO = { aberta: "Aberta", esgotado: "Esgotado", embreve: "Em breve", encerrada: "Encerrada" };
  function renderSessoes() {
    if (!tem("#agenda-sessoes")) return;
    var lista = sessoesOrdenadas();
    var hoje = hojeZero();
    var ag = estadoAgenda();
    /* mostra a atual e as próximas; esconde as antigas que já acabaram */
    var visiveis = lista.filter(function (x) { return x.abre >= hoje || (ag.atual && x.sessao === ag.atual.sessao); });
    $("#agenda-sessoes").innerHTML = visiveis.length ? visiveis.map(function (x) {
      var estado = SITE.agenda.pausa && x.estado === "aberta" ? "encerrada" : x.estado;
      var info = estado === "embreve" ? "abre em " + dataExtenso(x.abre)
        : estado === "aberta" ? x.livres + (x.livres === 1 ? " vaga livre" : " vagas livres")
        : estado === "esgotado" ? "todas as " + x.vagas + " vagas preenchidas" : "agenda encerrada";
      return '<li class="ses ses-' + estado + ' surge">' +
        (estado === "esgotado" ? '<span class="ses-carimbo">' + esc((SITE.agenda.etiquetas || {}).esgotado || "Esgotado!") + "</span>" : "") +
        '<span class="t-selo ses-chip">' + NOMES_SESSAO[estado] + "</span>" +
        '<h3 class="ses-nome">' + esc(x.sessao.nome) + "</h3>" +
        vagasHtml(x.ocupadas, x.vagas) +
        '<p class="ses-info">' + esc(info) + "</p>" +
        (x.sessao.nota ? '<p class="ses-nota">' + esc(x.sessao.nota) + "</p>" : "") +
        (estado === "aberta" ? '<a class="btn btn-pop" href="encomendas.html">Garantir minha vaga</a>' : estado === "embreve" ? ctaAvisar("") : (estado === "esgotado" ? '<a class="btn" href="encomendas.html">Entrar na lista de espera</a>' : "")) +
        "</li>";
    }).join("") : '<li class="vazio">Nenhuma agenda marcada por enquanto. Fica de olho no Instagram!</li>';
  }

  function eventosOrdenados() {
    var manuais = (SITE.agenda.eventos || []).map(function (e) { return { e: e, d: dataLocal(e.data) }; });
    var sessoes = sessoesOrdenadas().map(function (x) {
      return { e: { tipo: "abertura", titulo: "Abre: " + x.sessao.nome, desc: x.vagas + (x.vagas === 1 ? " vaga" : " vagas") + (x.sessao.nota ? " · " + x.sessao.nota : "") }, d: x.abre };
    });
    return manuais.concat(sessoes).filter(function (x) { return x.d; }).sort(function (a, b) { return a.d - b.d; });
  }

  function renderCalendario() {
    if (!tem("#agenda-cal")) return;
    var hoje = hojeZero();
    if (!mesCal) mesCal = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    var ano = mesCal.getFullYear(), mes = mesCal.getMonth();
    var porDia = {};
    eventosOrdenados().forEach(function (x) {
      if (x.d.getFullYear() === ano && x.d.getMonth() === mes) (porDia[x.d.getDate()] = porDia[x.d.getDate()] || []).push(x.e);
    });
    var inicio = new Date(ano, mes, 1).getDay();
    var diasMes = new Date(ano, mes + 1, 0).getDate();
    var cel = ["D", "S", "T", "Q", "Q", "S", "S"].map(function (s) { return '<span class="cal-sem" aria-hidden="true">' + s + "</span>"; });
    for (var i = 0; i < inicio; i++) cel.push('<span class="cal-dia cal-fora"></span>');
    for (var d = 1; d <= diasMes; d++) {
      var data = new Date(ano, mes, d), evs = porDia[d];
      var cls = ["cal-dia"];
      if (data < hoje) cls.push("cal-passado");
      if (data.getTime() === hoje.getTime()) cls.push("cal-hoje");
      if (evs) {
        cls.push("cal-marcado");
        var cor = (TIPOS_EVENTO[evs[0].tipo] || TIPOS_EVENTO.aviso).cor;
        cel.push('<button type="button" class="' + cls.join(" ") + '" data-dia="' + d + '" style="--cor-ev:' + cor + '" aria-label="' + d + " de " + MESES[mes] + ": " + esc(evs.map(function (e) { return e.titulo; }).join(", ")) + '">' + d + "</button>");
      } else {
        cel.push('<span class="' + cls.join(" ") + '">' + d + "</span>");
      }
    }
    var legenda = Object.keys(TIPOS_EVENTO).map(function (k) { return '<span style="--c:' + TIPOS_EVENTO[k].cor + '">' + TIPOS_EVENTO[k].nome + "</span>"; }).join("");
    $("#agenda-cal").innerHTML =
      '<div class="cal-topo"><h3 class="cal-mes">' + MESES[mes] + " <small>" + ano + "</small></h3>" +
      '<div class="cal-nav"><button type="button" data-cal="-1" aria-label="Mês anterior">&#8592;</button><button type="button" data-cal="1" aria-label="Próximo mês">&#8594;</button></div></div>' +
      '<div class="cal-grade">' + cel.join("") + "</div>" +
      '<p class="cal-detalhe" id="cal-detalhe" aria-live="polite">' + (Object.keys(porDia).length ? "Toque num dia marcado para ver o que acontece." : "Nenhuma data marcada neste mês.") + "</p>" +
      '<div class="cal-legenda">' + legenda + "</div>";
    $("#agenda-cal").porDia = porDia;
  }

  function renderEventos() {
    if (!tem("#agenda-eventos")) return;
    var hoje = hojeZero();
    var lista = eventosOrdenados().filter(function (x) { return x.d >= new Date(hoje.getTime() - 7 * 86400000); });
    $("#agenda-eventos").innerHTML = lista.length ? lista.map(function (x) {
      var t = TIPOS_EVENTO[x.e.tipo] || TIPOS_EVENTO.aviso;
      return '<li class="ev' + (x.d < hoje ? " ev-passado" : "") + '" style="--cor-ev:' + t.cor + '">' +
        '<div class="ev-data"><b>' + String(x.d.getDate()).padStart(2, "0") + "</b><small>" + MESES[x.d.getMonth()].slice(0, 3) + "</small></div>" +
        '<div class="ev-txt"><span class="t-selo ev-tipo">' + t.nome + '</span><span class="ev-titulo">' + esc(x.e.titulo) + '</span><span class="ev-desc">' + esc(x.e.desc) + "</span></div></li>";
    }).join("") : '<li class="vazio">Nenhuma data marcada por enquanto.</li>';
  }

  function renderFila() {
    if (!tem("#agenda-fila")) return;
    var etapas = SITE.agenda.etapas || [];
    var n = etapas.length;
    var fila = SITE.agenda.fila || [];
    $("#agenda-fila").innerHTML = fila.length && n ? fila.map(function (f) {
      var e = Math.max(0, Math.min(n - 1, Number(f.etapa) || 0));
      var barras = "";
      for (var i = 0; i < n; i++) barras += '<i class="' + (i < e || e === n - 1 ? "ok" : (i === e ? "agora" : "")) + '"></i>';
      return '<li class="fila-item surge"><div class="fila-cab"><span><b>' + esc(f.nome) + "</b> <small>" + esc(f.detalhe) + '</small></span><span class="t-selo fila-etapa">' + esc(etapas[e] || "") + "</span></div>" +
        '<div class="fila-barra" style="--n:' + n + '" role="img" aria-label="Etapa ' + (e + 1) + " de " + n + ": " + esc(etapas[e] || "") + '">' + barras + "</div></li>";
    }).join("") : '<li class="vazio">A fila está vazia agora.</li>';
  }

  /* ===== perguntas ===== */
  function renderFaq() {
    if (!tem("#faq")) return;
    $("#faq").innerHTML = SITE.faq.map(function (f) {
      return '<details class="faq-item surge"><summary>' + esc(f.p) + '</summary><p>' + esc(f.r) + "</p></details>";
    }).join("");
  }

  function renderTudo() {
    renderComum();
    renderCabecalho();
    renderAbertura();
    renderFaixa();
    renderLinks();
    renderQuemSou();
    renderIntervalos();
    renderChamadas();
    renderGaleria(true);
    renderStatus();
    renderSessoes();
    renderCalendario();
    renderEventos();
    renderFila();
    renderFaq();
    Tela.observar();
  }

  function ligarEventos() {
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-avisar]")) { enviarMensagem(msgAvisar()); return; }
      var f = e.target.closest(".filtro");
      if (f) { filtroAtual = f.dataset.tag; renderGaleria(false); return; }
      if (e.target.closest("#gal-mais")) {
        var antes = mostrando;
        mostrando += porPagina();
        renderGaleria(true);
        var prox = document.querySelectorAll(".obra")[antes];
        if (prox) prox.focus({ preventScroll: true });
        return;
      }
      var obra = e.target.closest(".obra");
      if (obra) { abrirObra(Number(obra.dataset.i), obra); return; }
      var nav = e.target.closest("[data-cal]");
      if (nav) { mesCal = new Date(mesCal.getFullYear(), mesCal.getMonth() + Number(nav.dataset.cal), 1); renderCalendario(); return; }
      var dia = e.target.closest(".cal-dia[data-dia]");
      if (dia) {
        Array.prototype.forEach.call(document.querySelectorAll(".cal-sel"), function (d) { d.classList.remove("cal-sel"); });
        dia.classList.add("cal-sel");
        var evs = $("#agenda-cal").porDia[dia.dataset.dia] || [];
        $("#cal-detalhe").innerHTML = evs.map(function (ev) { return "<b>" + esc(ev.titulo) + "</b> · " + esc(ev.desc); }).join("<br>");
      }
    });

    /* o painel salvou em outra aba? redesenha na hora, sem recarregar */
    window.addEventListener("storage", function (e) {
      if (e.key !== LOJA_CHAVE) return;
      SITE = lojaCarregar();
      temaAplicar(SITE);
      renderTudo();
      if (window.Encomenda) Encomenda.recarregar();
    });
  }

  function iniciar() {
    renderTudo();
    ligarEventos();
    Tela.iniciar();
  }

  return { iniciar: iniciar, renderTudo: renderTudo };
})();

Site.iniciar();

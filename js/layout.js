"use strict";

/*
 * Moldura comum às páginas públicas: navegação, "créditos finais" (rodapé),
 * tela cheia das artes (lightbox), aviso flutuante e a entrada dos
 * elementos ao rolar (uma vez só — nada se mexe sozinho depois).
 * Cada página diz quem é em <body data-pagina="...">.
 */
var PAGINAS = [
  { id: "inicio", nome: "Início", href: "index.html" },
  { id: "portfolio", nome: "Portfólio", href: "portfolio.html" },
  { id: "agenda", nome: "Agenda", href: "agenda.html" },
  { id: "encomendas", nome: "Encomendas", href: "encomendas.html" }
];

(function () {
  var pagina = document.body.dataset.pagina || "inicio";
  function linkPag(i) { return '<a href="' + i.href + '"' + (i.id === pagina ? ' aria-current="page"' : "") + ">" + i.nome + "</a>"; }

  var nav = document.createElement("header");
  nav.className = "nav";
  nav.innerHTML =
    '<div class="nav-in">' +
      '<a class="nav-marca" href="index.html" aria-label="Drawikky, início"><img class="js-avatar" src="assets/avatar.webp" width="320" height="320" alt=""><span class="t-letreiro js-nome">Drawikky</span></a>' +
      '<nav class="nav-links" aria-label="Páginas">' + PAGINAS.slice(0, 3).map(linkPag).join("") + "</nav>" +
      '<div class="nav-acoes">' +
        '<a class="btn btn-pop nav-cta" href="encomendas.html"' + (pagina === "encomendas" ? ' aria-current="page"' : "") + ">Encomendar</a>" +
        '<button class="nav-menu" type="button" id="nav-menu" aria-expanded="false" aria-controls="nav-movel" aria-label="Abrir menu"><span></span><span></span></button>' +
      "</div>" +
    "</div>" +
    '<nav class="nav-movel" id="nav-movel" aria-label="Páginas" hidden>' + PAGINAS.map(linkPag).join("") + "</nav>";
  document.body.insertBefore(nav, document.body.firstChild);

  var menuBtn = nav.querySelector("#nav-menu"), menu = nav.querySelector("#nav-movel");
  menuBtn.addEventListener("click", function () {
    var abrir = menu.hidden;
    menu.hidden = !abrir;
    menuBtn.setAttribute("aria-expanded", String(abrir));
    menuBtn.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("nav-aberta", abrir);
  });

  var rod = document.createElement("footer");
  rod.className = "rod";
  rod.innerHTML =
    '<div class="rod-in">' +
      '<p class="t-selo rod-fim">Fim do episódio</p>' +
      '<p class="t-letreiro rod-obrigado" id="rod-assinatura"></p>' +
      '<div class="rod-ajuda">' +
        '<p><b>Gostou, mas agora não é um bom momento?</b> Você ainda pode fazer a diferença:</p>' +
        '<ul class="rod-acoes" aria-label="Formas de ajudar">' +
          '<li>' + iconeSvg("coracao") + "<span>curtir</span></li>" +
          '<li>' + iconeSvg("balao") + "<span>comentar</span></li>" +
          '<li>' + iconeSvg("aviao") + "<span>compartilhar</span></li>" +
          '<li>' + iconeSvg("marcador") + "<span>salvar</span></li>" +
        "</ul>" +
      "</div>" +
      '<nav class="rod-nav" aria-label="Páginas">' + PAGINAS.map(function (i) { return '<a href="' + i.href + '">' + i.nome + "</a>"; }).join("") + "</nav>" +
      '<div class="rod-creditos"><span>arte e personagens <b id="rod-nome"></b></span><span><a href="#" id="rod-ig" target="_blank" rel="noopener"></a></span><span class="rod-selo" id="rod-selo"></span></div>' +
      '<p class="rod-trirreme">Site desenvolvido pela <a href="https://trirreme.com" target="_blank" rel="noopener">TRIRREME</a></p>' +
    "</div>";
  document.body.appendChild(rod);

  var lb = document.createElement("div");
  lb.className = "lb";
  lb.id = "lb";
  lb.hidden = true;
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Arte em tela cheia");
  lb.innerHTML =
    '<div class="lb-topo"><span class="t-selo lb-cont" id="lb-cont"></span><button class="lb-fechar" type="button" aria-label="Fechar">&times;</button></div>' +
    '<button class="lb-seta lb-ant" type="button" aria-label="Arte anterior">&#8592;</button>' +
    '<figure class="lb-fig"><div class="lb-palco"><img id="lb-img" src="" alt=""></div>' +
      '<figcaption><b id="lb-tit"></b><span id="lb-sub"></span></figcaption>' +
      '<div class="lb-detalhes" id="lb-det" hidden></div></figure>' +
    '<button class="lb-seta lb-prox" type="button" aria-label="Próxima arte">&#8594;</button>';
  document.body.appendChild(lb);

  var aviso = document.createElement("div");
  aviso.className = "aviso-site";
  aviso.id = "aviso-site";
  aviso.setAttribute("role", "status");
  aviso.setAttribute("aria-live", "polite");
  document.body.appendChild(aviso);
})();

/* ===== tela cheia (lightbox) e entrada ao rolar ===== */
var Tela = (function () {
  var lista = [], idx = 0, det = 0, voltarFoco = null;
  var $ = function (s) { return document.querySelector(s); };

  function semMovimento() {
    return document.documentElement.dataset.movimento === "desligado" ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* item: { src, w, h, titulo, sub, baixa, detalhes:[{ src, thumb, w, h }] } */
  function mostrar() {
    var it = lista[idx];
    if (!it) return;
    var imgs = [{ src: it.src, w: it.w, h: it.h, thumb: it.thumb || it.src }].concat(it.detalhes || []);
    var atual = imgs[det] || imgs[0];
    var img = $("#lb-img");
    img.src = atual.src;
    img.alt = it.titulo || "Arte da Drawikky";
    if (atual.w) { img.width = atual.w; img.height = atual.h; } else { img.removeAttribute("width"); img.removeAttribute("height"); }
    /* imagens pequenas (vindas do print do perfil) não esticam além do tamanho real */
    img.style.maxWidth = it.baixa && atual.w ? Math.min(atual.w, 9999) + "px" : "";
    $("#lb-tit").textContent = it.titulo || "";
    $("#lb-sub").textContent = it.sub || "";
    $("#lb-cont").textContent = lista.length > 1 ? String(idx + 1).padStart(2, "0") + " / " + String(lista.length).padStart(2, "0") : "";
    var d = $("#lb-det");
    d.hidden = imgs.length < 2;
    d.innerHTML = imgs.length < 2 ? "" : imgs.map(function (x, i) {
      return '<button type="button" class="lb-mini" data-det="' + i + '" aria-label="' + (i === 0 ? "Arte inteira" : "Detalhe " + i) + '" aria-pressed="' + (i === det) + '"><img src="' + esc(x.thumb || x.src) + '" alt="" loading="lazy"></button>';
    }).join("");
    var varias = lista.length > 1;
    $(".lb-ant").hidden = !varias;
    $(".lb-prox").hidden = !varias;
  }
  function abrir(itens, i, origem) {
    lista = itens; idx = Math.max(0, i); det = 0; voltarFoco = origem || null;
    mostrar();
    $("#lb").hidden = false;
    document.body.classList.add("lb-on");
    $(".lb-fechar").focus();
  }
  function fechar() {
    $("#lb").hidden = true;
    document.body.classList.remove("lb-on");
    $("#lb-img").src = "";
    if (voltarFoco && voltarFoco.focus) voltarFoco.focus();
  }
  function passo(n) { if (lista.length < 2) return; idx = (idx + n + lista.length) % lista.length; det = 0; mostrar(); }

  function iniciar() {
    var lb = $("#lb");
    lb.addEventListener("click", function (e) {
      if (e.target.closest(".lb-fechar") || e.target === lb) { fechar(); return; }
      if (e.target.closest(".lb-ant")) { passo(-1); return; }
      if (e.target.closest(".lb-prox")) { passo(1); return; }
      var m = e.target.closest("[data-det]");
      if (m) { det = Number(m.dataset.det); mostrar(); }
    });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowLeft") passo(-1);
      else if (e.key === "ArrowRight") passo(1);
      else if (e.key === "Tab") {
        /* mantém o foco dentro da tela cheia */
        var f = Array.prototype.filter.call(lb.querySelectorAll("button"), function (b) { return !b.hidden && b.offsetParent !== null; });
        if (!f.length) return;
        var primeiro = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
      }
    });
    document.documentElement.classList.add("pronto");
  }

  /* elementos .surge entram uma vez quando aparecem na tela */
  var obs = null;
  function observar() {
    var els = document.querySelectorAll(".surge:not(.visto)");
    if (semMovimento() || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add("visto"); });
      return;
    }
    if (!obs) {
      obs = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visto"); obs.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    }
    Array.prototype.forEach.call(els, function (el) { obs.observe(el); });
  }

  return { abrir: abrir, fechar: fechar, iniciar: iniciar, observar: observar, semMovimento: semMovimento };
})();

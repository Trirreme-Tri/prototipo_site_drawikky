"use strict";

/*
 * Aplica a aparência escolhida no painel (cores, fontes, efeitos, movimento,
 * tema claro/escuro). Roda no <head>, antes da página aparecer, pra não
 * piscar a cor padrão antes da escolhida.
 */
var TEMA_CORES = ["laranja", "rosa", "lavanda", "ceu", "amarelo", "creme", "noite"];

function temaAplicar(site) {
  var ap = site.aparencia;
  var raiz = document.documentElement;
  TEMA_CORES.forEach(function (k) {
    var v = ap.cores[k];
    if (/^#[0-9a-f]{6}$/i.test(String(v || ""))) raiz.style.setProperty("--" + k, v);
  });

  raiz.style.setProperty("--f-letreiro", '"' + ap.fontes.letreiro + '", "Yellowtail", cursive');
  raiz.style.setProperty("--f-texto", '"' + ap.fontes.texto + '", "Montserrat", system-ui, sans-serif');
  raiz.style.setProperty("--f-selo", '"' + ap.fontes.selo + '", "Silkscreen", ui-monospace, monospace');

  var ef = ap.efeitos || {};
  raiz.dataset.padrao = ef.padrao === false ? "off" : "on";
  raiz.dataset.contorno = ef.contorno === false ? "off" : "on";
  raiz.dataset.adesivos = ef.adesivos === false ? "off" : "on";
  raiz.dataset.movimento = ap.movimento || "normal";

  /* "auto" segue o modo claro/escuro do aparelho de quem visita (sem botão no site) */
  var tema = ap.tema === "claro" ? "light" : (ap.tema === "escuro" ? "dark" : "");
  if (tema) raiz.setAttribute("data-theme", tema); else raiz.removeAttribute("data-theme");

  temaCarregarFontes(ap.fontes);
}

function temaCarregarFontes(fontes) {
  var familias = [fontes.letreiro, fontes.texto, fontes.selo];
  var partes = familias.filter(function (f, i) { return f && familias.indexOf(f) === i; }).map(function (f) {
    var nome = "family=" + encodeURIComponent(f).replace(/%20/g, "+");
    /* a fonte de texto precisa dos pesos usados no site */
    return f === fontes.texto ? nome + ":ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500;1,600" : nome;
  });
  var href = "https://fonts.googleapis.com/css2?" + partes.join("&") + "&display=swap";
  var link = document.getElementById("fontes-tema");
  if (!link) {
    link = document.createElement("link");
    link.id = "fontes-tema";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.getAttribute("href") !== href) link.setAttribute("href", href);
}

var SITE = lojaCarregar();
temaAplicar(SITE);

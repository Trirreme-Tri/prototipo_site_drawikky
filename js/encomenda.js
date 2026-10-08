"use strict";

/*
 * "Monte a sua" — calculadora de encomendas (mesma mecânica do site da
 * Anne: monta itens, soma, aplica desconto por quantidade e uso comercial,
 * e fecha pela DM/WhatsApp com o resumo pronto).
 *
 * Preço de UMA arte (os valores vêm da tabela dela):
 *   preço do tipo (finalizada / esboço colorido) no enquadramento escolhido
 *   × (1 + personagens extras × % do personagem extra)
 *   + preço do fundo
 * Depois: × quantidade → soma → − desconto por quantidade → + uso comercial.
 */
var Encomenda = (function () {
  var $ = function (s) { return document.querySelector(s); };
  var P = function () { return SITE.precos; };

  var proximoId = 1;
  var pedido = { itens: [], comercial: false };
  var rascunho = { tipo: null, enq: null, pers: 1, fundo: null, qtd: 1 };

  function porId(lista, id) { return (lista || []).filter(function (x) { return x.id === id; })[0]; }
  function maxPers() { return Math.max(1, Number(P().maxPersonagens) || 1); }

  /* se o painel removeu a opção escolhida, volta pra primeira que existe */
  function garantirRascunho() {
    var p = P();
    if (!porId(p.tipos, rascunho.tipo)) rascunho.tipo = (p.tipos[0] || {}).id;
    if (!porId(p.enquadramentos, rascunho.enq)) rascunho.enq = (p.enquadramentos[0] || {}).id;
    if (!porId(p.fundos, rascunho.fundo)) rascunho.fundo = (p.fundos[0] || {}).id;
    rascunho.pers = Math.min(Math.max(1, rascunho.pers), maxPers());
    pedido.itens = pedido.itens.filter(function (i) {
      return porId(p.tipos, i.tipo) && porId(p.enquadramentos, i.enq) && porId(p.fundos, i.fundo);
    });
  }

  /* ===== cálculo ===== */
  function precoBase(tipoId, enqId) {
    var t = porId(P().tipos, tipoId);
    return t && t.precos ? Number(t.precos[enqId]) || 0 : 0;
  }
  function precoUnitario(item) {
    var p = P(), fundo = porId(p.fundos, item.fundo);
    var base = precoBase(item.tipo, item.enq);
    if (!base || !fundo) return 0;
    var extras = (item.pers - 1) * (Number(p.personagemExtraPct) || 0) / 100;
    return base * (1 + extras) + Number(fundo.preco || 0);
  }
  function subtotal(item) { return precoUnitario(item) * item.qtd; }

  function calcular() {
    var faixas = (P().descontosVolume || []).slice().sort(function (a, b) { return a.min - b.min; });
    var qtdTotal = pedido.itens.reduce(function (t, i) { return t + i.qtd; }, 0);
    var bruto = pedido.itens.reduce(function (t, i) { return t + subtotal(i); }, 0);
    var faixa = faixas.reduce(function (m, f) { return qtdTotal >= f.min ? f : m; }, { min: 0, pct: 0 });
    var desconto = bruto * (Number(faixa.pct) || 0) / 100;
    var comercial = pedido.comercial ? (bruto - desconto) * (Number(P().comercialPct) || 0) / 100 : 0;
    var proxima = faixas.filter(function (f) { return f.min > qtdTotal && f.pct > (faixa.pct || 0); })[0];
    return { qtdTotal: qtdTotal, bruto: bruto, pct: Number(faixa.pct) || 0, desconto: desconto, comercial: comercial, total: bruto - desconto + comercial, proxima: proxima };
  }

  function descricao(item) {
    var p = P();
    var partes = [porId(p.tipos, item.tipo).nome, porId(p.enquadramentos, item.enq).nome.toLowerCase()];
    if (item.pers > 1) partes.push(item.pers + " personagens");
    var fundo = porId(p.fundos, item.fundo);
    if (fundo && Number(fundo.preco) > 0) partes.push(fundo.nome.toLowerCase());
    return partes.join(" · ");
  }

  function aberta() { return estadoAgenda().estado === "aberta"; }

  function resumo() {
    var c = calcular(), nome = SITE.perfil.nome;
    var L = [aberta() ? "Oi, " + nome + "! Montei um pedido no seu site ✨" : "Oi, " + nome + "! Quero entrar na lista de espera com este pedido ✨", ""];
    pedido.itens.forEach(function (i) { L.push("• " + i.qtd + "x " + descricao(i) + " — " + brl(subtotal(i))); });
    L.push("");
    if (c.pct > 0) L.push("Desconto por quantidade: " + c.pct + "% (" + c.qtdTotal + " artes)");
    if (pedido.comercial) L.push("Uso comercial: +" + P().comercialPct + "%");
    L.push("Total estimado: " + brl(c.total), "", "Te mando as referências por aqui!");
    return L.join("\n");
  }

  /* ===== desenho ===== */
  function opcaoHtml(grupo, o, sel, precoTxt, w, h) {
    var foto = urlSegura(o.img, true);
    return '<button type="button" class="op' + (foto ? "" : " op-texto") + '" data-grupo="' + grupo + '" data-id="' + esc(o.id) + '" aria-pressed="' + (o.id === sel) + '">' +
      (foto ? '<span class="op-foto"><img src="' + esc(foto) + '" alt="" loading="lazy"' + (w ? ' width="' + w + '" height="' + h + '"' : "") + "></span>" : "") +
      '<span class="op-nome">' + esc(o.nome) + "</span>" +
      (precoTxt ? '<span class="op-preco">' + precoTxt + "</span>" : "") +
      (o.desc ? '<span class="op-desc">' + esc(o.desc) + "</span>" : "") + "</button>";
  }

  function faixaPrecos(t) {
    var v = Object.keys(t.precos || {}).map(function (k) { return Number(t.precos[k]) || 0; }).filter(Boolean);
    if (!v.length) return "";
    return "de " + esc(brl(Math.min.apply(null, v))) + " a " + esc(brl(Math.max.apply(null, v)));
  }

  function renderOpcoes() {
    var p = P();
    $("#op-tipo").innerHTML = p.tipos.map(function (o) { return opcaoHtml("tipo", o, rascunho.tipo, faixaPrecos(o)); }).join("");
    $("#op-enquadramento").innerHTML = p.enquadramentos.map(function (o) {
      var v = precoBase(rascunho.tipo, o.id);
      return opcaoHtml("enq", o, rascunho.enq, v ? esc(brl(v)) : "sob consulta");
    }).join("");
    $("#op-fundo").innerHTML = p.fundos.map(function (o) { return opcaoHtml("fundo", o, rascunho.fundo, Number(o.preco) > 0 ? "+ " + esc(brl(o.preco)) : "incluso"); }).join("");
  }

  function renderRascunho() {
    $("#pers-qtd").textContent = rascunho.pers;
    $("#pers-menos").disabled = rascunho.pers <= 1;
    $("#pers-mais").disabled = rascunho.pers >= maxPers();
    $("#pers-nota").textContent = "Cada personagem extra na mesma arte: +" + (Number(P().personagemExtraPct) || 0) + "% do valor do enquadramento (até " + maxPers() + ").";
    $("#qtd").textContent = rascunho.qtd;
    $("#qtd-menos").disabled = rascunho.qtd <= 1;
    $("#qtd-mais").disabled = rascunho.qtd >= 20;
    var ok = precoUnitario(rascunho) > 0;
    $("#rascunho-preco").innerHTML = "<small>esta arte</small>" + (ok ? esc(brl(subtotal(rascunho))) : "sob consulta");
    $("#add-item").disabled = !ok;
  }

  function renderPedido() {
    var c = calcular(), vazio = pedido.itens.length === 0;
    $("#pedido-vazio").hidden = !vazio;
    $("#comercial-linha").hidden = vazio;
    $("#comercial").checked = pedido.comercial;
    $("#pedido-itens").innerHTML = pedido.itens.map(function (i) {
      return '<li class="pi" data-id="' + i.id + '"><span class="pi-desc">' + i.qtd + "x " + esc(descricao(i)) + '</span><span class="pi-valor">' + esc(brl(subtotal(i))) + "</span>" +
        '<span class="pi-acoes"><span class="stepper stepper-p"><button type="button" data-acao="menos" aria-label="Diminuir"' + (i.qtd <= 1 ? " disabled" : "") + ">&minus;</button><output>" + i.qtd +
        '</output><button type="button" data-acao="mais" aria-label="Aumentar"' + (i.qtd >= 20 ? " disabled" : "") + '>+</button></span><button type="button" class="pi-rem" data-acao="remover">remover</button></span></li>';
    }).join("");

    var aviso = "";
    if (!vazio) {
      if (c.pct > 0) aviso = c.pct + "% de desconto aplicado (" + c.qtdTotal + " artes).";
      if (c.proxima) aviso += (aviso ? " " : "") + "Com " + c.proxima.min + " artes no pedido, o desconto vai pra " + c.proxima.pct + "%.";
    }
    $("#pedido-desconto").textContent = aviso;
    $("#comercial-txt").textContent = "Pra revender, estampar produto ou usar em projeto pago. Acrescenta " + (Number(P().comercialPct) || 0) + "% ao valor.";

    var linhas = [];
    if (!vazio) {
      linhas.push('<div class="rec-linha"><span>Subtotal (' + c.qtdTotal + (c.qtdTotal === 1 ? " arte" : " artes") + ")</span><span>" + esc(brl(c.bruto)) + "</span></div>");
      if (c.pct > 0) linhas.push('<div class="rec-linha"><span>Desconto por quantidade (' + c.pct + "%)</span><span>&minus; " + esc(brl(c.desconto)) + "</span></div>");
      if (pedido.comercial) linhas.push('<div class="rec-linha"><span>Uso comercial (+' + P().comercialPct + "%)</span><span>" + esc(brl(c.comercial)) + "</span></div>");
    }
    linhas.push('<div class="rec-linha rec-total"><span class="t-selo">total</span><strong>' + esc(brl(c.total)) + "</strong></div>");
    $("#recibo").innerHTML = linhas.join("");

    var whats = contatoTemWhats();
    var cta = $("#fechar");
    cta.href = vazio ? "#" : contatoLink(resumo());
    cta.setAttribute("aria-disabled", String(vazio));
    cta.textContent = aberta() ? (whats ? "Fechar no WhatsApp" : "Fechar na DM") : "Entrar na lista de espera";
    $("#copiar").disabled = vazio;
    $("#pedido-nota").textContent = whats
      ? "O resumo já vai escrito na mensagem. O valor é uma estimativa: o orçamento final é confirmado na conversa."
      : "A DM do Instagram não aceita texto pronto: o resumo é copiado sozinho, é só colar na conversa. O orçamento final é confirmado lá.";
    $("#barra-valor").textContent = brl(c.total);
    if (vazio) { $("#barra-total").classList.remove("ativa"); $("#barra-total").setAttribute("aria-hidden", "true"); }
  }

  function renderAviso() {
    var av = $("#enc-aviso"), ag = estadoAgenda();
    var txt;
    if (ag.estado === "aberta") {
      txt = "<b>" + esc(ag.atual.sessao.nome) + "</b>: " + ag.atual.livres + " de " + ag.atual.vagas + (ag.atual.vagas === 1 ? " vaga livre" : " vagas livres") + ". A vaga é garantida quando o pagamento é confirmado.";
    } else if (ag.estado === "esgotado") {
      txt = "<b>" + esc(ag.atual.sessao.nome) + "</b> está esgotada. Monte seu pedido e mande pra lista de espera" +
        (ag.proxima ? " da próxima agenda, que abre em " + esc(dataExtenso(ag.proxima.abre)) : "") + ".";
    } else {
      txt = "As encomendas estão fechadas agora" + (ag.proxima ? " (a <b>" + esc(ag.proxima.sessao.nome) + "</b> abre em " + esc(dataExtenso(ag.proxima.abre)) + ")" : "") +
        ". Você pode simular seu pedido e mandar pra lista de espera.";
    }
    av.hidden = false;
    av.className = "enc-aviso enc-aviso-" + ag.estado;
    av.innerHTML = etiquetaHtml(ag.estado) + "<p>" + txt + ' <a href="agenda.html">ver agenda</a></p>';
  }

  function renderCapa() {
    var c = P().capa || {};
    $("#capa").hidden = !c.titulo;
    $("#capa").innerHTML = '<p class="t-selo">Capista</p><h3 class="capa-titulo">' + esc(c.titulo) + "</h3><p>" + esc(c.texto) + '</p><button type="button" class="btn" data-capa>' + esc(c.botao || "Orçamento pela DM") + "</button>";
  }

  function renderRegras() {
    $("#regras").innerHTML = (P().regras || []).map(function (r, i) {
      return '<div class="regra surge"><span class="t-selo regra-n">' + String(i + 1).padStart(2, "0") + '</span><b class="regra-t">' + esc(r.titulo) + "</b><p>" + esc(r.texto) + "</p></div>";
    }).join("");
  }

  function renderTabelas() {
    $("#tabelas").innerHTML = (P().tabelas || []).map(function (t, ti) {
      return '<div class="tab-grupo surge"><h3 class="t-letreiro tab-titulo">' + esc(t.titulo) + '</h3><div class="tab-tira">' +
        (t.imagens || []).map(function (im, i) {
          return '<button type="button" class="tab-img" data-tab="' + ti + '" data-i="' + i + '" aria-label="Ver ' + esc(t.titulo) + ", imagem " + (i + 1) + ' em tela cheia"><img src="' + esc(urlSegura(im.img, true)) + '" width="' + (Number(im.w) || 600) + '" height="' + (Number(im.h) || 750) + '" alt="" loading="lazy"></button>';
        }).join("") + "</div></div>";
    }).join("");
  }

  function render() {
    garantirRascunho();
    renderOpcoes();
    renderRascunho();
    renderPedido();
    renderAviso();
    renderCapa();
    renderRegras();
    renderTabelas();
    Tela.observar();
  }

  function ligar() {
    document.addEventListener("click", function (e) {
      var op = e.target.closest(".op[data-grupo]");
      if (op) { rascunho[op.dataset.grupo] = op.dataset.id; render(); return; }
      var ac = e.target.closest(".pi [data-acao]");
      if (ac) {
        var id = Number(ac.closest(".pi").dataset.id);
        var item = pedido.itens.filter(function (i) { return i.id === id; })[0];
        if (ac.dataset.acao === "remover") pedido.itens = pedido.itens.filter(function (i) { return i.id !== id; });
        else if (item && ac.dataset.acao === "mais" && item.qtd < 20) item.qtd++;
        else if (item && ac.dataset.acao === "menos" && item.qtd > 1) item.qtd--;
        render();
        return;
      }
      if (e.target.closest("[data-capa]")) { enviarMensagem((P().capa || {}).mensagem || "Oi! Quero um orçamento de capa ✨"); return; }
      var tb = e.target.closest(".tab-img");
      if (tb) {
        var t = P().tabelas[Number(tb.dataset.tab)];
        Tela.abrir(t.imagens.map(function (im, i) {
          return { src: urlSegura(im.grande, true) || urlSegura(im.img, true), w: Number(im.gw), h: Number(im.gh), titulo: t.titulo, sub: "imagem " + (i + 1) + " de " + t.imagens.length };
        }), Number(tb.dataset.i), tb);
      }
    });
    $("#pers-mais").addEventListener("click", function () { rascunho.pers++; render(); });
    $("#pers-menos").addEventListener("click", function () { rascunho.pers--; render(); });
    $("#qtd-mais").addEventListener("click", function () { if (rascunho.qtd < 20) { rascunho.qtd++; render(); } });
    $("#qtd-menos").addEventListener("click", function () { if (rascunho.qtd > 1) { rascunho.qtd--; render(); } });
    $("#add-item").addEventListener("click", function () {
      if (precoUnitario(rascunho) <= 0) return;
      pedido.itens.push({ id: proximoId++, tipo: rascunho.tipo, enq: rascunho.enq, pers: rascunho.pers, fundo: rascunho.fundo, qtd: rascunho.qtd });
      rascunho.qtd = 1;
      render();
      var b = this;
      b.textContent = "Adicionado ✓"; b.classList.add("adicionado");
      setTimeout(function () { b.textContent = "Adicionar ao pedido"; b.classList.remove("adicionado"); }, 1400);
      /* no celular o pedido fica embaixo: rola até ele pra pessoa ver que entrou */
      if (window.innerWidth < 980) $("#pedido").scrollIntoView({ behavior: Tela.semMovimento() ? "auto" : "smooth", block: "start" });
    });
    $("#comercial").addEventListener("change", function (e) { pedido.comercial = e.target.checked; render(); });
    $("#copiar").addEventListener("click", function () {
      var b = this;
      copiarTexto(resumo()).then(function () { b.textContent = "Copiado!"; }, function () { b.textContent = "Não deu pra copiar"; })
        .then(function () { setTimeout(function () { b.textContent = "Copiar resumo"; }, 1800); });
    });
    $("#fechar").addEventListener("click", function (e) {
      if (pedido.itens.length === 0) { e.preventDefault(); avisoSite("Adicione pelo menos uma arte ao pedido primeiro."); return; }
      if (!contatoTemWhats()) {
        copiarTexto(resumo()).then(function () { avisoSite("Resumo copiado! Na DM que vai abrir, é só colar e enviar ✦"); }, function () {});
      }
    });

    /* barra do total (celular) aparece só enquanto a calculadora está na tela */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          var on = en.isIntersecting && pedido.itens.length > 0;
          $("#barra-total").classList.toggle("ativa", on);
          $("#barra-total").setAttribute("aria-hidden", String(!on));
        });
      }, { threshold: 0.02 }).observe($(".enc-passos"));
    }
  }

  ligar();
  render();
  return { recarregar: render, _calcular: calcular, _pedido: pedido, _resumo: resumo };
})();

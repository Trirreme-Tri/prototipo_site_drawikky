"use strict";

/* Página de apresentação: as partes que dependem do conteúdo atual (links,
   cores, fontes, preços, imagens) são lidas de SITE, então ela acompanha o
   que for mudado no painel. */
(function () {
  var $ = function (s) { return document.querySelector(s); };

  /* endereços completos, montados a partir do endereço atual */
  var base = location.href.replace(/[^/]*([?#].*)?$/, "");
  $("#paginas-links").innerHTML = [["Início", ""], ["Portfólio", "portfolio.html"], ["Agenda", "agenda.html"], ["Encomendas", "encomendas.html"]].map(function (p) {
    var u = base + p[1];
    return "<li><b>" + p[0] + '</b><a class="url" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https?:\/\//, "")) + "</a></li>";
  }).join("");
  $("#url-painel").textContent = (base + "admin.html").replace(/^https?:\/\//, "");
  $("#url-painel").href = base + "admin.html";

  var ap = SITE.aparencia;
  var fontes = [
    { nome: ap.fontes.letreiro, papel: "Letreiro", uso: "Seu nome na abertura, os títulos das páginas e das seções, “Novo!” e “Obrigado por ler até aqui!”. É a letra cursiva retrô dos seus posts “Encomendas abertas!!”, “Formas de pagamento” e “Obrigado”.", amostra: "Encomendas abertas!!", estilo: "font-family:var(--f-letreiro);font-size:44px;line-height:1.1" },
    { nome: ap.fontes.texto, papel: "Texto", uso: "Tudo o que se lê: frases, descrições, preços e botões. É a mesma família das letras “encomendas ABERTAS” e “busto / meio corpo” das suas tabelas.", amostra: "Curte meus desenhos? Tenha um só seu!", estilo: "font-family:var(--f-texto);font-size:20px;font-weight:800" },
    { nome: ap.fontes.selo, papel: "Selo", uso: "As etiquetas pequenas: Ep. 01, Canal 02, “no ar”, “fim do episódio”. Lembra a letra de videogame do seu “GAME OVER”.", amostra: "Ep. 01 · no ar", estilo: "font-family:var(--f-selo);font-size:18px;text-transform:uppercase" }
  ];
  $("#fontes").innerHTML = fontes.map(function (f) {
    return '<div class="doc-fonte"><p class="t-selo">' + esc(f.papel) + '</p><p class="doc-fonte-amostra" style="' + f.estilo + '">' + esc(f.amostra) + "</p>" +
      '<p class="doc-fonte-nome">' + esc(f.nome) + '</p><p class="doc-pequeno">' + esc(f.uso) + "</p></div>";
  }).join("");

  var NOMES = {
    laranja: ["Tangerina", "fundo do seu post “Encomendas abertas!!”", "abertura e topo das Encomendas"],
    rosa: ["Rosa chiclete", "rosa da tabela de esboços coloridos", "botões, sombra dos letreiros, vagas"],
    lavanda: ["Lavanda", "post de encomendas (lilás)", "topo da Agenda e etiqueta de fechada"],
    ceu: ["Azul-céu", "post de encomendas (azul)", "ícones, fila e entregas"],
    amarelo: ["Amarelo", "post de encomendas (bolha amarela)", "etiquetas, seleção, números"],
    creme: ["Creme", "letreiros e papel da tabela", "letras dos letreiros e fundo claro"],
    noite: ["Azul-noite", "céu do pônei das constelações", "contornos, textos e fundo escuro"]
  };
  $("#cores").innerHTML = TEMA_CORES.map(function (k) {
    var hex = ap.cores[k];
    return '<div class="doc-cor"><span class="doc-cor-amostra" style="background:' + esc(hex) + '"></span><b>' + NOMES[k][0] + "</b><code>" + esc(String(hex).toUpperCase()) + "</code><small>de onde veio: " + NOMES[k][1] + "</small><small>onde aparece: " + NOMES[k][2] + "</small></div>";
  }).join("");

  /* exemplo de conta com os preços atuais */
  var p = SITE.precos;
  var tipo = p.tipos[0], enq = p.enquadramentos[1] || p.enquadramentos[0], fundo = p.fundos[0];
  if (tipo && enq && fundo) {
    var base1 = Number((tipo.precos || {})[enq.id]) || 0;
    var extra = base1 * (Number(p.personagemExtraPct) || 0) / 100;
    var unit = base1 + extra + Number(fundo.preco || 0);
    var faixa = (p.descontosVolume || []).filter(function (d) { return d.pct > 0; })[0];
    var qtd = faixa ? faixa.min : 2;
    var bruto = unit * qtd, desc = faixa ? bruto * faixa.pct / 100 : 0;
    $("#exemplo").innerHTML = "<b>Exemplo:</b> " + esc(tipo.nome) + ", " + esc(enq.nome.toLowerCase()) + " (" + esc(brl(base1)) + ") com 2 personagens (+" + p.personagemExtraPct + "% = " + esc(brl(extra)) + "), " +
      esc(fundo.nome.toLowerCase()) + " = <b>" + esc(brl(unit)) + "</b> por arte. Pedindo " + qtd + " iguais: " + esc(brl(bruto)) +
      (faixa ? " − " + faixa.pct + "% de desconto (" + esc(brl(desc)) + ")" : "") + " = <b>" + esc(brl(bruto - desc)) + "</b>.";
  }

  var itens = [];
  itens.push("Cada personagem extra na mesma arte: <b>+" + esc(p.personagemExtraPct) + "%</b> do enquadramento (até " + esc(p.maxPersonagens) + " personagens)");
  p.fundos.forEach(function (f) { itens.push("Fundo <b>" + esc(f.nome.toLowerCase()) + "</b>: " + (Number(f.preco) > 0 ? esc(brl(f.preco)) : "incluso")); });
  var d = p.descontosVolume.filter(function (x) { return x.pct > 0; }).map(function (x) { return x.pct + "% a partir de " + x.min + " artes"; });
  if (d.length) itens.push("Desconto por quantidade: <b>" + esc(d.join(" · ")) + "</b>");
  itens.push("Uso comercial: <b>+" + esc(p.comercialPct) + "%</b> (a tabela diz só “trabalhos comerciais sujeitos à taxa”)");
  itens.push("Capas: sem preço no site, só o botão <b>“Orçamento de capa pela DM”</b>");
  itens.push("As <b>agendas de outubro, novembro e dezembro</b> (vagas e datas), as datas do calendário e a fila de produção são exemplos: troque pelas suas no painel");
  itens.push("Os textos do <b>“Quem sou”</b>, as descrições de cada opção, as respostas das perguntas e as frases da abertura e do intervalo foram escritos a partir da sua bio e dos seus posts: ajuste pra sua voz");
  itens.push("Os <b>títulos e as categorias das artes</b> do portfólio foram dados por nós (ex.: “Sorria!”, “Noite estrelada”, Fanart, Desafios): troque à vontade na aba Galeria");
  itens.push("O WhatsApp ficou vazio, então os pedidos fecham pela <b>DM do Instagram</b>. Se quiser receber pelo WhatsApp, é só colocar o número na aba Perfil");
  $("#conferir").innerHTML = itens.map(function (t) { return "<li>" + t + "</li>"; }).join("");

  var baixas = SITE.galeria.filter(function (o) { return o.baixa; });
  $("#pedir").innerHTML = baixas.length ? baixas.map(function (o) {
    return '<li><img src="' + esc(urlSegura(o.img, true)) + '" width="' + (Number(o.w) || 60) + '" height="' + (Number(o.h) || 75) + '" alt="" loading="lazy"><span>' + esc(o.titulo) + "</span></li>";
  }).join("") : "<li>Nenhuma — todas as artes estão em boa resolução.</li>";
})();

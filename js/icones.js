"use strict";

/* Ícones dos links ("canais") e dos botões. O painel mostra esta lista
   como opções na aba Links — pra adicionar um ícone novo, basta incluir aqui. */
var ICONES = {
  instagram: { nome: "Instagram", svg: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>' },
  pincel: { nome: "Pincel (Cara, portfólio)", svg: '<path d="M14.5 4.5l5 5-8.2 8.2-5-5z"/><path d="M6.3 12.7c-2 .3-3.2 2-3.3 4.8 0 .9-.4 1.6-1 2 2.7.6 6.2-.3 7.3-2.8"/><path d="M17 2l5 5"/>' },
  whatsapp: { nome: "WhatsApp", svg: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1.2-1.2 1.8.8-.3 1.6c-3.6.4-7.3-3.3-6.9-6.9l1.6-.3.8 1.8z"/>' },
  email: { nome: "E-mail", svg: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>' },
  coracao: { nome: "Coração", svg: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>' },
  agenda: { nome: "Agenda", svg: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none"/>' },
  estrela: { nome: "Estrela", svg: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>' },
  raio: { nome: "Raio", svg: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>' },
  tv: { nome: "TV", svg: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M8 2.5l4 3.5 4-3.5"/>' },
  balao: { nome: "Balão (comentar)", svg: '<path d="M4 5h16v11H9l-5 4z"/><circle cx="9" cy="10.5" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="10.5" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="10.5" r=".9" fill="currentColor" stroke="none"/>' },
  aviao: { nome: "Avião (compartilhar)", svg: '<path d="M21 3L3 10.5l7 2.5 2.5 7z"/><path d="M10 13l11-10"/>' },
  marcador: { nome: "Marcador (salvar)", svg: '<path d="M6 3h12v18l-6-4.5L6 21z"/>' },
  youtube: { nome: "YouTube", svg: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.3v5.4l4.6-2.7z" fill="currentColor"/>' },
  tiktok: { nome: "TikTok", svg: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2.2 4.4 5 4.6"/>' },
  loja: { nome: "Loja", svg: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v11H4z"/><path d="M9.5 20v-6h5v6"/>' },
  link: { nome: "Link", svg: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>' }
};

function iconeSvg(id) {
  var ic = ICONES[id] || ICONES.link;
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ic.svg + "</svg>";
}

/* ===== adesivos decorativos, desenhados à mão em SVG (sem imagem gerada) =====
   Tirados dos posts dela: explosão de quadrinho, raio, brilho de 4 pontas,
   e o selo "sem IA" (o círculo riscado dos posts fixados). */
var DECOR = {
  /* explosão (starburst) com n pontas, irregular como nos posts */
  explosao: function (classe, pontas) {
    pontas = pontas || 14;
    var pts = [], i, ang, r;
    for (i = 0; i < pontas * 2; i++) {
      ang = (Math.PI * i) / pontas - Math.PI / 2;
      r = i % 2 === 0 ? (i % 4 === 0 ? 50 : 44) : 27;
      pts.push((50 + r * Math.cos(ang)).toFixed(1) + "," + (50 + r * Math.sin(ang)).toFixed(1));
    }
    return '<svg class="' + (classe || "") + '" viewBox="0 0 100 100" aria-hidden="true"><polygon points="' + pts.join(" ") + '"/></svg>';
  },
  raio: function (classe) {
    return '<svg class="' + (classe || "") + '" viewBox="0 0 40 60" aria-hidden="true"><path d="M24 2L4 34h13l-5 24 24-36H22z"/></svg>';
  },
  brilho: function (classe) {
    return '<svg class="' + (classe || "") + '" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0c1.5 11 7.5 17.5 20 20-12.5 2.5-18.5 9-20 20-1.5-11-7.5-17.5-20-20C12.5 17.5 18.5 11 20 0z"/></svg>';
  },
  semIa: function (classe) {
    return '<svg class="' + (classe || "") + '" viewBox="0 0 100 100" role="img" aria-label="Sem IA">' +
      '<circle cx="50" cy="50" r="40" fill="none" stroke="#E02F45" stroke-width="10"/>' +
      '<text x="50" y="62" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="900" font-size="34" fill="currentColor">IA</text>' +
      '<path d="M22 78L78 22" stroke="#E02F45" stroke-width="10" stroke-linecap="round"/></svg>';
  }
};

/* ==========================================================================
   LOJA NATALINA: LÓGICA SIMPLIFICADA E ANTIFALHAS
   Arquivo: js/script.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initNeve();
  initMenu();
  initTema();
  initMusica();
  initCarrossel();
  initParallax();
  initCatalogo();
  initCarrinho();
  initContagem();
  initContadorSlides();
  initGaleria();
  initContato();
  initTopo();
  initObserver();
});

// 1. NEVE
function initNeve() {
  const container = document.getElementById("neve-container");
  if (!container) return;
  for (let i = 0; i < 25; i++) {
    const floco = document.createElement("div");
    floco.className = "floco-neve";
    floco.textContent = "❄";
    floco.style.left = `${Math.random() * 100}vw`;
    floco.style.animationDuration = `${Math.random() * 4 + 4}s`;
    container.appendChild(floco);
  }
}

// 2. MENU MOBILE
function initMenu() {
  const btn = document.getElementById("btn-menu");
  const nav = document.getElementById("menu-navegacao");
  if (btn && nav) btn.onclick = () => nav.classList.toggle("aberto");
}

// 3. TEMA ESCURO
function initTema() {
  const btn = document.getElementById("btn-tema");
  if (localStorage.getItem("tema_natal") === "escuro") document.body.classList.add("tema-escuro");
  if (btn) {
    btn.onclick = () => {
      document.body.classList.toggle("tema-escuro");
      const eEscuro = document.body.classList.contains("tema-escuro");
      localStorage.setItem("tema_natal", eEscuro ? "escuro" : "claro");
    };
  }
}

// 4. MÚSICA & ÁUDIO
let audioMusica = null;
function initMusica() {
  const btn = document.getElementById("btn-musica");
  if (!btn) return;

  const caminhoAudio = "audio/tunetank-christmas-347469.mp3";
  audioMusica = new Audio(caminhoAudio);
  audioMusica.loop = true;
  audioMusica.volume = 0.3;
  btn.textContent = "🎵";
  btn.setAttribute("aria-label", "Tocar música");

  btn.onclick = async () => {
    try {
      if (audioMusica.paused) {
        await audioMusica.play();
        btn.textContent = "⏸";
        btn.setAttribute("aria-label", "Pausar música");
      } else {
        audioMusica.pause();
        btn.textContent = "🎵";
        btn.setAttribute("aria-label", "Tocar música");
      }
    } catch (error) {
      console.warn("Não foi possível reproduzir a música:", error);
    }
  };
}

function tocarSino() {
  new Audio("audio/sino.mp3").play().catch(() => {});
}

// 5. CARROSSEL
function initCarrossel() {
  const slides = document.getElementById("carrossel-slides");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const ind = document.getElementById("carrossel-indicadores");
  if (!slides) return;

  const total = slides.querySelectorAll(".slide").length;
  let idx = 0;

  for (let i = 0; i < total; i++) {
    const b = document.createElement("div");
    b.className = `bolinha ${i === 0 ? "ativa" : ""}`;
    b.onclick = () => irPara(i);
    if (ind) ind.appendChild(b);
  }

  function irPara(n) {
    idx = (n + total) % total;
    slides.style.transform = `translateX(-${idx * 100}%)`;
    if (ind) {
      const bols = ind.querySelectorAll(".bolinha");
      bols.forEach((b, i) => b.classList.toggle("ativa", i === idx));
    }
  }

  if (btnNext) btnNext.onclick = () => irPara(idx + 1);
  if (btnPrev) btnPrev.onclick = () => irPara(idx - 1);
  setInterval(() => irPara(idx + 1), 5000);
}

// 6. PARALLAX
function initParallax() {
  const c = document.querySelector(".camada-parallax");
  if (!c) return;
  window.onscroll = () => {
    c.style.transform = `translateY(${window.scrollY * 0.2}px)`;
  };
}

// 7. CARD DE PRODUTO E CATÁLOGO
function criarCard(p) {
  const preco = p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const svg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='180'><rect width='100%' height='100%' fill='%23B3202A'/><text x='50%' y='50%' fill='%23FFF' text-anchor='middle'>${encodeURIComponent(p.nome)}</text></svg>`;

  return `
    <article class="card-produto revelar">
      ${p.destaque ? '<span class="tag-destaque">Destaque</span>' : ''}
      <img src="${p.imagem}" alt="${p.nome}" loading="lazy" onerror="this.src='${svg}'" onclick="abrirModal(${p.id})">
      <div class="card-produto-info">
        <h3>${p.nome}</h3>
        <p class="preco">${preco}</p>
        <button class="btn-natal btn-add" data-id="${p.id}">Adicionar 🛒</button>
      </div>
    </article>
  `;
}

function initCatalogo() {
  const grid = document.getElementById("lista-produtos");
  const dest = document.getElementById("grid-destaques");
  const seg = document.getElementById("segmento");
  const cat = document.getElementById("categoria");
  const bus = document.getElementById("busca");
  const cont = document.getElementById("contador");

  if (dest && typeof produtos !== "undefined") {
    dest.innerHTML = produtos.filter(p => p.destaque).map(criarCard).join("");
  }

  if (!grid || typeof produtos === "undefined") return;

  function render() {
    const vSeg = seg ? seg.value : "todos";
    const vCat = cat ? cat.value : "todas";
    const vBus = bus ? bus.value.toLowerCase() : "";

    const lista = produtos.filter(p => {
      const bSeg = vSeg === "todos" || p.segmento === vSeg;
      const bCat = vCat === "todas" || p.categoria === vCat;
      const bBus = p.nome.toLowerCase().includes(vBus);
      return bSeg && bCat && bBus;
    });

    grid.innerHTML = lista.length ? lista.map(criarCard).join("") : `<p style="grid-column: 1/-1; text-align: center;">Nenhum produto encontrado 🎅</p>`;
    if (cont) cont.textContent = `Mostrando ${lista.length} de ${produtos.length} produtos`;
    initObserver();
  }

  if (seg) seg.onchange = render;
  if (cat) cat.onchange = render;
  if (bus) bus.oninput = render;

  render();
}

// 8. CARRINHO DE COMPRAS
let carrinho = JSON.parse(localStorage.getItem("carrinho_natal") || "[]");

function salvarCarrinho() {
  localStorage.setItem("carrinho_natal", JSON.stringify(carrinho));
  const elQtd = document.getElementById("qtd-carrinho");
  const elTot = document.getElementById("total-carrinho");
  const totalQtd = carrinho.reduce((a, b) => a + b.qtd, 0);
  const totalVal = carrinho.reduce((a, b) => a + (b.preco * b.qtd), 0);

  if (elQtd) elQtd.textContent = totalQtd;
  if (elTot) elTot.textContent = totalVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  renderCarrinho();
}

function renderCarrinho() {
  const tb = document.getElementById("itens-carrinho");
  if (!tb) return;
  if (!carrinho.length) {
    tb.innerHTML = `<tr><td colspan="5" style="text-align:center;">Carrinho vazio 🎄</td></tr>`;
    return;
  }
  tb.innerHTML = carrinho.map(i => `
    <tr>
      <td>${i.nome}</td>
      <td>R$ ${i.preco.toFixed(2)}</td>
      <td>
        <button onclick="mudarQtd(${i.id}, -1)">-</button>
        ${i.qtd}
        <button onclick="mudarQtd(${i.id}, 1)">+</button>
      </td>
      <td>R$ ${(i.preco * i.qtd).toFixed(2)}</td>
      <td><button onclick="remItem(${i.id})" style="color: red;">❌</button></td>
    </tr>
  `).join("");
}

function addCarrinho(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;
  const item = carrinho.find(x => x.id === id);
  if (item) item.qtd++;
  else carrinho.push({ id: p.id, nome: p.nome, preco: p.preco, qtd: 1 });
  salvarCarrinho();
  tocarSino();
}

function mudarQtd(id, d) {
  const item = carrinho.find(x => x.id === id);
  if (!item) return;
  item.qtd += d;
  if (item.qtd <= 0) remItem(id);
  else salvarCarrinho();
}

function remItem(id) {
  carrinho = carrinho.filter(x => x.id !== id);
  salvarCarrinho();
}

function initCarrinho() {
  salvarCarrinho();
  document.onclick = (e) => {
    if (e.target && e.target.classList.contains("btn-add")) {
      addCarrinho(parseInt(e.target.dataset.id));
    }
  };
  const btnL = document.getElementById("btn-limpar-carrinho");
  if (btnL) btnL.onclick = () => { carrinho = []; salvarCarrinho(); };
}

// 9. MODAL DE PRODUTO
function abrirModal(id) {
  const m = document.getElementById("modal-produto");
  const c = document.getElementById("modal-corpo");
  const p = produtos.find(x => x.id === id);
  if (!m || !c || !p) return;

  c.innerHTML = `
    <h2>${p.nome}</h2>
    <p style="margin: 0.5rem 0;">${p.descricao}</p>
    <h3 style="color: var(--verde);">R$ ${p.preco.toFixed(2)}</h3>
    <br>
    <button class="btn-natal btn-add" data-id="${p.id}">Adicionar ao Carrinho 🛒</button>
  `;
  m.classList.add("ativo");
}

document.addEventListener("DOMContentLoaded", () => {
  const m = document.getElementById("modal-produto");
  const f = document.getElementById("fechar-modal");
  if (f && m) f.onclick = () => m.classList.remove("ativo");
});

// 10. CONTAGEM REGRESSIVA
function initContagem() {
  const d = document.getElementById("dias");
  if (!d) return;
  function calc() {
    const agora = new Date();
    let natal = new Date(agora.getFullYear(), 11, 25);
    if (agora > natal) natal = new Date(agora.getFullYear() + 1, 11, 25);
    const dif = natal - agora;
    document.getElementById("dias").textContent = Math.floor(dif / (1000 * 60 * 60 * 24));
    document.getElementById("horas").textContent = Math.floor((dif / (1000 * 60 * 60)) % 24);
    document.getElementById("minutos").textContent = Math.floor((dif / 1000 / 60) % 60);
    document.getElementById("segundos").textContent = Math.floor((dif / 1000) % 60);
  }
  calc(); setInterval(calc, 1000);
}

function initContadorSlides() {
  const slides = document.querySelectorAll(".contador-slide");
  if (!slides.length) return;

  let indice = 0;
  const mostrarSlide = (n) => {
    slides.forEach((slide, i) => slide.classList.toggle("ativo", i === n));
  };

  mostrarSlide(indice);
  setInterval(() => {
    indice = (indice + 1) % slides.length;
    mostrarSlide(indice);
  }, 5000);
}

// 11. GALERIA LIGHTBOX
function initGaleria() {
  const m = document.getElementById("modal-lightbox");
  const img = document.getElementById("img-lightbox");
  const f = document.getElementById("fechar-lightbox");
  const imgs = document.querySelectorAll("#galeria-fotos img");
  if (!m || !imgs.length) return;

  imgs.forEach(i => {
    i.onclick = () => { img.src = i.src; m.classList.add("ativo"); };
  });
  if (f) f.onclick = () => m.classList.remove("ativo");
}

// 12. CONTATO
function initContato() {
  const form = document.getElementById("form-contato");
  if (!form) return;
  form.onsubmit = (e) => {
    e.preventDefault();
    const n = document.getElementById("nome").value.trim();
    const em = document.getElementById("email").value.trim();
    const m = document.getElementById("mensagem").value.trim();
    const st = document.getElementById("status-envio");

    if (!n || !em || m.length < 10) {
      st.textContent = "Preencha todos os campos corretamente (mensagem mínima 10 letras).";
      st.className = "msg-validacao erro";
    } else {
      st.textContent = "Carta enviada com sucesso! 🎅";
      st.className = "msg-validacao sucesso";
      form.reset();
    }
  };
}

// 13. TOPO E REVELAR
function initTopo() {
  const b = document.getElementById("topo");
  if (!b) return;
  window.addEventListener("scroll", () => {
    b.classList.toggle("visivel", window.scrollY > 300);
  });
  b.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

function initObserver() {
  const els = document.querySelectorAll(".revelar");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visivel"); });
  });
  els.forEach(el => obs.observe(el));
}
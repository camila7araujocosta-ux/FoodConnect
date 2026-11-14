/* =====================================================
   FoodConnect · map.js
   Mapa ILUSTRATIVO de uma cidade fictícia, desenhado em SVG.
   - Não precisa de internet nem de biblioteca externa.
   - Dá para arrastar, dar zoom (botões, roda do mouse ou pinça).
   - Todos os locais (instituições e pontos de coleta) são fictícios.
   ===================================================== */

const W = 3000, H = 2000;         // tamanho do "mundo" desenhado (bem maior que a tela)
const OX = 900, OY = 600;         // onde fica o ponto (0,0) dos dados dentro do desenho
const X0 = -OX, Y0 = -OY, X1 = W - OX, Y1 = H - OY;   // limites do mundo
const METROS_POR_PX = 6;          // escala do mapa (1 px = 6 m), usada nas distâncias

/* junta os dois tipos de local numa lista só */
const locais = [
    ...FC.INSTITUICOES.map(i => ({ ...i, tipo: "inst" })),
    ...FC.PONTOS_COLETA.map(p => ({ ...p, tipo: "coleta" }))
];

/* =====================================================
   1) DESENHO DA CIDADE
   ===================================================== */

/* gerador de números "aleatórios" sempre iguais (a cidade não muda a cada visita) */
function aleatorio(semente) {
    return function () {
        semente |= 0; semente = semente + 0x6D2B79F5 | 0;
        let t = Math.imul(semente ^ semente >>> 15, 1 | semente);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/* ruas do CENTRO da cidade (onde ficam os locais). "maior" = avenida larga */
const RUAS_V_CENTRO = [
    { x: 90 }, { x: 190 }, { x: 300, maior: true, nome: "AV. CENTRAL" }, { x: 410 }, { x: 520 },
    { x: 610 }, { x: 700, maior: true, nome: "AV. DAS PALMEIRAS" }, { x: 810 }, { x: 920 }, { x: 1010 }, { x: 1110 }
];
const RUAS_H_CENTRO = [
    { y: 70 }, { y: 160 }, { y: 250 }, { y: 330 }, { y: 400, maior: true, nome: "AV. PRINCIPAL" },
    { y: 480 }, { y: 570 }, { y: 660 }, { y: 740 }
];
const NOMES_AV = ["AV. DO COMÉRCIO", "AV. BEIRA-RIO", "AV. DAS FLORES", "AV. SÃO PAULO", "AV. DA LIBERDADE",
    "AV. DO PORTO", "AV. UNIVERSITÁRIA", "AV. DAS ACÁCIAS", "AV. DO FUTURO", "AV. DOS PESCADORES"];
const NOMES_RUA = ["R. DAS FLORES", "R. DA ESCOLA", "R. DO SOL", "R. DA LUA", "R. SÃO JOSÉ", "R. DOS IPÊS", "R. DO COMÉRCIO",
    "R. DAS ROSAS", "R. DO LAGO", "R. DA PAZ", "R. NOVA", "R. DO MERCADO", "R. DOS PINHEIROS", "R. DA ESPERANÇA",
    "R. DOS CRAVOS", "R. DO PARQUE", "R. DA ALEGRIA", "R. DAS PALMAS"];

/* quarteirões do centro que viram praças (canto superior esquerdo do quarteirão) */
const PRACAS = ["410,250", "190,160", "1010,480"];

/* o rio: uma curva longa que cruza a cidade (as ruas passam por cima, formando pontes) */
const RIO = "M -960 520 C -700 400, -280 700, -60 610 C 160 520, 330 650, 520 585 S 840 330, 1260 395 S 1900 700, 2160 560";

/* lago (as ruas terminam na margem) */
const LAGO = { cx: 1850, cy: 900, rx: 240, ry: 130 };

const meiaLargura = r => r.maior ? 14 : 8;     // metade da largura da rua

/* continua as ruas do centro para os lados, formando o resto da cidade */
function construirRuas() {
    const r = aleatorio(77);
    let nAv = 0, nRua = 0;

    function estender(base, chave, min, max) {
        const lista = base.map(o => ({ ...o }));
        const novo = n => {
            const maior = n % 4 === 0;
            return maior ? { maior: true, nome: NOMES_AV[nAv++ % NOMES_AV.length] }
                         : { nome: (n % 3 === 0) ? NOMES_RUA[nRua++ % NOMES_RUA.length] : undefined };
        };
        let pos = base[0][chave], n = 0;
        while ((pos -= 90 + Math.floor(r() * 35)) > min) { n++; lista.unshift({ [chave]: pos, ...novo(n) }); }
        pos = base[base.length - 1][chave]; n = 0;
        while ((pos += 90 + Math.floor(r() * 35)) < max) { n++; lista.push({ [chave]: pos, ...novo(n) }); }
        return lista;
    }
    return { v: estender(RUAS_V_CENTRO, "x", X0 + 20, X1 - 20), h: estender(RUAS_H_CENTRO, "y", Y0 + 20, Y1 - 20) };
}

function desenharCidade() {
    const rnd = aleatorio(2026);
    const { v: RUAS_V, h: RUAS_H } = construirRuas();

    let svg = `<defs><path id="rio" d="${RIO}"/>
        <mask id="semLago" maskUnits="userSpaceOnUse" x="${X0}" y="${Y0}" width="${W}" height="${H}">
            <rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="#fff"/>
            <ellipse cx="${LAGO.cx}" cy="${LAGO.cy}" rx="${LAGO.rx + 20}" ry="${LAGO.ry + 20}" fill="#000"/>
        </mask></defs>`;

    /* fundo */
    svg += `<rect class="c-land" x="${X0}" y="${Y0}" width="${W}" height="${H}"/>`;

    /* limites dos quarteirões: bordas do mundo + ruas */
    const xs = [{ p: X0, m: 0 }, ...RUAS_V.map(r => ({ p: r.x, m: meiaLargura(r) })), { p: X1, m: 0 }];
    const ys = [{ p: Y0, m: 0 }, ...RUAS_H.map(r => ({ p: r.y, m: meiaLargura(r) })), { p: Y1, m: 0 }];

    /* prédios e praças, quarteirão por quarteirão */
    let predios = "", pracas = "";
    for (let i = 0; i < xs.length - 1; i++) {
        for (let j = 0; j < ys.length - 1; j++) {
            const x0 = xs[i].p + xs[i].m + 6, x1 = xs[i + 1].p - xs[i + 1].m - 6;
            const y0 = ys[j].p + ys[j].m + 6, y1 = ys[j + 1].p - ys[j + 1].m - 6;
            const bw = x1 - x0, bh = y1 - y0;
            if (bw < 20 || bh < 20) continue;

            /* fora do centro, 7% dos quarteirões viram praça */
            const noCentro = x1 > 0 && x0 < 1200 && y1 > 0 && y0 < 800;
            const ehPraca = PRACAS.includes(xs[i].p + "," + ys[j].p) || (!noCentro && rnd() < 0.07);

            if (ehPraca) {
                pracas += `<rect class="c-park" x="${x0}" y="${y0}" width="${bw}" height="${bh}" rx="14"/>`;
                pracas += `<path class="c-trilha" d="M ${x0 + 8} ${y0 + bh - 10} Q ${x0 + bw / 2} ${y0 - 10} ${x1 - 8} ${y0 + 12}"/>`;
                for (let k = 0; k < 9; k++) {
                    pracas += `<circle class="c-tree" cx="${(x0 + 12 + rnd() * (bw - 24)).toFixed(0)}" cy="${(y0 + 12 + rnd() * (bh - 24)).toFixed(0)}" r="${(5 + rnd() * 4).toFixed(1)}"/>`;
                }
                continue;
            }

            /* quarteirão comum: divide em lotes e desenha prédios */
            const cols = Math.max(1, Math.round(bw / 38));
            const rows = Math.max(1, Math.round(bh / 34));
            const lw = (bw - (cols - 1) * 4) / cols, lh = (bh - (rows - 1) * 4) / rows;
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    if (rnd() < 0.1) continue;                       // alguns lotes vazios
                    const folga = 2 + rnd() * 5;
                    const cor = 1 + Math.floor(rnd() * 3);
                    predios += `<rect class="c-b${cor}" x="${(x0 + c * (lw + 4) + folga).toFixed(1)}" y="${(y0 + r * (lh + 4) + folga).toFixed(1)}" width="${(lw - folga * 2).toFixed(1)}" height="${(lh - folga * 2).toFixed(1)}" rx="2"/>`;
                }
            }
        }
    }
    svg += predios + pracas;

    /* rio (margem + água) */
    svg += `<path class="c-bank" d="${RIO}" stroke-width="62"/>`;
    svg += `<path class="c-water" d="${RIO}" stroke-width="48"/>`;

    /* ruas: primeiro todos os contornos, depois o preenchimento (cruzamentos ficam limpos) */
    const linhas = [
        ...RUAS_V.map(r => ({ x1: r.x, y1: Y0, x2: r.x, y2: Y1, w: r.maior ? 28 : 16, maior: !!r.maior })),
        ...RUAS_H.map(r => ({ x1: X0, y1: r.y, x2: X1, y2: r.y, w: r.maior ? 28 : 16, maior: !!r.maior })),
        { x1: 700, y1: 400, x2: 1700, y2: 1230, w: 22, maior: true }                   // avenida diagonal
    ];
    let vias = linhas.map(l => `<line class="c-casing" x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke-width="${l.w + 4}"/>`).join("");
    vias += linhas.map(l => `<line class="c-road" x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke-width="${l.w}"/>`).join("");
    vias += linhas.filter(l => l.maior).map(l => `<line class="c-dash" x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke-width="2" stroke-dasharray="14 12"/>`).join("");

    /* rotatória em cada cruzamento de duas avenidas */
    RUAS_V.filter(r => r.maior).forEach(rv => RUAS_H.filter(r => r.maior).forEach(rh => {
        vias += `<circle class="c-casing" cx="${rv.x}" cy="${rh.y}" r="44"/><circle class="c-road" cx="${rv.x}" cy="${rh.y}" r="40"/>`;
        vias += `<circle class="c-park" cx="${rv.x}" cy="${rh.y}" r="21"/><circle class="c-tree" cx="${rv.x}" cy="${rh.y}" r="7"/>`;
    }));
    /* a avenida diagonal termina numa pracinha redonda */
    vias += `<circle class="c-casing" cx="1700" cy="1230" r="30"/><circle class="c-road" cx="1700" cy="1230" r="26"/>`;
    vias += `<circle class="c-park" cx="1700" cy="1230" r="12"/><circle class="c-tree" cx="1700" cy="1230" r="5"/>`;
    svg += `<g mask="url(#semLago)">${vias}</g>`;

    /* lago */
    svg += `<ellipse class="c-bank" cx="${LAGO.cx}" cy="${LAGO.cy}" rx="${LAGO.rx + 16}" ry="${LAGO.ry + 16}" stroke="none" style="fill:var(--m-bank)"/>`;
    svg += `<ellipse class="c-lago" cx="${LAGO.cx}" cy="${LAGO.cy}" rx="${LAGO.rx}" ry="${LAGO.ry}"/>`;
    svg += `<text class="c-rio" x="${LAGO.cx - 70}" y="${LAGO.cy + 5}">LAGO AZUL</text>`;

    /* nomes das ruas: no meio de alguns quarteirões, para não cair em cruzamentos */
    const rotulo = (x, y, txt, vertical, grande) =>
        `<text class="c-nome${grande ? " grande" : ""}" x="${x}" y="${y + 4}"${vertical ? ` transform="rotate(-90 ${x} ${y})"` : ""}>${txt}</text>`;
    const centros = (lista, chave, min, max) => {
        const pts = [min, ...lista.map(r => r[chave]), max];
        return pts.slice(0, -1).map((p, i) => (p + pts[i + 1]) / 2);
    };
    const cx = centros(RUAS_V, "x", X0, X1), cy = centros(RUAS_H, "y", Y0, Y1);
    let nomes = "";
    RUAS_V.forEach(r => { if (r.nome) cy.forEach((y, i) => { if ((i + (r.maior ? 0 : 3)) % (r.maior ? 5 : 9) === 2) nomes += rotulo(r.x, y, r.nome, true, r.maior); }); });
    RUAS_H.forEach(r => { if (r.nome) cx.forEach((x, i) => { if ((i + (r.maior ? 0 : 3)) % (r.maior ? 5 : 9) === 2) nomes += rotulo(x, r.y, r.nome, false, r.maior); }); });
    svg += `<g mask="url(#semLago)">${nomes}</g>`;            // nomes também somem sobre o lago
    svg += `<text class="c-rio"><textPath id="rio-nome" href="#rio" startOffset="1100">RIO CLARO</textPath></text>`;

    document.getElementById("cidade").innerHTML = svg;

    /* o nome do rio fica perto do centro da cidade */
    const rioEl = document.getElementById("rio"), tam = rioEl.getTotalLength();
    for (let s = 0; s < tam; s += 5) { if (rioEl.getPointAtLength(s).x >= 40) { document.getElementById("rio-nome").setAttribute("startOffset", s); break; } }
}

/* =====================================================
   2) PINOS
   ===================================================== */
const pinosEl = document.getElementById("pinos");
const mapaEl = document.getElementById("mapa");
const viewEl = document.getElementById("mapa-view");
const lista = document.getElementById("lista-locais");
const msgLoc = document.getElementById("msg-loc");
const btnLoc = document.getElementById("btn-loc");

/* tamanho do desenho e origem dos pinos (os dados dos locais usam (0,0) = OX,OY do desenho) */
viewEl.style.width = W + "px";
viewEl.style.height = H + "px";
pinosEl.style.left = OX + "px";
pinosEl.style.top = OY + "px";
const svgEl = document.getElementById("cidade");
svgEl.setAttribute("width", W); svgEl.setAttribute("height", H);
svgEl.setAttribute("viewBox", `${X0} ${Y0} ${W} ${H}`);

let filtroAtual = "todos";
let selecionado = null;
let posicao = null;               // {x, y} quando a pessoa marca onde está
let modoLocalizar = false;

function criarPinos() {
    pinosEl.innerHTML = locais.map(l => {
        const botao = l.tipo === "inst"
            ? `<br><a href="donate.html?inst=${l.id}">Doar para esta instituição →</a>`
            : "";
        return `
            <div class="pino-wrap" data-id="${l.id}" style="left:${l.x}px; top:${l.y}px" role="button" tabindex="0" aria-label="${FC.esc(l.nome)}">
                <div class="pino ${l.tipo}"><span>${l.tipo === "inst" ? "🏠" : "📦"}</span></div>
                <div class="popup">
                    <h4>${FC.esc(l.nome)}</h4>
                    ${FC.esc(l.endereco)}<br>${FC.esc(l.horario)}${botao}
                </div>
            </div>`;
    }).join("");

    pinosEl.querySelectorAll(".pino-wrap").forEach(el => {
        el.addEventListener("click", e => {
            if (e.target.closest("a")) return;                // o link "Doar" segue normalmente
            if (e.target.closest(".popup")) return;
            selecionar(el.dataset.id, "manter");
        });
        el.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selecionar(el.dataset.id, "manter"); }
        });
    });
}

function selecionar(id, centralizar) {
    id = String(id);
    selecionado = id;
    pinosEl.querySelectorAll(".pino-wrap").forEach(p => p.classList.toggle("sel", p.dataset.id === id));
    lista.querySelectorAll(".local").forEach(c => c.classList.toggle("sel", c.dataset.id === id));

    const card = lista.querySelector(`.local[data-id="${id}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const l = locais.find(x => String(x.id) === id);
    if (l && centralizar === "manter") centralizarEm(l.x, l.y, z);          // clique no pino: só leva até ele
    else if (l && centralizar) centralizarEm(l.x, l.y, Math.max(z, 1.3));   // clique no cartão: aproxima também
}

function fecharPopup() {
    selecionado = null;
    pinosEl.querySelectorAll(".pino-wrap.sel").forEach(p => p.classList.remove("sel"));
    lista.querySelectorAll(".local.sel").forEach(c => c.classList.remove("sel"));
}

/* =====================================================
   3) ZOOM E ARRASTAR
   ===================================================== */
let z = 1, zMin = 1, zInicial = 1, tx = 0, ty = 0, primeiraVez = true;
const Z_MAX = 3.5;

function aplicar() {
    const cw = mapaEl.clientWidth, ch = mapaEl.clientHeight;
    const sw = W * z, sh = H * z;
    /* se o desenho for menor que a janela, centraliza; senão, não deixa sair da área */
    tx = sw <= cw ? (cw - sw) / 2 : Math.min(0, Math.max(cw - sw, tx));
    ty = sh <= ch ? (ch - sh) / 2 : Math.min(0, Math.max(ch - sh, ty));
    viewEl.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
    mapaEl.style.setProperty("--z", z);
}

/* enquadra o centro da cidade (onde ficam os locais) */
function enquadrarCentro() {
    const cw = mapaEl.clientWidth, ch = mapaEl.clientHeight;
    z = zInicial;
    tx = cw / 2 - (600 + OX) * z;
    ty = ch / 2 - (400 + OY) * z;
}

function ajustarTamanho() {
    const cw = mapaEl.clientWidth, ch = mapaEl.clientHeight;
    if (!cw || !ch) return;
    zMin = Math.max(Math.max(cw / W, ch / H), 0.3);                 // o menor zoom ainda cobre a janela toda
    zInicial = Math.max(zMin, cw < 500 ? 0.55 : cw / 1250);         // começa mostrando a cidade central
    if (primeiraVez) { enquadrarCentro(); primeiraVez = false; }
    if (z < zMin) z = zMin;
    aplicar();
}

/* zoom em volta de um ponto da tela (cx, cy em coordenadas do navegador) */
function zoomEm(fator, cx, cy) {
    const r = mapaEl.getBoundingClientRect();
    const px = cx - r.left, py = cy - r.top;
    const novo = Math.min(Z_MAX, Math.max(zMin, z * fator));
    const f = novo / z;
    tx = px - (px - tx) * f;
    ty = py - (py - ty) * f;
    z = novo;
    aplicar();
}

function zoomCentro(fator) {
    const r = mapaEl.getBoundingClientRect();
    viewEl.classList.add("anima");
    zoomEm(fator, r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => viewEl.classList.remove("anima"), 400);
}

function centralizarEm(x, y, zoomAlvo) {
    const cw = mapaEl.clientWidth, ch = mapaEl.clientHeight;
    viewEl.classList.add("anima");
    z = Math.min(Z_MAX, Math.max(zMin, zoomAlvo));
    tx = cw / 2 - (x + OX) * z;
    ty = ch * 0.62 - (y + OY) * z;             // deixa espaço em cima para o balão
    aplicar();
    setTimeout(() => viewEl.classList.remove("anima"), 400);
}

document.getElementById("zoom-in").addEventListener("click", () => zoomCentro(1.4));
document.getElementById("zoom-out").addEventListener("click", () => zoomCentro(1 / 1.4));
document.getElementById("zoom-reset").addEventListener("click", () => {
    viewEl.classList.add("anima");
    enquadrarCentro(); aplicar();
    setTimeout(() => viewEl.classList.remove("anima"), 400);
});

mapaEl.addEventListener("wheel", e => {
    e.preventDefault();
    zoomEm(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
}, { passive: false });

/* arrastar com mouse ou dedo; duas pontas = pinça */
const pontos = new Map();
let inicio = null, arrastou = false, ultimaPinca = 0;

const distPinca = () => { const [a, b] = [...pontos.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
const centroPinca = () => { const [a, b] = [...pontos.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };

mapaEl.addEventListener("pointerdown", e => {
    if (e.target.closest(".mapa-ctrl")) return;
    pontos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    arrastou = false;
    if (pontos.size === 1) inicio = { x: e.clientX, y: e.clientY, tx, ty };
    if (pontos.size === 2) ultimaPinca = distPinca();
});

window.addEventListener("pointermove", e => {
    if (!pontos.has(e.pointerId)) return;
    pontos.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pontos.size === 1 && inicio) {
        const dx = e.clientX - inicio.x, dy = e.clientY - inicio.y;
        if (Math.hypot(dx, dy) > 5) arrastou = true;
        if (arrastou) { tx = inicio.tx + dx; ty = inicio.ty + dy; aplicar(); }
    } else if (pontos.size === 2) {
        arrastou = true;
        const d = distPinca(), c = centroPinca();
        if (ultimaPinca) zoomEm(d / ultimaPinca, c.x, c.y);
        ultimaPinca = d;
    }
});

function soltar(e) {
    pontos.delete(e.pointerId);
    inicio = pontos.size === 1 ? { ...[...pontos.values()][0], tx, ty } : null;
}
window.addEventListener("pointerup", soltar);
window.addEventListener("pointercancel", soltar);

/* depois de arrastar, o "click" que o navegador dispara é ignorado */
mapaEl.addEventListener("click", e => {
    if (arrastou) { e.stopPropagation(); e.preventDefault(); arrastou = false; }
}, true);

/* clique no fundo do mapa: marca onde você está (se estiver nesse modo) ou fecha o balão */
mapaEl.addEventListener("click", e => {
    if (e.target.closest(".pino-wrap, .mapa-ctrl")) return;

    if (modoLocalizar) {
        const r = mapaEl.getBoundingClientRect();
        const x = (e.clientX - r.left - tx) / z - OX;
        const y = (e.clientY - r.top - ty) / z - OY;
        if (x < X0 || y < Y0 || x > X1 || y > Y1) return;
        marcarPosicao(x, y);
    } else {
        fecharPopup();
    }
});

/* =====================================================
   4) "MARCAR ONDE ESTOU" (simula a localização)
   ===================================================== */
btnLoc.addEventListener("click", () => {
    modoLocalizar = !modoLocalizar;
    mapaEl.classList.toggle("modo-loc", modoLocalizar);
    btnLoc.classList.toggle("marcando", modoLocalizar);
    msgLoc.textContent = modoLocalizar ? "Clique no mapa no lugar onde você está." : "";
});

function marcarPosicao(x, y) {
    posicao = { x, y };
    modoLocalizar = false;
    mapaEl.classList.remove("modo-loc");
    btnLoc.classList.remove("marcando");
    btnLoc.textContent = "📍 Mudar onde estou";

    let marca = document.getElementById("voce");
    if (!marca) {
        marca = document.createElement("div");
        marca.id = "voce";
        marca.className = "voce-wrap";
        marca.innerHTML = "<i></i>";
        pinosEl.appendChild(marca);
    }
    marca.style.left = x + "px";
    marca.style.top = y + "px";

    msgLoc.textContent = "Pronto! Os locais mais próximos aparecem primeiro (distâncias aproximadas neste mapa fictício).";
    desenharLista();
}

/* =====================================================
   5) LISTA E FILTROS
   ===================================================== */
function formatarKm(km) { return km.toFixed(1).replace(".", ",") + " km"; }

function locaisVisiveis() {
    let itens = locais.filter(l => filtroAtual === "todos" || l.tipo === filtroAtual);
    if (posicao) {
        itens = itens
            .map(l => ({ ...l, km: Math.hypot(l.x - posicao.x, l.y - posicao.y) * METROS_POR_PX / 1000 }))
            .sort((a, b) => a.km - b.km);
    }
    return itens;
}

function desenharLista() {
    const itens = locaisVisiveis();

    lista.innerHTML = itens.length ? itens.map(l => {
        const distancia = l.km !== undefined
            ? `<span class="dist-km">${formatarKm(l.km)} de você</span>`
            : (l.dist ? `<span class="dist-km">${l.dist}</span>` : "");
        const extra = l.tipo === "inst" ? `<p>Precisa de: ${FC.esc(l.precisa)}</p>` : "";
        const botao = l.tipo === "inst"
            ? `<a class="btn btn-principal btn-sm" href="donate.html?inst=${l.id}">Doar aqui</a>`
            : "";

        return `
            <article class="local${String(l.id) === selecionado ? " sel" : ""}" data-id="${l.id}">
                <div class="local-topo">
                    <h3>${FC.esc(l.nome)}</h3>
                    <span class="tipo-tag ${l.tipo}">${l.tipo === "inst" ? "Instituição" : "Ponto de coleta"}</span>
                </div>
                <p>📍 ${FC.esc(l.endereco)} · ${FC.esc(l.bairro)}</p>
                <p>🕒 ${FC.esc(l.horario)}</p>
                ${extra}
                <p>${distancia}</p>
                ${botao}
            </article>`;
    }).join("") : '<p class="vazio-lista">Nenhum local encontrado.</p>';

    /* clicar num cartão leva o mapa até o local */
    lista.querySelectorAll(".local").forEach(card => {
        card.addEventListener("click", e => {
            if (e.target.closest("a")) return;
            selecionar(card.dataset.id, true);
            mapaEl.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });
}

function aplicarFiltro() {
    pinosEl.querySelectorAll(".pino-wrap").forEach(p => {
        const l = locais.find(x => String(x.id) === p.dataset.id);
        p.classList.toggle("oculto", !(filtroAtual === "todos" || l.tipo === filtroAtual));
    });
    if (selecionado) {
        const l = locais.find(x => String(x.id) === selecionado);
        if (l && filtroAtual !== "todos" && l.tipo !== filtroAtual) fecharPopup();
    }
    desenharLista();
}

document.getElementById("filtros").addEventListener("click", e => {
    const botao = e.target.closest(".filtro[data-filtro]");
    if (!botao) return;
    filtroAtual = botao.dataset.filtro;
    document.querySelectorAll(".filtro[data-filtro]").forEach(b => b.classList.toggle("ativo", b === botao));
    aplicarFiltro();
});

/* dica que some assim que a pessoa mexe no mapa */
mapaEl.insertAdjacentHTML("beforeend", '<div class="mapa-dica" id="mapa-dica">✋ Arraste para explorar a cidade</div>');
const esconderDica = () => document.getElementById("mapa-dica")?.classList.add("some");
mapaEl.addEventListener("pointerdown", esconderDica, { once: true });
mapaEl.addEventListener("wheel", esconderDica, { once: true });

/* =====================================================
   6) INÍCIO
   ===================================================== */
/* os scripts têm "defer": o HTML e o app.js já estão prontos aqui */
desenharCidade();
criarPinos();
aplicarFiltro();
ajustarTamanho();
new ResizeObserver(ajustarTamanho).observe(mapaEl);

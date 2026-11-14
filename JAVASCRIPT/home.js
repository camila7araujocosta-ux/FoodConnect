/* =====================================================
   FoodConnect · home.js
   (tema, navbar e menu agora ficam no app.js)
   ===================================================== */

const s = FC.get();

/* ---------- PAINEL DO JOGADOR ---------- */
const painel = document.getElementById("painel-jogador");

if (s.logado) {
    const n = FC.nivelInfo(s.xp);
    const prontas = FC.missoes().filter(m => m.completa && !m.resgatada).length;

    painel.innerHTML = `
        <div class="card-box painel-card">
            <img class="avatar-grande" src="${s.foto || "../img/perfil.webp"}" alt="Sua foto">
            <div>
                <h3 id="painel-nome"></h3>
                <span class="muted">Nível ${n.nivel} · ${FC.esc(n.titulo)} · ${s.xp} XP</span>
                <div class="barra"><i style="width:0" data-pct="${n.pct}"></i></div>
                <small class="muted">Faltam ${n.falta} XP para o nível ${n.nivel + 1}</small>
            </div>
            <div class="painel-acoes">
                <a href="missions.html" class="btn btn-roxo btn-sm">
                    ${prontas > 0 ? `🎁 ${prontas} missão(ões) para resgatar` : "Ver missões"}
                </a>
                <a href="donate.html" class="btn btn-principal btn-sm">Fazer uma doação</a>
            </div>
        </div>`;

    document.getElementById("painel-nome").textContent = "Olá, " + (s.nome || "doador") + "! 👋";

    /* anima a barra */
    setTimeout(() => {
        const barra = painel.querySelector("[data-pct]");
        barra.style.width = barra.dataset.pct + "%";
    }, 300);

} else {
    painel.innerHTML = `
        <div class="card-box painel-visitante">
            <h2>Doar também é um jogo 🎮</h2>
            <p class="muted">Cada doação rende XP. Suba de nível, complete missões e conquiste insígnias.</p>
            <div class="passos">
                <div class="passo"><span>🥫</span>Doe alimentos</div>
                <div class="passo"><span>⭐</span>Ganhe XP</div>
                <div class="passo"><span>🏆</span>Suba no ranking</div>
            </div>
            <div class="botoes">
                <a href="register.html" class="btn btn-roxo">Criar conta grátis</a>
                <a href="login.html" class="btn btn-secundario">Já tenho conta</a>
            </div>
        </div>`;
}

/* ---------- NOTÍCIAS JÁ LIDAS ---------- */
document.querySelectorAll(".card[data-news]").forEach(card => {
    if (s.noticiasLidas.includes(Number(card.dataset.news))) {
        const tag = card.querySelector(".xp-tag");
        tag.textContent = "✓ Lida";
        tag.classList.add("lida");
    }
});

/* ---------- CONTADORES ANIMADOS ---------- */
function animarContador(el) {
    const alvo = Number(el.dataset.contar);
    const sufixo = el.dataset.sufixo || "";
    const duracao = 1400;
    const inicio = performance.now();

    function passo(agora) {
        const t = Math.min((agora - inicio) / duracao, 1);
        el.textContent = Math.round(alvo * t) + (t === 1 ? sufixo : "");
        if (t < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
}

const obs = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
        if (e.isIntersecting) { animarContador(e.target); obs.unobserve(e.target); }
    });
}, { threshold: .6 });

document.querySelectorAll("[data-contar]").forEach(el => obs.observe(el));

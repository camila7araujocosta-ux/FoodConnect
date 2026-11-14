/* =====================================================
   FoodConnect · news.js
   Dá +10 XP quando a pessoa lê a notícia até o final.
   O id da notícia vem de <body data-news="1">.
   ===================================================== */

const idNoticia = Number(document.body.dataset.news);
const s = FC.get();

const status = document.getElementById("status-leitura");
const sentinela = document.getElementById("fim-artigo");
const barra = document.getElementById("leitura-barra");

/* ---------- barra de progresso de leitura ---------- */
window.addEventListener("scroll", () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.width = (total > 0 ? (window.scrollY / total) * 100 : 100) + "%";
});

/* ---------- XP por leitura ---------- */
function mostrarLida() {
    status.textContent = "✓ Notícia lida! Você já ganhou os 10 XP desta leitura.";
    status.classList.add("ok");
}

if (!s.logado) {
    status.innerHTML = `<a href="login.html?voltar=news${idNoticia}.html">Entre na sua conta</a> para ganhar +10 XP lendo notícias.`;

} else if (s.noticiasLidas.includes(idNoticia)) {
    mostrarLida();

} else {
    status.textContent = "📖 Leia até o final para ganhar +10 XP.";

    let chegouAoFim = false;
    let passouTempo = false;

    function verificar() {
        if (chegouAoFim && passouTempo) {
            FC.lerNoticia(idNoticia);
            mostrarLida();
        }
    }

    /* exige pelo menos 6 segundos de leitura, para não ganhar só rolando a página */
    setTimeout(() => { passouTempo = true; verificar(); }, 6000);

    new IntersectionObserver((entradas, obs) => {
        if (entradas[0].isIntersecting) {
            chegouAoFim = true;
            obs.disconnect();
            if (!passouTempo) status.textContent = "⏳ Quase lá... continue lendo!";
            verificar();
        }
    }).observe(sentinela);
}

/* ---------- "Leia também" ---------- */
const outras = FC.NOTICIAS.filter(n => n.id !== idNoticia);

document.getElementById("relacionadas").innerHTML = `
    <h2>Leia também</h2>
    <div class="rel-grid">
        ${outras.map(n => `
            <a class="rel-item" href="news${n.id}.html">
                <img src="${n.img}" alt="">
                <span>${n.titulo}</span>
                <small>${s.noticiasLidas.includes(n.id) ? "✓ Lida" : "+10 XP"}</small>
            </a>`).join("")}
    </div>`;

/* =====================================================
   FoodConnect · ranking.js
   Os outros participantes são fictícios (dados de exemplo).
   ===================================================== */

if (FC.requerLogin()) {

    const s = FC.get();

    const participantes = [
        { nome: "Ana Beatriz",             tipo: "Doadora",   xp: 1480 },
        { nome: "Carlos Mendes",           tipo: "Doador",    xp: 1260 },
        { nome: "Restaurante Sabor & Cia", tipo: "Empresa",   xp: 1120 },
        { nome: "Mariana Lopes",           tipo: "Doadora",   xp: 940 },
        { nome: "Padaria Pão Quente",      tipo: "Empresa",   xp: 760 },
        { nome: "João Pedro",              tipo: "Doador",    xp: 610 },
        { nome: "Supermercado Bom Preço",  tipo: "Empresa",   xp: 480 },
        { nome: "Lucas Almeida",           tipo: "Doador",    xp: 320 },
        { nome: "Fernanda Rocha",          tipo: "Doadora",   xp: 210 },
        { nome: "Rafael Costa",            tipo: "Doador",    xp: 140 }
    ];

    participantes.push({ nome: (s.nome || "Você"), tipo: s.tipo, xp: s.xp, voce: true });
    participantes.sort((a, b) => b.xp - a.xp);

    const medalhas = ["🥇", "🥈", "🥉"];
    const indiceVoce = participantes.findIndex(p => p.voce);

    /* ---------- dica motivacional ---------- */
    const dica = document.getElementById("dica-rank");
    if (indiceVoce === 0) {
        dica.textContent = "👑 Você está em 1º lugar! Continue assim.";
    } else {
        const acima = participantes[indiceVoce - 1];
        dica.textContent = `Você está em ${indiceVoce + 1}º lugar. Faltam ${acima.xp - s.xp + 1} XP para ultrapassar ${acima.nome}!`;
    }

    /* ---------- pódio ---------- */
    const podio = document.getElementById("podio");
    podio.innerHTML = participantes.slice(0, 3).map((p, i) => `
        <div class="podio-item p${i + 1}">
            <div class="medalha">${medalhas[i]}</div>
            <b class="nome-podio"></b>
            <small class="muted">${p.xp} XP · nível ${FC.nivelInfo(p.xp).nivel}</small>
        </div>`).join("");

    /* nomes entram com textContent (o nome do usuário é digitado por ele) */
    podio.querySelectorAll(".nome-podio").forEach((el, i) => {
        el.textContent = participantes[i].nome + (participantes[i].voce ? " (você)" : "");
    });

    /* ---------- lista completa ---------- */
    const lista = document.getElementById("lista-ranking");
    lista.innerHTML = participantes.map((p, i) => `
        <div class="linha-rank ${p.voce ? "voce" : ""}">
            <span class="pos">${i + 1}º</span>
            <div>
                <b class="nome-linha"></b>
                <small>${FC.esc(p.tipo)} · nível ${FC.nivelInfo(p.xp).nivel} · ${FC.esc(FC.nivelInfo(p.xp).titulo)}</small>
            </div>
            <span class="pts">${p.xp} XP</span>
        </div>`).join("");

    lista.querySelectorAll(".nome-linha").forEach((el, i) => {
        el.textContent = participantes[i].nome + (participantes[i].voce ? " (você)" : "");
    });
}

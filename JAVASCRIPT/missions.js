/* =====================================================
   FoodConnect · missions.js
   ===================================================== */

if (FC.requerLogin()) {
    desenhar();
}

function desenhar() {

    const s = FC.get();
    const n = FC.nivelInfo(s.xp);

    /* ---------- resumo ---------- */
    document.getElementById("resumo-nivel").innerHTML = `
        <div class="nivel-bolha"><small>NÍVEL</small><b>${n.nivel}</b></div>
        <div>
            <h2>${FC.esc(n.titulo)}</h2>
            <span class="muted">${s.xp} XP no total · sequência de ${s.sequencia} dia(s) 🔥</span>
            <div class="barra"><i style="width:0" data-pct="${n.pct}"></i></div>
            <small class="muted">Faltam ${n.falta} XP para o nível ${n.nivel + 1}</small>
        </div>`;

    setTimeout(() => {
        const b = document.querySelector("#resumo-nivel [data-pct]");
        if (b) b.style.width = b.dataset.pct + "%";
    }, 200);

    /* ---------- missões ---------- */
    const lista = document.getElementById("lista-missoes");

    lista.innerHTML = FC.missoes().map(m => {
        const pct = Math.round((m.atual / m.meta) * 100);

        let acao = `<small>${m.atual}/${m.meta}</small>`;
        if (m.resgatada) acao = `<span class="selo-ok">✓ Resgatada</span>`;
        else if (m.completa) acao = `<button class="btn btn-principal btn-sm" data-resgatar="${m.id}">Resgatar</button>`;

        return `
            <article class="card-box missao ${m.resgatada ? "resgatada" : ""}">
                <div class="missao-topo">
                    <span class="missao-icone">${m.icone}</span>
                    <div>
                        <h3>${m.titulo}</h3>
                        <p>${m.desc}</p>
                    </div>
                    <span class="missao-xp">+${m.xp} XP</span>
                </div>
                <div class="missao-rodape">
                    <div class="barra"><i style="width:${pct}%"></i></div>
                    ${acao}
                </div>
            </article>`;
    }).join("");

    lista.querySelectorAll("[data-resgatar]").forEach(btn => {
        btn.addEventListener("click", () => {
            if (FC.resgatar(btn.dataset.resgatar)) {
                /* redesenha depois de um instante, para o aviso de XP aparecer primeiro */
                setTimeout(desenhar, 150);
            }
        });
    });

    /* ---------- insígnias ---------- */
    document.getElementById("grade-insignias").innerHTML = FC.INSIGNIAS.map(b => {
        const tem = s.insignias.includes(b.id);
        return `
            <div class="card-box insignia ${tem ? "" : "bloqueada"}">
                <span class="ic">${tem ? b.icone : "🔒"}</span>
                <b>${b.nome}</b>
                <small>${b.desc}</small>
            </div>`;
    }).join("");
}

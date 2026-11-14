/* =====================================================
   FoodConnect · donate.js
   ===================================================== */

if (FC.requerLogin()) iniciarDoacao();

function iniciarDoacao() {

    const $ = id => document.getElementById(id);
    const form = $("form-doar");
    const erro = $("erro");
    const hoje = new Date().toLocaleDateString("sv-SE");

    $("validade").min = hoje;

    /* ---------- lista de instituições ---------- */
    $("lista-inst").innerHTML = FC.INSTITUICOES.map(i => `
        <div class="inst">
            <input type="radio" name="inst" id="inst${i.id}" value="${i.id}">
            <label for="inst${i.id}">
                <div>
                    <b>${FC.esc(i.nome)}</b>
                    <small>${FC.esc(i.bairro)} · Precisa de: ${FC.esc(i.precisa)}</small>
                </div>
                <span class="dist">${i.dist}</span>
            </label>
        </div>`).join("");

    /* ?inst=3 (vindo do mapa) já deixa a instituição marcada */
    const pre = new URLSearchParams(location.search).get("inst");
    const radioPre = pre && document.getElementById("inst" + Number(pre));
    if (radioPre) radioPre.checked = true;

    /* ---------- recompensa prevista (atualiza enquanto digita) ---------- */
    function atualizarPrevisao() {
        const kg = Number($("kg").value) || 0;
        const xp = FC.xpDoacao(kg);
        const atual = FC.get().xp;
        const depois = FC.nivelInfo(atual + xp);

        $("xp-previsto").textContent = "+" + xp;
        $("barra-prev").style.width = depois.pct + "%";
        $("texto-prev").textContent =
            `Você ficaria com ${atual + xp} XP (nível ${depois.nivel} · ${depois.titulo}).`;
    }
    $("kg").addEventListener("input", atualizarPrevisao);
    atualizarPrevisao();

    /* ---------- envio ---------- */
    form.addEventListener("submit", e => {
        e.preventDefault();

        const alimento = $("alimento").value;
        const kg = Number($("kg").value);
        const validade = $("validade").value;
        const marcada = form.querySelector('input[name="inst"]:checked');
        const obs = $("obs").value.trim();

        if (!alimento) return mostrarErro("Escolha o tipo de alimento.");
        if (!kg || kg < 1 || kg > 200) return mostrarErro("Informe uma quantidade entre 1 e 200 kg.");
        if (!validade) return mostrarErro("Informe a validade do alimento.");
        if (validade < hoje) return mostrarErro("O alimento está vencido. Só aceitamos alimentos dentro da validade.");
        if (!marcada) return mostrarErro("Escolha a instituição que vai receber.");

        erro.textContent = "";

        const instId = Number(marcada.value);
        const inst = FC.INSTITUICOES.find(i => i.id === instId);
        const xp = FC.registrarDoacao({ alimento, kg, instId, validade, obs });

        mostrarSucesso(xp, alimento, kg, inst);
    });

    function mostrarErro(msg) {
        erro.textContent = msg;
        erro.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function mostrarSucesso(xp, alimento, kg, inst) {
        form.hidden = true;
        $("recompensa").hidden = true;

        const n = FC.nivelInfo(FC.get().xp);
        const box = $("sucesso");
        box.hidden = false;
        box.innerHTML = `
            <div class="grande">🎉</div>
            <h2>Doação registrada!</h2>
            <p class="muted">Obrigado por ajudar. Você ganhou <b>+${xp} XP</b>.</p>
            <div class="resumo">
                <p><b>Alimento:</b> ${FC.esc(alimento)}</p>
                <p><b>Quantidade:</b> ${kg} kg</p>
                <p><b>Instituição:</b> ${FC.esc(inst.nome)}</p>
                <p><b>Seu progresso:</b> nível ${n.nivel} · ${FC.esc(n.titulo)} (${FC.get().xp} XP)</p>
            </div>
            <div class="botoes">
                <a href="missions.html" class="btn btn-roxo">Ver missões</a>
                <a href="donate.html" class="btn btn-secundario">Fazer outra doação</a>
                <a href="ranking.html" class="btn btn-secundario">Ver ranking</a>
            </div>`;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

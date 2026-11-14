/* =====================================================
   FoodConnect · profile.js
   ===================================================== */

if (FC.requerLogin()) iniciarPerfil();

function iniciarPerfil() {

    const $ = id => document.getElementById(id);
    const s = FC.get();
    const campos = ["nome", "email", "tipo"];

    /* ---------- desenha tudo que vem do estado ---------- */
    function desenhar() {
        const n = FC.nivelInfo(s.xp);

        $("nome").value = s.nome;
        $("email").value = s.email;
        $("tipo").value = s.tipo;
        $("nome-usuario").textContent = s.nome || "Meu Perfil";
        $("tipo-tag").textContent = s.tipo;
        $("preview").src = s.foto || "../img/perfil.webp";

        $("perfil-nivel").textContent = "Nível " + n.nivel;
        $("perfil-titulo").textContent = n.titulo;
        $("perfil-xp").textContent = `${s.xp} XP · faltam ${n.falta} para o próximo nível`;
        $("sequencia").textContent = s.sequencia;
        setTimeout(() => { $("perfil-barra").style.width = n.pct + "%"; }, 200);

        $("stat-doacoes").textContent = s.doacoes.length;
        $("stat-inst").textContent = FC.instituicoesAtendidas();
        $("stat-kg").textContent = FC.kgTotal() + " kg";

        /* insígnias */
        $("lista-insignias").innerHTML = FC.INSIGNIAS.map(b => {
            const tem = s.insignias.includes(b.id);
            return `<span class="mini-insignia ${tem ? "" : "off"}" title="${FC.esc(b.desc)}">${tem ? b.icone : "🔒"} ${FC.esc(b.nome)}</span>`;
        }).join("");

        /* histórico de doações */
        $("historico").innerHTML = s.doacoes.length
            ? s.doacoes.map(d => `
                <div class="historico-item">
                    <div>
                        <h4>${FC.esc(d.alimento)} · ${d.kg} kg</h4>
                        <small>Para ${FC.esc(d.inst)}</small>
                    </div>
                    <span>${new Date(d.data).toLocaleDateString("pt-BR")}</span>
                </div>`).join("")
            : `<p class="vazio">Você ainda não fez nenhuma doação. <a href="donate.html"><b>Faça a primeira!</b></a></p>`;
    }

    desenhar();

    /* ---------- editar / salvar ---------- */
    function travar(travado) {
        campos.forEach(c => { $(c).disabled = travado; });
        $("btn-salvar").hidden = travado;
        $("btn-editar").hidden = !travado;
    }

    $("btn-editar").addEventListener("click", () => {
        travar(false);
        $("nome").focus();
    });

    $("btn-salvar").addEventListener("click", () => {
        const nome = $("nome").value.trim();
        const email = $("email").value.trim();

        if (nome.length < 2) { $("erro").textContent = "Informe um nome válido."; return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $("erro").textContent = "Informe um e-mail válido."; return; }
        $("erro").textContent = "";

        s.nome = nome;
        s.email = email;
        s.tipo = $("tipo").value;
        FC.salvar();
        FC.toast("Perfil salvo com sucesso!");
        travar(true);
        desenhar();
        FC.verificarInsignias();
    });

    /* ---------- histórico ---------- */
    $("btn-historico").addEventListener("click", () => {
        $("area-doacoes").scrollIntoView({ behavior: "smooth" });
    });

    /* ---------- sair ---------- */
    $("btn-sair-perfil").addEventListener("click", FC.sair);

    /* ---------- foto ---------- */
    $("foto-perfil").addEventListener("click", () => $("fotoInput").click());

    $("fotoInput").addEventListener("change", function () {
        const arquivo = this.files[0];
        if (!arquivo) return;

        FC.redimensionarFoto(arquivo, 256, dataUrl => {
            s.foto = dataUrl;
            FC.salvar();
            $("preview").src = dataUrl;
            document.querySelectorAll(".avatar img").forEach(i => { i.src = dataUrl; });
            FC.toast("Foto atualizada!");
        });
    });
}

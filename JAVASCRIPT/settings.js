/* =====================================================
   FoodConnect · settings.js
   (removido o alert de teste e os nomes de arquivo errados)
   ===================================================== */

if (FC.requerLogin()) {

    const $ = id => document.getElementById(id);
    const s = FC.get();

    /* carrega os valores salvos */
    $("nome").value = s.nome;
    $("tema").checked = s.tema === "dark";
    $("notificacoes").checked = s.notificacoes;
    $("idioma").value = s.idioma;

    /* o tema muda na hora, sem precisar salvar */
    $("tema").addEventListener("change", e => {
        FC.setTema(e.target.checked ? "dark" : "light");
    });

    $("salvar").addEventListener("click", () => {
        const nome = $("nome").value.trim();
        if (nome.length < 2) { FC.toast("Digite um nome válido.", "erro"); return; }

        s.nome = nome;
        s.notificacoes = $("notificacoes").checked;
        s.idioma = $("idioma").value;
        FC.salvar();

        const dd = document.getElementById("dd-nome");
        if (dd) dd.textContent = nome;

        FC.toast("Configurações salvas!");
        FC.verificarInsignias();
    });

    $("apagar").addEventListener("click", () => {
        if (confirm("Tem certeza? Todo o seu progresso será apagado e isso não pode ser desfeito.")) {
            FC.apagarDados();
            FC.agendarAviso("Seus dados foram apagados.", "info");
            location.href = "home.html";
        }
    });
}

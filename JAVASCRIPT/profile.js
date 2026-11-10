// ======================
// CARREGAR DADOS
// ======================

window.addEventListener("load", () => {

    const nomeSalvo = localStorage.getItem("nome") || "Camila";
    const emailSalvo = localStorage.getItem("email") || "camila@gmail.com";
    const tipoSalvo = localStorage.getItem("tipo") || "Doador";

    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const tipoInput = document.getElementById("tipo");

    if (nomeInput) nomeInput.value = nomeSalvo;
    if (emailInput) emailInput.value = emailSalvo;
    if (tipoInput) tipoInput.value = tipoSalvo;

    // Nome exibido no perfil
    const nomeExibicao = document.getElementById("nome-usuario");

    if (nomeExibicao) {
        nomeExibicao.textContent = nomeSalvo;
    }

    // Foto de perfil
    const fotoSalva = localStorage.getItem("fotoPerfil");

    if (fotoSalva) {
        const preview = document.getElementById("preview");

        if (preview) {
            preview.src = fotoSalva;
        }
    }
});


// ======================
// SALVAR PERFIL
// ======================

function salvarPerfil() {

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const tipo = document.getElementById("tipo").value;

    localStorage.setItem("nome", nome);
    localStorage.setItem("email", email);
    localStorage.setItem("tipo", tipo);

    document.getElementById("nome-usuario").textContent = nome;

    alert("Perfil salvo com sucesso!");
}


// ======================
// EDITAR PERFIL
// ======================

function editarPerfil() {

    document.getElementById("nome").disabled = false;
    document.getElementById("email").disabled = false;
    document.getElementById("tipo").disabled = false;

    document.getElementById("nome").focus();
}


// ======================
// MINHAS DOAÇÕES
// ======================

function minhasDoacoes() {
    alert("Funcionalidade em desenvolvimento.");
}


// ======================
// SAIR
// ======================

function sair() {

    localStorage.clear();

    window.location.href = "login.html";
}


// ======================
// FOTO DE PERFIL
// ======================

const fotoInput = document.getElementById("fotoInput");

if (fotoInput) {

    fotoInput.addEventListener("change", function () {

        const arquivo = this.files[0];

        if (!arquivo) return;

        const leitor = new FileReader();

        leitor.onload = function (e) {

            document.getElementById("preview").src =
                e.target.result;

            localStorage.setItem(
                "fotoPerfil",
                e.target.result
            );
        };

        leitor.readAsDataURL(arquivo);
    });
}

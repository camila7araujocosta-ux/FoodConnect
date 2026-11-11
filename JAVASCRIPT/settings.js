alert("config.js carregou");

const tema = document.getElementById("tema");
const nome = document.getElementById("nome");
const salvar = document.getElementById("salvar");

// Carregar dados salvos
window.onload = function () {

    const nomeSalvo = localStorage.getItem("nomeUsuario");
    const temaSalvo = localStorage.getItem("tema");

    if (nomeSalvo) {
        nome.value = nomeSalvo;
    }

    if (temaSalvo === "escuro") {
        tema.checked = true;
        document.body.classList.add("dark-mode");
    }
};

// Alterar tema
tema.addEventListener("change", function () {

    if (tema.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("tema", "escuro");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("tema", "claro");
    }

});

// Salvar nome
salvar.addEventListener("click", function () {

    localStorage.setItem("nomeUsuario", nome.value);

    alert("Configurações salvas!");

});
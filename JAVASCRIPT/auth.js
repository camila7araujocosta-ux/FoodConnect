/* =====================================================
   FoodConnect · auth.js  (login e cadastro)
   Simulação para apresentação: não há servidor de verdade.
   ===================================================== */

const emailValido = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/* Só aceita voltar para páginas .html simples (evita redirecionar para sites de fora) */
function destinoDepoisDoLogin() {
    const voltar = new URLSearchParams(location.search).get("voltar");
    return voltar && /^[a-z0-9_-]+\.html$/i.test(voltar) ? voltar : "home.html";
}

/* ---------- LOGIN ---------- */
const formLogin = document.getElementById("form-login");

if (formLogin) {

    if (FC.get().logado) location.href = "home.html";

    const erro = document.getElementById("erro");

    formLogin.addEventListener("submit", e => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;

        if (!emailValido(email)) { erro.textContent = "Digite um e-mail válido."; return; }
        if (senha.length < 4) { erro.textContent = "A senha precisa ter pelo menos 4 caracteres."; return; }

        const conta = FC.conta();

        /* se já existe uma conta cadastrada, confere e-mail e senha */
        if (conta && conta.email === email && conta.senha !== senha) {
            erro.textContent = "Senha incorreta.";
            return;
        }
        if (conta && conta.email !== email) {
            erro.textContent = "Nenhuma conta encontrada com esse e-mail.";
            return;
        }

        FC.entrar(email);
        FC.agendarAviso("👋 Login realizado com sucesso!", "info");
        location.href = destinoDepoisDoLogin();
    });

    /* acesso rápido para a apresentação */
    document.getElementById("btn-demo").addEventListener("click", () => {
        FC.entrar("camila@gmail.com", "Camila");
        FC.agendarAviso("👋 Bem-vinda, Camila! (conta de demonstração)", "info");
        location.href = destinoDepoisDoLogin();
    });
}

/* ---------- CADASTRO ---------- */
const formCadastro = document.getElementById("form-cadastro");

if (formCadastro) {

    const erro = document.getElementById("erro");

    /* ?tipo=Instituição vem dos botões da home */
    const tipoUrl = new URLSearchParams(location.search).get("tipo");
    if (tipoUrl) {
        const radio = formCadastro.querySelector(`input[name="tipo"][value="${tipoUrl}"]`);
        if (radio) radio.checked = true;
    }

    /* medidor de força da senha */
    const forca = document.getElementById("forca");
    document.getElementById("senha").addEventListener("input", e => {
        const v = e.target.value;
        let pontos = 0;
        if (v.length >= 6) pontos++;
        if (v.length >= 10) pontos++;
        if (/[A-Z]/.test(v) && /[a-z]/.test(v)) pontos++;
        if (/\d/.test(v) || /[^A-Za-z0-9]/.test(v)) pontos++;
        forca.style.width = (pontos * 25) + "%";
        forca.style.background = ["#c0392b", "#c0392b", "#e0a100", "#8bbf3f", "#2e8b57"][pontos];
    });

    formCadastro.addEventListener("submit", e => {
        e.preventDefault();

        const tipo = formCadastro.querySelector('input[name="tipo"]:checked').value;
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;
        const senha2 = document.getElementById("senha2").value;
        const termos = document.getElementById("termos").checked;

        if (nome.length < 2) { erro.textContent = "Informe seu nome."; return; }
        if (!emailValido(email)) { erro.textContent = "Digite um e-mail válido."; return; }
        if (senha.length < 6) { erro.textContent = "A senha precisa ter pelo menos 6 caracteres."; return; }
        if (senha !== senha2) { erro.textContent = "As senhas não conferem."; return; }
        if (!termos) { erro.textContent = "É preciso aceitar os termos de uso."; return; }

        FC.novaConta({ nome, email, senha, tipo });
        location.href = "home.html";
    });
}

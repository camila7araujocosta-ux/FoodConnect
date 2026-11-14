/* =====================================================
   FoodConnect · app.js  (núcleo compartilhado)
   - Estado do jogador salvo no localStorage
   - XP, níveis, missões, insígnias, sequência diária
   - Navbar e rodapé (montados por JS para não repetir HTML)
   - Toasts e modais
   Todas as páginas carregam este arquivo PRIMEIRO.
   ===================================================== */

const FC = (() => {

    const CHAVE = "fc_state";
    const CHAVE_CONTA = "fc_conta";

    const PADRAO = {
        logado: false,
        nome: "", email: "", tipo: "Doador", foto: "",
        xp: 0,
        doacoes: [],
        noticiasLidas: [],
        missoesResgatadas: [],
        insignias: [],
        ultimoDia: "",
        sequencia: 0,
        tema: "light",
        notificacoes: true,
        idioma: "Português"
    };

    /* TODOS OS LOCAIS ABAIXO SÃO FICTÍCIOS (apenas para a apresentação).
       x/y = posição no mapa ilustrado da cidade fictícia (o mapa tem 1200 x 800). */
    const INSTITUICOES = [
        { id: 1, nome: "Instituto Esperança",         bairro: "Centro",        dist: "1,2 km", precisa: "Alimentos não perecíveis", endereco: "Rua das Flores, 120",        horario: "Seg a sex, 8h às 17h", x: 565, y: 365 },
        { id: 2, nome: "Lar Santa Clara",             bairro: "Bairro Jardim", dist: "2,8 km", precisa: "Frutas e verduras",        endereco: "Av. dos Ipês, 450",          horario: "Seg a sáb, 9h às 16h", x: 245, y: 290 },
        { id: 3, nome: "Casa do Amanhã",              bairro: "Vila Nova",     dist: "3,5 km", precisa: "Refeições prontas",        endereco: "Rua Nova Esperança, 87",     horario: "Todos os dias, 10h às 20h", x: 865, y: 615 },
        { id: 4, nome: "Associação Mãos Unidas",      bairro: "São José",      dist: "4,1 km", precisa: "Pães e laticínios",        endereco: "Rua São José, 300",          horario: "Seg a sex, 7h às 15h", x: 140, y: 115 },
        { id: 5, nome: "Cozinha Solidária Bom Prato", bairro: "Zona Sul",      dist: "5,0 km", precisa: "Qualquer alimento",        endereco: "Av. Brasil, 1.500",          horario: "Seg a sáb, 8h às 18h", x: 565, y: 770 }
    ];

    /* Pontos de coleta: locais onde o doador deixa os alimentos e
       a rede de instituições busca depois. Também fictícios. */
    const PONTOS_COLETA = [
        { id: "c1", nome: "Mercado Central Verde",    bairro: "Centro",        endereco: "Praça do Mercado, s/n",       horario: "Todos os dias, 7h às 19h", x: 655, y: 290 },
        { id: "c2", nome: "Escola Municipal Aprendiz", bairro: "Bairro Jardim", endereco: "Rua da Escola, 55",          horario: "Seg a sex, 8h às 17h",     x: 355, y: 205 },
        { id: "c3", nome: "Paróquia São Francisco",   bairro: "Vila Nova",     endereco: "Largo da Matriz, 10",        horario: "Ter a dom, 8h às 19h",     x: 965, y: 290 },
        { id: "c4", nome: "Shopping Praça Viva",      bairro: "Zona Leste",    endereco: "Entrada principal, piso térreo", horario: "Todos os dias, 10h às 22h", x: 1060, y: 115 },
        { id: "c5", nome: "Padaria Pão Quente",       bairro: "São José",      endereco: "Rua do Comércio, 210",       horario: "Todos os dias, 6h às 20h", x: 465, y: 115 },
        { id: "c6", nome: "Campus Universitário",     bairro: "Zona Oeste",    endereco: "Bloco A, hall de entrada",   horario: "Seg a sex, 7h às 21h",     x: 140, y: 445 }
    ];

    const NOTICIAS = [
        { id: 1, titulo: "Cada alimento pode fazer a diferença", img: "../img/doacao.avif" },
        { id: 2, titulo: "Solidariedade que transforma",         img: "../img/doacao2.jpg" },
        { id: 3, titulo: "Doações que geram impacto",            img: "../img/doacao3.webp" },
        { id: 4, titulo: "Todos podem combater o desperdício",   img: "../img/doacao4.webp" }
    ];

    const TITULOS = ["Semente", "Broto", "Cultivador", "Colhedor", "Chef Solidário", "Herói da Comida", "Lenda FoodConnect"];

    /* ---------- ESTADO ---------- */
    let estado = carregar();

    function carregar() {
        try {
            return Object.assign(structuredClone(PADRAO), JSON.parse(localStorage.getItem(CHAVE)) || {});
        } catch (e) {
            return structuredClone(PADRAO);
        }
    }

    function salvar() {
        try {
            localStorage.setItem(CHAVE, JSON.stringify(estado));
        } catch (e) {
            toast("Não foi possível salvar (armazenamento cheio).", "erro");
        }
    }

    const get = () => estado;

    /* escapa texto digitado pelo usuário antes de usar em innerHTML */
    function esc(texto) {
        return String(texto).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    /* ---------- NÍVEIS ---------- */
    function nivelInfo(xp) {
        const nivel = Math.floor(xp / 100) + 1;
        return {
            nivel,
            titulo: TITULOS[Math.min(nivel - 1, TITULOS.length - 1)],
            dentro: xp % 100,
            pct: xp % 100,
            falta: 100 - (xp % 100)
        };
    }

    /* ---------- DADOS DERIVADOS ---------- */
    const kgDe = s => s.doacoes.reduce((t, d) => t + Number(d.kg), 0);
    const instDe = s => new Set(s.doacoes.map(d => d.instId)).size;
    const kgTotal = () => kgDe(estado);
    const instituicoesAtendidas = () => instDe(estado);
    const xpDoacao = kg => 20 + Math.min(Math.max(kg, 0), 50) * 4;

    /* ---------- MISSÕES ---------- */
    const MISSOES = [
        { id: "m1", icone: "🥫", titulo: "Primeira doação",   desc: "Registre sua primeira doação.",             xp: 50,  prog: s => [s.doacoes.length, 1] },
        { id: "m2", icone: "⚖️", titulo: "Cinco quilos de amor", desc: "Doe 5 kg de alimentos no total.",         xp: 60,  prog: s => [kgDe(s), 5] },
        { id: "m3", icone: "📰", titulo: "Bem informado",     desc: "Leia 2 notícias até o final.",              xp: 30,  prog: s => [s.noticiasLidas.length, 2] },
        { id: "m4", icone: "🪪", titulo: "Perfil completo",   desc: "Preencha nome, e-mail e envie uma foto.",   xp: 40,  prog: s => [(s.nome ? 1 : 0) + (s.email ? 1 : 0) + (s.foto ? 1 : 0), 3] },
        { id: "m5", icone: "🏠", titulo: "Rede do bem",       desc: "Doe para 3 instituições diferentes.",       xp: 100, prog: s => [instDe(s), 3] },
        { id: "m6", icone: "🔥", titulo: "Constância",        desc: "Visite o site 3 dias seguidos.",            xp: 50,  prog: s => [s.sequencia, 3] }
    ];

    function missoes() {
        return MISSOES.map(m => {
            const [atual, meta] = m.prog(estado);
            return {
                ...m,
                atual: Math.min(atual, meta),
                meta,
                completa: atual >= meta,
                resgatada: estado.missoesResgatadas.includes(m.id)
            };
        });
    }

    function resgatar(id) {
        const m = missoes().find(x => x.id === id);
        if (!m || !m.completa || m.resgatada) return false;
        estado.missoesResgatadas.push(id);
        ganharXP(m.xp, "Missão: " + m.titulo);
        return true;
    }

    /* ---------- INSÍGNIAS ---------- */
    const INSIGNIAS = [
        { id: "b1", icone: "🌱", nome: "Primeiros passos", desc: "Fez a primeira doação",      ok: s => s.doacoes.length >= 1 },
        { id: "b2", icone: "📖", nome: "Leitor atento",    desc: "Leu todas as notícias",       ok: s => s.noticiasLidas.length >= NOTICIAS.length },
        { id: "b3", icone: "🤝", nome: "Solidário",        desc: "Realizou 5 doações",          ok: s => s.doacoes.length >= 5 },
        { id: "b4", icone: "🏠", nome: "Rede do bem",      desc: "Ajudou 3 instituições",       ok: s => instDe(s) >= 3 },
        { id: "b5", icone: "🏋️", nome: "50 kg doados",     desc: "Somou 50 kg em doações",      ok: s => kgDe(s) >= 50 },
        { id: "b6", icone: "⭐", nome: "Nível 5",          desc: "Chegou ao nível 5",           ok: s => nivelInfo(s.xp).nivel >= 5 },
        { id: "b7", icone: "🔥", nome: "Em chamas",        desc: "3 dias seguidos de visita",   ok: s => s.sequencia >= 3 }
    ];

    function verificarInsignias() {
        if (!estado.logado) return;
        let mudou = false;
        INSIGNIAS.forEach(b => {
            if (b.ok(estado) && !estado.insignias.includes(b.id)) {
                estado.insignias.push(b.id);
                mudou = true;
                toast(`🏅 Nova insígnia: ${b.nome}`, "insignia");
            }
        });
        if (mudou) salvar();
    }

    /* ---------- XP ---------- */
    function ganharXP(qtd, motivo) {
        const antes = nivelInfo(estado.xp).nivel;
        estado.xp += qtd;
        salvar();
        toast(`+${qtd} XP · ${motivo}`, "xp");
        atualizarChip();
        const depois = nivelInfo(estado.xp).nivel;
        if (depois > antes) setTimeout(() => modalNivel(depois), 700);
        verificarInsignias();
    }

    function registrarDoacao({ alimento, kg, instId, validade, obs }) {
        const inst = INSTITUICOES.find(i => i.id === instId);
        const xp = xpDoacao(kg);
        estado.doacoes.unshift({
            alimento, kg: Number(kg), instId, inst: inst.nome,
            validade, obs, data: new Date().toISOString()
        });
        ganharXP(xp, "Doação registrada");
        return xp;
    }

    function lerNoticia(id) {
        if (estado.noticiasLidas.includes(id)) return false;
        estado.noticiasLidas.push(id);
        ganharXP(10, "Notícia lida");
        return true;
    }

    function bonusDiario() {
        if (!estado.logado) return;
        const hoje = new Date().toLocaleDateString("sv-SE");
        if (estado.ultimoDia === hoje) return;
        const ontem = new Date(Date.now() - 864e5).toLocaleDateString("sv-SE");
        estado.sequencia = estado.ultimoDia === ontem ? estado.sequencia + 1 : 1;
        estado.ultimoDia = hoje;
        salvar();
        ganharXP(10, `Visita diária (sequência: ${estado.sequencia})`);
    }

    /* ---------- CONTA (apenas demonstração!) ---------- */
    /* Atenção: guardar senha no localStorage NÃO é seguro. Serve só
       para simular login numa apresentação; num site real isso fica
       num servidor, com senha criptografada. */
    function conta() {
        try { return JSON.parse(localStorage.getItem(CHAVE_CONTA)); } catch (e) { return null; }
    }

    function novaConta({ nome, email, senha, tipo }) {
        localStorage.setItem(CHAVE_CONTA, JSON.stringify({ email, senha }));
        const tema = estado.tema;
        estado = Object.assign(structuredClone(PADRAO), { nome, email, tipo, tema, logado: true, xp: 50 });
        salvar();
        agendarAviso("🎉 Conta criada! Você ganhou 50 XP de boas-vindas.", "xp");
    }

    function entrar(email, nome) {
        estado.logado = true;
        estado.email = email;
        if (!estado.nome) estado.nome = nome || email.split("@")[0];
        salvar();
    }

    function sair() {
        estado.logado = false;
        salvar();
        location.href = "login.html";
    }

    function apagarDados() {
        const tema = estado.tema;
        localStorage.removeItem(CHAVE);
        localStorage.removeItem(CHAVE_CONTA);
        estado = Object.assign(structuredClone(PADRAO), { tema });
        salvar();
    }

    function requerLogin() {
        if (estado.logado) return true;
        const atual = location.pathname.split("/").pop() || "home.html";
        location.href = "login.html?voltar=" + encodeURIComponent(atual);
        return false;
    }

    /* aviso que aparece na PRÓXIMA página (depois de um redirecionamento) */
    function agendarAviso(msg, tipo) {
        try { sessionStorage.setItem("fc_aviso", JSON.stringify([msg, tipo || "info"])); } catch (e) { }
    }

    function mostrarAvisoAgendado() {
        try {
            const a = JSON.parse(sessionStorage.getItem("fc_aviso"));
            if (a) { sessionStorage.removeItem("fc_aviso"); toast(a[0], a[1]); }
        } catch (e) { }
    }

    /* ---------- TOAST E MODAL ---------- */
    function toast(msg, tipo = "info") {
        let box = document.getElementById("toasts");
        if (!box) {
            box = document.createElement("div");
            box.id = "toasts";
            document.body.appendChild(box);
        }
        const t = document.createElement("div");
        t.className = "toast " + tipo;
        t.textContent = msg;
        box.appendChild(t);
        setTimeout(() => { t.classList.add("sai"); setTimeout(() => t.remove(), 400); }, 3400);
    }

    function modal(html, textoBotao = "Continuar") {
        const fundo = document.createElement("div");
        fundo.className = "modal-fundo";
        fundo.innerHTML = `<div class="modal">${html}<button class="btn btn-roxo">${textoBotao}</button></div>`;
        fundo.querySelector("button").onclick = () => fundo.remove();
        fundo.onclick = e => { if (e.target === fundo) fundo.remove(); };
        document.body.appendChild(fundo);
    }

    function modalNivel(n) {
        const info = nivelInfo(estado.xp);
        modal(`<div class="grande">🎉</div><h2>Subiu de nível!</h2><p>Você chegou ao <b>nível ${n}</b> — ${esc(info.titulo)}.<br>Continue ajudando para evoluir ainda mais.</p>`, "Continuar");
    }

    /* ---------- TEMA ---------- */
    function aplicarTema() {
        document.body.classList.toggle("dark", estado.tema === "dark");
        const btn = document.getElementById("theme-btn");
        if (btn) btn.textContent = estado.tema === "dark" ? "☀️" : "🌙";
    }

    function setTema(t) {
        estado.tema = t;
        salvar();
        aplicarTema();
    }

    /* ---------- FOTO ---------- */
    /* reduz a foto para caber no localStorage */
    function redimensionarFoto(arquivo, lado, cb) {
        const leitor = new FileReader();
        leitor.onload = e => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement("canvas");
                c.width = c.height = lado;
                const m = Math.min(img.width, img.height);
                c.getContext("2d").drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, lado, lado);
                cb(c.toDataURL("image/jpeg", 0.85));
            };
            img.onerror = () => toast("Não consegui abrir essa imagem.", "erro");
            img.src = e.target.result;
        };
        leitor.readAsDataURL(arquivo);
    }

    /* ---------- NAVBAR E RODAPÉ ---------- */
    function atualizarChip() {
        const n = nivelInfo(estado.xp);
        const a = document.getElementById("chip-nivel");
        const b = document.getElementById("chip-barra");
        const c = document.getElementById("chip-xp");
        if (a) a.textContent = "Nv " + n.nivel;
        if (b) b.style.width = n.pct + "%";
        if (c) c.textContent = estado.xp + " XP";
    }

    function montarLayout() {
        const nav = document.getElementById("navbar");
        if (nav) {
            const pagina = location.pathname.split("/").pop() || "home.html";
            const links = [["home.html", "Início"], ["donate.html", "Doar"], ["missions.html", "Missões"], ["map.html", "Mapa"], ["ranking.html", "Ranking"], ["#footer", "Contato"]]
                .map(([h, t]) => `<a href="${h}"${h === pagina ? ' class="ativo"' : ""}>${t}</a>`).join("");
            const n = nivelInfo(estado.xp);

            const chip = estado.logado
                ? `<a class="xp-chip" href="missions.html" title="Ver missões"><b id="chip-nivel">Nv ${n.nivel}</b><span class="mini"><i id="chip-barra" style="width:${n.pct}%"></i></span><small id="chip-xp">${estado.xp} XP</small></a>`
                : "";

            const usuario = estado.logado
                ? `<div class="avatar-wrap">
                        <button class="avatar" id="avatar-btn" aria-label="Menu do usuário"><img src="${estado.foto || "../img/perfil.webp"}" alt="Foto de perfil"></button>
                        <div class="dropdown" id="dropdown">
                            <span class="dropdown-nome" id="dd-nome"></span>
                            <a href="profile.html">👤 Meu perfil</a>
                            <a href="settings.html">⚙️ Configurações</a>
                            <button id="btn-sair">🚪 Sair</button>
                        </div>
                   </div>`
                : `<a href="login.html" class="btn btn-principal btn-sm">Entrar</a>`;

            nav.innerHTML = `
                <a href="home.html" class="brand"><img src="../img/logo.png" alt="Logo FoodConnect"></a>
                <nav class="navbar-links" id="nav-links">${links}</nav>
                <div class="nav-right">
                    ${chip}
                    <button id="theme-btn" aria-label="Alternar tema">🌙</button>
                    ${usuario}
                    <button class="hamb" id="hamb" aria-label="Abrir menu">☰</button>
                </div>`;

            const dd = document.getElementById("dd-nome");
            if (dd) dd.textContent = estado.nome || "Visitante";

            document.getElementById("theme-btn").onclick = () => setTema(estado.tema === "dark" ? "light" : "dark");
            document.getElementById("hamb").onclick = () => document.getElementById("nav-links").classList.toggle("aberto");
            document.getElementById("nav-links").onclick = e => { if (e.target.tagName === "A") e.currentTarget.classList.remove("aberto"); };

            const av = document.getElementById("avatar-btn");
            if (av) {
                av.onclick = e => { e.stopPropagation(); document.getElementById("dropdown").classList.toggle("aberto"); };
                document.addEventListener("click", () => document.getElementById("dropdown").classList.remove("aberto"));
                document.getElementById("btn-sair").onclick = sair;
            }
        }

        const rod = document.getElementById("footer");
        if (rod) {
            rod.innerHTML = `
                <img src="../img/logo.png" alt="Logo FoodConnect" class="footer-logo">
                <p>FoodConnect &copy; 2026 · Projeto acadêmico de demonstração</p>
                <div class="footer-links">
                    <a href="home.html">Início</a><a href="donate.html">Doar</a><a href="map.html">Mapa</a>
                    <a href="ranking.html">Ranking</a><a href="settings.html">Configurações</a>
                    <a href="mailto:contato@foodconnect.com">contato@foodconnect.com</a>
                </div>`;
        }
    }

    /* ---------- BOTÃO VOLTAR ---------- */
    /* Volta para a página anterior do histórico; se a pessoa abriu
       esta página direto (sem histórico), vai para o início. */
    function voltar() {
        if (history.length > 1) history.back();
        else location.href = "home.html";
    }

    function montarBotaoVoltar() {
        const pagina = location.pathname.split("/").pop() || "home.html";
        if (pagina === "home.html" || /^news\d/.test(pagina)) return;   /* a home não precisa; as notícias já têm o seu */
        const main = document.querySelector("main");
        if (!main) return;
        const b = document.createElement("a");
        b.href = "home.html";
        b.className = "btn-back";
        b.setAttribute("data-voltar", "");
        b.textContent = "← Voltar";
        main.prepend(b);
    }

    document.addEventListener("click", e => {
        const alvo = e.target.closest("[data-voltar]");
        if (alvo) { e.preventDefault(); voltar(); }
    });

    /* animação de entrada dos elementos .reveal */
    function ativarReveal() {
        const itens = document.querySelectorAll(".reveal");
        if (!("IntersectionObserver" in window)) { itens.forEach(i => i.classList.add("visivel")); return; }
        const obs = new IntersectionObserver(es => es.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); }
        }), { threshold: .15 });
        itens.forEach(i => obs.observe(i));
    }

    /* ---------- INICIALIZAÇÃO ---------- */
    /* os scripts usam "defer": o HTML já está pronto quando chegamos aqui */
    aplicarTema();
    montarLayout();
    montarBotaoVoltar();
    aplicarTema();
    ativarReveal();
    mostrarAvisoAgendado();
    bonusDiario();
    verificarInsignias();

    return {
        get, salvar, esc, nivelInfo, toast, modal,
        INSTITUICOES, PONTOS_COLETA, NOTICIAS, INSIGNIAS,
        kgTotal, instituicoesAtendidas, xpDoacao,
        missoes, resgatar, ganharXP, registrarDoacao, lerNoticia, verificarInsignias,
        conta, novaConta, entrar, sair, apagarDados, requerLogin, agendarAviso,
        setTema, redimensionarFoto
    };
})();

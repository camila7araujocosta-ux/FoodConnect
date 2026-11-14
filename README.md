# FoodConnect

Projeto acadêmico (HTML, CSS e JavaScript puros, sem servidor).

## Como usar

1. Copie a sua pasta `img` (logo.png, perfil.webp, doacao.avif, doacao2.jpg, doacao3.webp, doacao4.webp) para dentro desta pasta, no lugar da `img` vazia.
2. Abra `index.html` (ou `HTML/home.html`) no navegador. Live Server do VS Code também funciona.
3. Na tela de login, use **"Entrar como visitante (demonstração)"** para entrar rápido na apresentação.

## Estrutura

```
foodconnect/
├── HTML/   home, login, register, donate, map, missions, ranking, profile, settings, news1-4
├── CSS/    base (tema + componentes), home, auth, donate, map, game, profile, settings, news
├── JAVASCRIPT/
│   ├── app.js   núcleo: estado, XP, níveis, missões, insígnias, navbar, rodapé, tema
│   └── um .js por página
└── img/    suas imagens
```

## Gamificação

- **XP**: doação (20 + 4 por kg), notícia lida (+10), visita diária (+10), boas-vindas (+50), missões.
- **Níveis**: a cada 100 XP, com título (Semente, Broto, Cultivador...).
- **Missões**: 6 missões com barra de progresso e botão "Resgatar".
- **Insígnias**: 7 conquistas desbloqueadas automaticamente.
- **Ranking**: você contra participantes fictícios.
- **Sequência diária**: dias seguidos visitando o site.

Tudo fica salvo no `localStorage` do navegador. Para zerar: Configurações > Apagar todos os meus dados.

## Aviso

Login e senha são só uma simulação para a apresentação. Em um site real isso é feito em um servidor, com senha criptografada.

## Mapa (map.html)

- É um **mapa ilustrativo de uma cidade fictícia**, desenhado em SVG pelo `map.js` (ruas, avenidas, rio com pontes, lago, praças, prédios e rotatórias). Não usa internet nem biblioteca externa.
- A cidade é bem maior que a tela: **arraste com o mouse (ou o dedo)** para explorar. Zoom pelos botões, roda do mouse ou pinça. O botão ⌂ volta ao centro.
- "Marcar onde estou" simula a localização: clique no mapa e a lista passa a mostrar as distâncias.
- Instituições e pontos de coleta ficam em `JAVASCRIPT/app.js` (`INSTITUICOES` e `PONTOS_COLETA`), com posição `x` e `y`. **Todos são fictícios.**
- O tamanho do mundo (`W`, `H`) e o centro (`OX`, `OY`) ficam no começo do `map.js`. As ruas do centro estão em `RUAS_V_CENTRO` e `RUAS_H_CENTRO`; o resto da cidade é gerado a partir delas.

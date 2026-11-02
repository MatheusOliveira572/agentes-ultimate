# Tiras de quadros com relógio controlado (modelo)

Texto próprio do agentes-ultimate, a partir das provas hd102 e hd103 (`docs/provas/0.8.0-design/vitrine/tiras.js` e
`e2e/tiras-v2.js`). Regra e contexto em `conhecimento/design/nivel-hd.md` (verificação).

**O que faz:** abre a página no Edge ou no Chrome sem interface (perfil próprio, nada na tela do usuário), a 2×, dispara a
transição e tira um quadro por tempo escolhido com o **relógio nosso**: todas as animações da linha do tempo do documento (CSS,
transições, Web Animations, View Transitions) são pausadas e postas em `currentTime = t`. Junta os quadros numa tira com o tempo
escrito embaixo e mede a curva da posição.

**Uso:** `node <plugin>/modelos/tiras/tiras.js <roteiro.js> [nome | tudo]`. Exemplo: `exemplo/roteiro.js` (o cartão de
`exemplo/pagina.html`, com a mola gerada por `modelos/mola-linear.js`). Com `TIRAS_MUTAR=seco`, a página troca a mola por
`steps()` e a curva **tem de** reprovar. Linha final `RESUMO tiras: ...`; sai 1 se alguma curva reprovar.

**O roteiro** exporta `{ saida, tiras: { nome: async (t) => ({ quadros, rotulos, colunas, posicoes, limites }) } }`. A API `t`:
- `t.abrir(url, { tema, largura, altura, escala, reduzido, pronto })`: 2× por padrão; `pronto` é uma expressão que diz quando a
  página está pronta (ex.: o WebGL subiu);
- `t.congelar(ms)`: pausa e põe as animações em `ms` desde o gatilho; as animações por rolagem ficam de fora (não aceitam tempo
  absoluto);
- `t.quadro(recorte, escala)`: o recorte é em coordenadas da **página** (some `scrollX`/`scrollY`);
- `t.av(expr)`: avalia na página. Para WebGL ou mola em JS, a página expõe um gancho que avança a mola por passo fixo
  (ex.: `window.__prova.avancar(50)`), em vez de esperar o relógio da máquina;
- `t.curva(posicoes, limites)`: a mesma análise que o executor faz.

**A curva** ([HIPÓTESE]: limites escolhidos nas provas, sem fonte aberta): o 1º passo não pode ser o maior (salto); o último
passo ≤ 8% do maior (parada seca); recuo ≤ 1% do percurso; nenhum quadro leva mais de 50% do percurso (degrau). Ponha a posição
de antes do gatilho no 1º quadro. Mola com quique passa do alvo de propósito: `limites.recuoMax` ≥ o "passa" da mola.

**Não use** `HeadlessExperimental.beginFrame` nem espera por tempo de máquina para quadro de transição.

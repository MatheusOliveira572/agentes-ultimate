<!-- Texto próprio do agentes-ultimate, a partir do estudo visual de 2026-11-01 (docs/referencias-visuais-2026-11.md): só padrão e proporção, nada copiado dos sites estudados. -->
<!-- ref: tema=site-heroi-simulacao; palavras=heroi com simulacao, simulacao viva, produto vivo, heroi animado; agentes=designer-sites, engenheiro-software -->
<!-- teste-ref: sim=faça um herói com simulação viva do produto | quero mostrar o produto vivo no herói animado da página; nao=registre o boletim de ocorrência do furto -->
# R2. Herói com produto vivo (simulação)

Repertório, não molde: use, combine, corte ou vá além, a partir da direção própria do projeto. Medidas sem marca são [ESTIMATIVA: ponto de partida nosso]. Regras que valem para todas: `INDICE.md`.

- **Quando usar:** o valor está no que acontece (algo entra, se organiza, responde). Exige uma ideia clara em 3–6 s.
- **Estrutura:** painel com um a três eventos em ciclo; cartões-satélite saindo do painel; controle visível de pausa.
- **Medidas:** cada passo 1,5–3 s, transição 0,3–0,5 s, 3–6 estados em ciclo; no máximo 3 satélites.
- **Estados:** tocando, pausado, reduzido (última cena parada e completa), fora da tela (para de rodar).
- **Celular:** o painel inteiro cabe sem rolagem interna; satélites somem ou viram fila abaixo.
- **Acessibilidade:** mais de 5 s em paralelo ao conteúdo exige meio de pausar (WCAG 2.2.2); nada de anúncio ao vivo a cada
  passo; `aria-hidden` no decorativo, com uma frase-resumo.
- **Erro comum:** simulação que muda valores e parece erro ao recarregar. Animar 3 coisas ao mesmo tempo.

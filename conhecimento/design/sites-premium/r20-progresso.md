<!-- Texto próprio do agentes-ultimate, a partir do estudo visual de 2026-11-01 (docs/referencias-visuais-2026-11.md): só padrão e proporção, nada copiado dos sites estudados. -->
<!-- ref: tema=site-progresso; palavras=anel de progresso, barra de progresso, calendario termometro, mapa de calor do calendario; agentes=designer-sites, designer-paineis, engenheiro-software -->
<!-- teste-ref: sim=faça um anel de progresso com a meta do mês | quero um calendário termômetro com mapa de calor do calendário; nao=calcule a depreciação do imobilizado -->
# R20. Progresso em anel, barra e calendário

Repertório, não molde: use, combine, corte ou vá além, a partir da direção própria do projeto. Medidas sem marca são [ESTIMATIVA: ponto de partida nosso]. Regras que valem para todas: `INDICE.md`.

- **Quando usar:** meta, limite, parcelas ou "como vai o mês" em um golpe de vista.
- **Estrutura:** barra (rótulo, valor de × a), anel (fração no centro, ex. 5/10), calendário-termômetro (dia + intensidade).
- **Medidas:** barra 6–10 px com raio pleno; anel 40–64 px, traço 4–6 px; célula 28–36 px com raio 6–8 px, intervalo 4–6 px; cor em 3–5 níveis.
- **Estados:** 0%, 100%, acima de 100% (cor + texto), sem dado (cinza com tracejado).
- **Celular:** célula ≥ 32 px quando for tocável, com detalhe ao tocar.
- **Acessibilidade:** valor em texto sempre; dia do calendário com `aria-label` completo; mapa de calor com níveis distintos sem cor (ou valor).
- **Erro comum:** vermelho e verde como único código. Rosca para comparar muitas partes.

**Prova:** usada na página de `docs/provas/0.8.0-sites/` (site-preamar.html); os valores escolhidos ali passaram nas checagens de `resultado.json`. A faixa acima continua [ESTIMATIVA].

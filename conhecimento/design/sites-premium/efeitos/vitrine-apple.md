<!-- Texto próprio do agentes-ultimate, a partir do pedido de 2026-11-02 e da prova pv94 (docs/provas/0.8.0-design/e2e/): técnica descrita em palavras, nada copiado. Receita do mundo Apple, não padrão do plugin. -->
<!-- ref: tema=efeito-vitrine-apple; palavras=vitrine apple, cara de apple na landing, 3d e revelacao ao rolar, revelacao ao rolar, liquid glass na landing, landing com 3d; agentes=designer-sites, engenheiro-software -->
<!-- teste-ref: sim=quero a landing com cara de apple, liquid glass, 3d e revelação ao rolar | faça a vitrine apple da página do produto; nao=monte a escala de plantão da equipe -->
# H. Vitrine Apple: Liquid Glass + 3D + revelação ao rolar, numa ideia só

Receita do **mundo Apple** (`../../mundos/apple-liquid-glass.md`) na landing; não é o padrão do plugin. O mundo vem do
briefing e da marca (`../../mundos/INDICE.md`). Em qualquer mundo, **3D e revelação ao rolar** são camada de impacto
**quando o mundo e a ideia pedem**, com os limites abaixo; o **vidro** só no mundo Apple ou quando pedido. Não é lista de
compras: o que entra serve à **mesma ideia** do produto.

## Como costurar
1. Escreva a ideia numa frase e escolha **o dominante** (o que fica na memória). Os outros dois apoiam.
2. Uma luz, uma curva, um material, uma paleta: o aro do vidro, o brilho das peças 3D e a sombra apontam para a mesma
   luz (o ponteiro; sem ponteiro, de cima à esquerda); todas as entradas usam a mesma mola curta.
3. Teste de junção (`../../impressionar.md`): cada efeito com 1 linha de função; o que não faz falta sai.

## Receitas
- **Liquid Glass** (navegação, controles, e na landing também o cartão-vitrine, dentro dos limites do `../../apple/materiais.md`):
  a receita e o teste "parece Apple" de `apple/materiais.md`; módulo pronto `modelos/liquid-glass/` (ex-`liquido.css/js`).
  Ponha conteúdo vivo atrás (foto, produto, gradiente com estrutura): vidro sobre fundo liso não mostra lente.
- **3D:** `perspective` 800–1200 px; inclinação ≤ 8° ao seguir o ponteiro (só `hover: hover`), ≤ 18° na entrada; nada
  de rotação contínua. Só `transform` e `opacity`.
- **Revelação ao rolar:** `animation-timeline: view()` com `animation-range: entry 0% entry 80–85%` (a peça sobe 18–36 px
  e deita de 12–18° para 0); estado final completo e legível; `@supports` para os navegadores sem suporte (aparece pronto).
  Escalonar por `--i` 30–40 ms quando entra em grupo.
- **Mola curta** (a mesma em tudo): `linear(0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%, 1.017 20.4%,
  1.067, 1.077 26.1%, 1.069 28.6%, 1.033 33.5%, 0.997 39.6%, 0.988 44.3%, 0.997 55.6%, 1.001 69.1%, 1)`, 460–620 ms.

## Limites (falhou um, sai)
Sem sequestrar a rolagem; texto visível sem JS e em qualquer instante da captura; ≤ 1 efeito dominante e ≤ 3 tipos por
página; `prefers-reduced-motion` (sem deslocamento, escala, inclinação nem paralaxe), `prefers-reduced-transparency`
(sem lente) e `prefers-contrast` testados; INP ≤ 200 ms e CLS ≤ 0,1 medidos com CPU 4× mais lenta; no celular, lente só
em peça pequena.

## Prova (provas.md)
Prova pv94 (`docs/provas/0.8.0-design/e2e/`): lente vista na ampliação 2× (`caso-b-produto-v2-claro-1440-rolado-zoom.png`),
tom que muda com a foto de trás (`medidas-v2-b.json`, campo `tons`), contraste no pior ponto ≥ 4,67:1, redução de
movimento com 0 animação rodando. Landing completa: a cargo do `designer-sites` (próxima prova).

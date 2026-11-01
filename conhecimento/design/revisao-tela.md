<!-- Adaptado de jakubkrehel/skills/skills/better-interface/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT. Alterações: tradução, corte; semáforo por impacto e "o que funciona" pela ideia do Superfuture design review (Figma Community, só a ideia, texto nosso); alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/. -->
<!-- ref: tema=revisao-de-tela; palavras=revisar a tela, revisao de tela, revisao de design, revisar o design, revisar a interface, semaforo, o que funciona, site institucional, site bonito, visual premium, redesenhe, redesenho, app; agentes=revisor, designer-paineis -->
<!-- teste-ref: sim=revise a tela nova antes de ir ao usuário, com semáforo por impacto | faça a revisão de design da interface do app com o que funciona e o que corrigir; nao=faça a declaração do imposto de renda -->
# Revisão de tela: prova, não gosto

## Método
1. **Escopo primeiro:** a tela inteira, um fluxo ou só a mudança (só a mudança: o diff e 1–2 saltos de quem usa o que
   mudou, no máximo 5 arquivos além do diff).
2. **Reconhecer antes de julgar:** o que a tela faz, para quem, em que estados; o sistema de design do projeto.
3. **Os donos de cada domínio, nesta ordem:** acessibilidade (`acessibilidade/INDICE.md`), layout (`layout/INDICE.md`),
   texto (`../escrita/texto-de-interface.md`), tipografia (`tipografia/INDICE.md`), cor (`cor/INDICE.md`), detalhes
   (`detalhes-interface.md`). Movimento: `movimento/INDICE.md`. Plataforma Apple: `apple/INDICE.md`.
4. **Conferir o que dá:** afirmação sobre renderização sem ter visto a tela renderizada vira **"não verificado"**.
5. **Pela gravidade para o usuário:** ALTO (impede ou engana); MÉDIO (prejudica entendimento, eficiência, adaptação ou
   consistência); BAIXO (acabamento). Sempre ALTO, mesmo em tela secundária: conteúdo ou controle cortado, sobreposto ou
   inalcançável em 320 px ou zoom de 200%; texto ou controle abaixo do contraste exigido; estado ou significado só em cor.
6. **A correção mais barata:** (1) apagar (separador que o espaço faria, animação em interação frequente, ARIA que o
   nativo dispensa); (2) usar a plataforma (elemento nativo, anel de foco do navegador); (3) reusar o que o projeto tem
   (token, degrau, curva); (4) corrigir o valor; (5) só então acrescentar.
7. **Achado sistêmico é um só,** com todos os lugares na mesma linha. **No máximo 15 achados**; nunca encher até o teto.
   Revisão curta ou sem achado é resultado válido. Revise sem alterar, salvo pedido.

## Relatório (semáforo por impacto)
```
VERMELHO (corrigir antes de ir ao usuário)  | Gravidade | Onde (arquivo:linha) | Antes | Depois | Por quê |
AMARELO  (corrigir nesta rodada)            | ...
VERDE    (o que funciona: manter)           | o que está bom e por quê (obrigatório)
Não revisado: ...   Não verificado: ...     (cobertura declarada)
Veredito: Bloquear (há vermelho) | Aprovar
```
Uma tabela só, em ordem de gravidade e depois de alcance (não uma seção por domínio). Nunca aprove o que não inspecionou.

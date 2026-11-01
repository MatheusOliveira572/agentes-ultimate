<!-- Adaptado de pbakaus/impeccable/skill/reference/critique.md @e89e3ad, © 2025 Paul Bakaus, Apache-2.0. Alterações: tradução, condensação (48 KB → 2 arquivos), troca dos comandos e do registro do impeccable pelo nosso protocolo; alterado por agentes-ultimate. Licença em terceiros/pbakaus-impeccable/ (com NOTICE.md). -->
<!-- ref: tema=critica-de-design; palavras=critica de design, criticar a tela, revisao de ux, heuristicas, nielsen, pontuacao de usabilidade, carga cognitiva, avaliar a interface, avalie a interface, problemas de ux, revisar o design; agentes=designer-paineis, designer-documentos, revisor -->
<!-- teste-ref: sim=faça a crítica de design da tela com as heurísticas de Nielsen e a carga cognitiva | avalie a interface do app: o que funciona e os problemas de ux por prioridade; nao=calcule o imposto de renda diferido -->
# Crítica de design (revisão de UX com pontuação)

Duas avaliações independentes e uma síntese. Pontuação, carga cognitiva e personas: `heuristicas.md`. Detalhes de tela
(raio, sombra, ícone): `../detalhes-interface.md`. Semáforo e formato do revisor: `../revisao-tela.md`.

## Regras fixas
- **Avaliação A (revisão de design)** e **avaliação B (prova: detector e navegador)** são as duas obrigatórias (no app
  nativo, B é o simulador). Quando dá, rodam isoladas uma da outra (o orquestrador chama dois agentes); a A termina antes
  de a B entrar na síntese, porque a saída do detector ancora o julgamento. Rodou tudo num contexto só: a 1ª linha do
  relatório diz **"DEGRADADA: um contexto só (motivo)"**.
- Alvo concreto (caminho do arquivo antes da URL do servidor, que muda de porta).
- Tela que dá para ver: inspeção no navegador sem interface (perfil próprio; nunca na tela do usuário sem pedido).
- Servidor local subido só para a crítica roda em segundo plano, com o jeito de parar anotado, e é parado no fim.
- O relatório vem inteiro primeiro; **a pergunta ao usuário é a última coisa**. Sem perguntas: uma linha "Perguntas
  dispensadas: motivo".

## Avaliação A: o que olhar
- **Especificidade:** a composição, a interação e a linguagem visual nascem deste produto, ou serviriam a qualquer outro
  sem mudança? (veredito explícito)
- **Conjunto:** hierarquia, arquitetura da informação, adequação emocional, descoberta, composição, tipografia, cor,
  acessibilidade, estados, texto e casos extremos.
- **Carga cognitiva:** a lista de 8 itens de `heuristicas.md`; decisão com mais de 4 opções visíveis é achado.
- **Jornada emocional:** regra do pico e do fim; vales emocionais; tranquilizar nos momentos de risco alto.
- **Heurísticas de Nielsen:** as 10, notas de 0 a 4 (`heuristicas.md`).

## Relatório
1. **Pontuação:** tabela das 10 heurísticas (nota e o problema-chave); total sobre o máximo aplicável (4 × heurísticas
   pontuadas: /40, ou /32 com duas "n/a"); a faixa. Seja honesto: 4 é excelente de verdade; a maioria das interfaces reais
   fica entre 20 e 32 de 40. Em página de persuasão (campanha, portfólio), as heurísticas 7 e 10 podem ser "n/a".
2. **Veredito de especificidade.**
3. **Impressão geral** (3–4 linhas).
4. **O que funciona** (obrigatório: o que manter).
5. **Problemas prioritários:** os 3 a 5 de maior impacto, em ordem, cada um com **[P0–P3]**, o quê, por que importa, a
   correção concreta e qual arquivo de referência ajuda (`../polimento.md`, `../cor/INDICE.md`...).
   | P0 bloqueante (impede a tarefa: corrigir já) | P1 grave (dificulta muito: antes de publicar) | P2 menor (incomoda,
   tem contorno: próximo passe) | P3 acabamento (quando der) |
6. **Alertas por persona:** 2–3 personas escolhidas pelo tipo de tela (`heuristicas.md`), cada uma com o que quebrou para
   ela, citando o elemento exato. Nada de descrição genérica de persona.
7. **Observações menores** e **perguntas para pensar**.
8. **Notas da execução:** o que rodou, o que foi degradado, o que não foi verificado.
9. **Perguntas ao usuário** (por último): qual categoria importa mais agora; se um tom encontrado é intencional; quanto
   quer atacar (os 3 primeiros ou tudo); se algo está fora de alcance.

## Depois
A crítica não corrige. A correção é outro passe (`../polimento.md`), com passadas limitadas: uma inspeção, um lote de
correções, no máximo uma confirmação.

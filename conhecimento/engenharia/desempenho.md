<!-- Adaptado de addyosmani/agent-skills/skills/performance-optimization/SKILL.md e references/performance-checklist.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, junção, corte; a parte de navegador foi para desempenho-web.md; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=desempenho; palavras=desempenho, lento, lentidao, performance, otimizar, gargalo, consulta lenta, n+1, indice do banco, cache, latencia, pool de conexoes; agentes=engenheiro-software, engenheiro-dados -->
<!-- teste-ref: sim=a api está lenta, ache o gargalo e otimize a consulta | o sistema ficou lento depois da última versão, parece consulta n+1 no banco; nao=redija a carta de boas-vindas ao novo cliente -->
# Desempenho: medir antes, medir depois, manter ou voltar

Sem medida não há otimização, só palpite que acrescenta complexidade. Não otimize sem prova de problema.

## 1. Medir (a linha de base)
- **Sintético** (Lighthouse, aba Performance, benchmark, `EXPLAIN ANALYZE`): condição controlada, reproduzível; bom para o
  CI. **Campo** (dados de usuário real, RUM): prova que a correção melhorou a vida de quem usa.
- Comece pelo sintoma: página lenta → navegador (`desempenho-web.md`); API lenta → log de consultas e rastreamento;
  memória crescendo → retrato do heap; CPU alta → perfil de CPU.
- Mesmo comando, mesmas condições e mesmo orçamento (tempo, amostras ou requisições) antes e depois.

## 2. Achar o gargalo
| Sintoma (servidor) | Causa provável | Investigar |
|---|---|---|
| resposta lenta | N+1, índice faltando, consulta ruim | log de consultas, plano |
| memória crescendo | referência vazando, cache sem limite, carga grande | retrato do heap |
| CPU em pico | cálculo pesado síncrono, regex com retrocesso | perfil de CPU |
| latência alta | cache faltando, cálculo repetido, saltos de rede | rastreamento |
| **todos** os endpoints lentos juntos | pool de conexões esgotado | quem segura a conexão |

## 3. Corrigir só o gargalo achado
- **N+1:** uma consulta por linha; traga a relação na mesma consulta (join/include).
- **Busca sem limite:** toda lista pagina, com limite e ordem estável (nunca `SELECT *` da tabela).
- **Índice:** "pôr índice" é palpite; o plano (`EXPLAIN ANALYZE`) antes e depois é a medida. Estimado × real de linhas
  com diferença de 10× ou mais: atualize as estatísticas antes. Índice composto: igualdade primeiro, depois faixa/ordem;
  cubra o formato da consulta (filtro + ordem); índice parcial para o valor raro; índice de expressão quando a consulta
  aplica função; texto com curinga no começo pede índice de texto/trigramas. Todo índice taxa toda escrita: meça em
  tabela muito escrita; apague índice duplicado ou sem uso. Índice que não mudou o plano: volte.
- **Pool:** um por processo; `instâncias × máximo do pool` abaixo do `max_connections`; tempo-limite para falhar rápido;
  ache quem segura (transação longa, `await` esquecido, cliente vazado) antes de aumentar. Ambiente que escala sozinho:
  proxy multiplexador (pgbouncer, RDS Proxy), não pool maior.
- **Cache:** só do que é caro e lido muito mais do que muda. Toda chave inclui tudo de que a resposta depende (cliente,
  idioma, quem vê); todo cache diz quanto tempo pode ficar velho e como é invalidado.
- API: meta comum de p95 < 200 ms; nada de cálculo pesado no tratamento da requisição; operação em lote em vez de laço de
  chamadas; compressão da resposta.

## 4. Manter ou voltar (sem meio-termo)
Uma mudança por medida (três juntas dão um número que não se atribui a nenhuma). Repita a medida e compare a diferença
com a variação natural: ganho de 3% dentro de ±5% não é ganho.
| Resultado | Ação |
|---|---|
| passou do limiar, testes verdes | **manter**, com os números antes → depois no commit |
| dentro do ruído | **voltar** ("neutro" é voltar) |
| pior | **voltar** |
| melhorou mas um teste quebrou | **voltar** (regressão disfarçada de ganho) |
Ganho obtido tirando trabalho que o produto precisava não é ganho.

**Registre todas as tentativas, inclusive as revertidas** (no PR ou num `PERF.md`): ideia, base → resultado, veredito,
por quê. Sem isso, a mesma ideia morta volta no próximo trimestre.

## 5. Proteger contra a volta
Guarde a métrica que o usuário sente (a mesma que justificou a correção): orçamento no CI (mediana de várias medidas,
para não virar teste instável) e monitoramento de campo (alerta em mudança relevante do p75). Disparou: nova linha de
base antes da próxima ideia.

## Sinais de alerta
Otimização sem perfil; N+1; índice sem plano antes e depois; chave de cache sem uma entrada de que a resposta depende;
cache sem prazo nem invalidação; pool aumentado sem achar a causa; `memo` em tudo; otimizações juntas numa medida só;
"ganho" que pediu mudar, pular ou apagar teste; a mesma tentativa falha repetida.

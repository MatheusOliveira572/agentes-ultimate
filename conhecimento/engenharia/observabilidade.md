<!-- Adaptado de addyosmani/agent-skills/skills/observability-and-instrumentation/SKILL.md e references/observability-checklist.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, junção, corte dos exemplos; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=observabilidade; palavras=observabilidade, log estruturado, logs, metricas, rastreamento, tracing, opentelemetry, alerta, alertas, monitoramento, plantao, runbook; agentes=engenheiro-software, engenheiro-dados -->
<!-- teste-ref: sim=coloque log estruturado, métricas e alertas no serviço de pagamento | o incidente demorou para ser entendido, monte o monitoramento com opentelemetry e runbook; nao=faça a reconciliação dos lançamentos contábeis -->
# Observabilidade: responder "o que o sistema está fazendo e por quê"

Não é para depurar a falha de agora (`depurar.md`) nem para otimizar lentidão medida (`desempenho.md`).

## 1. Perguntas antes de instrumentar
Escreva 2 a 4 perguntas que o plantão fará sobre a funcionalidade ("os pagamentos estão falhando? para quem? desde quando?
em qual provedor?"). Sem pergunta, telemetria é ruído.

## 2. O sinal certo para cada pergunta
| Sinal | Responde | Ex. |
|---|---|---|
| Log estruturado | o que aconteceu neste caso | `pagamento_falhou` com o código do provedor |
| Métrica | com que frequência e velocidade, no agregado | p99 da chamada ao provedor |
| Rastreamento | onde foi o tempo entre serviços | uma compra lenta, por etapa |
Métrica diz **que** há problema, rastreamento diz **onde**, log diz **por quê**.

## 3. Logs
- Eventos, não prosa: JSON com nome de evento estável e campos legíveis por máquina; nunca texto montado por concatenação.
- Níveis: `error` (regra quebrada, alguém pode ter de agir), `warn` (degradado mas tratado), `info` (evento de negócio),
  `debug` (desligado em produção).
- **ID de correlação obrigatório:** criado (ou aceito) na borda e levado a cada linha, cada etapa e cada chamada de saída,
  inclusive pela fila. Log alimentado por várias entradas (agendador, webhook, execução manual) leva também o campo da
  entrada que iniciou.
- **Nunca** segredo, token, senha ou dado pessoal completo no log. Campos em lista permitida; nada de corpo inteiro de
  requisição nem cabeçalho de autenticação. Chamada externa: só metadados (endereço, status, tempo, tentativas).
- Script de carga ou rotina termina com uma linha-resumo (entrada, lidos, gravados, erros, tempo).

## 4. Métricas
- **RED** em todo endpoint e toda dependência externa: taxa, erros, duração. **USE** em cada recurso (fila, pool, máquina):
  uso, saturação, erros.
- Duração em histograma; leia p50/p95/p99, **nunca média** (esconde o 1% que sofre).
- **Cardinalidade:** rótulos só de conjuntos pequenos e fixos (modelo da rota, classe do status `5xx`, provedor). Nunca ID
  de usuário, e-mail, URL crua, ID da requisição ou texto de erro.

## 5. Rastreamento
OpenTelemetry (neutro de fornecedor), iniciado antes dos outros imports; auto-instrumentação de HTTP, gRPC e banco;
contexto propagado (`traceparent`) em toda chamada e mensagem de fila; etapas manuais só em unidades de trabalho que
importam; amostragem baixa por padrão, mantendo 100% dos erros quando der.

## 6. Alertas
Pelo **sintoma que o usuário sente** (taxa de erro, p99, idade da fila), não pela causa (CPU, disco vão para o painel).
Cada alerta: acionável (se "se resolve sozinho", apague); com runbook de 3 linhas (o que significa, a 1ª consulta, para
quem escalar), atualizado a cada incidente; limiar e duração justificados por meta (SLO) ou histórico; só 2 gravidades
(acionar agora / tratar na semana); disparado uma vez de teste.

## 7. Conferir a própria telemetria
Forçar um erro em homologação e achar pelo ID de correlação; tráfego de teste → séries com os rótulos certos; seguir uma
requisição de ponta a ponta sem etapa quebrada; diagnosticar uma falha induzida só pela telemetria, sem ler o código.

## Antes de ir ao ar
Logs estruturados chegando; RED visível no painel; pelo menos 1 alerta por sintoma, com runbook, testado; requisição
rastreável; plantão sabe onde estão os runbooks.

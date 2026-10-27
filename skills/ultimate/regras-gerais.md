# Regras gerais (aprendidas em projetos reais; valem para qualquer projeto)

Cada regra nasceu de uma falha. O formato é: regra — porque (o que aconteceu).

## Prova e verificação
- Prove pela saída real, nunca por espelho — porque um cálculo refeito em JavaScript "passou" enquanto a medida real
  devolvia texto quebrado.
- Toda checagem nova precisa falhar no caso errado antes de passar no certo — porque verificadores que "nunca falham"
  deixaram passar o defeito que deviam pegar.
- "0 diferença" só vale com um controle positivo (uma mudança proposital tem de aparecer) — porque uma comparação de
  imagens dava 0 por capturar a mesma faixa de aviso nas duas.
- Resultado guardado em cache só vale se veio da mesma consulta — porque resultados de um teste antigo foram
  reaproveitados e deram erros falsos (e poderiam esconder verdadeiros).
- Caso de teste que não gerou saída não é "ok" — porque um caso que não rodou passou como aprovado.

## Dados e números
- Vazio não é zero — porque "sem lançamento" e "lançou zero" geravam textos e somas diferentes.
- Tolerância de soma depende do número de termos (n × meio centavo), nunca fixa — porque 5 linhas arredondadas
  somaram 3,98 contra um total de 3,96 e o teste acusou erro que não existia.
- O mesmo número mostrado em dois lugares vem da mesma medida exibida — porque a ficha dizia +70 e o link +69.
- Regra de exclusão se escreve pela positiva, numa fonte oficial — porque "o que não está na lista" excluiu demais.
- Arquivo de dados fora do git não muda quando o ramo muda — porque um teste de versão antiga falhou com o cadastro novo.

## Interface e interação
- Seleção guarda a identidade do item, nunca a posição — porque, ao trocar o filtro, a lista reordenou e outro item
  ficou em foco.
- Teste sempre "clicar e trocar o recorte" — porque os casos de defeito só apareciam depois de mudar o filtro.
- Painel que abre por cima tem de esconder o que fica embaixo — porque o clique "atravessava" para a tabela de trás.
- Meça o pior caso de todo texto variável contra o espaço — porque um selo "mais de 999%" saiu da borda do cartão.

## Trabalho em equipe de agentes
- Rodadas de 3–4 h, com commit a cada item — porque uma rodada de 6 h ficou horas sem nada gravado.
- Estimativa corrigida pelo histórico real (fator real ÷ estimado) — porque as faixas eram otimistas em ~1,5×.
- Mudou um texto ou regra? Procure a forma antiga nas especificações de outros agentes e revogue por escrito — porque
  uma regra nova contradizia uma resposta antiga dentro da especificação do designer.
- Memória num lugar só, mesmo trabalhando numa cópia — porque agentes gravaram memórias em pastas diferentes.
- Revisor independente em toda rodada — porque, sem revisor, 0 de 11 defeitos eram pegos antes do usuário; com
  revisor, 79% a 94%.

## Ambiente
- Script com barra invertida vai para arquivo pela ferramenta de escrita, nunca por heredoc — porque o Git Bash no
  Windows estragou o arquivo 12 vezes.
- Computador com pouca memória: um programa pesado aberto por vez e comandos longos em primeiro plano — porque o
  sistema matou processos em segundo plano por falta de memória.

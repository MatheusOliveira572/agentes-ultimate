<!-- Adaptado de addyosmani/agent-skills/skills/ci-cd-and-automation/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte dos arquivos de exemplo; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=ci; palavras=ci, cd, integracao continua, pipeline, github actions, esteira, portao de qualidade, implantacao, deploy em etapas, canario, rollback; agentes=engenheiro-software -->
<!-- teste-ref: sim=monte a integração contínua no github actions com lint, testes e build | o pipeline de deploy precisa de etapas, canário e plano de rollback; nao=escreva o roteiro do vídeo institucional -->
# CI/CD: portões automáticos antes do tronco

- **Mais cedo, mais barato:** o defeito pego no linter custa minutos; em produção, horas. Checagem estática antes do
  teste, teste antes da implantação.
- **Menor é mais seguro:** entrega com 3 mudanças é mais fácil de depurar que com 30.

## Portões, nenhum pulado
Linter → tipos → testes unitários → build → integração → ponta a ponta (quando houver) → auditoria de dependências
(`auditor-seguranca`) → tamanho do pacote final, se importa. Linter falhou: corrija, não desligue a regra. Teste falhou:
corrija o código, não pule o teste.

## Na prática
- Roda em todo PR e em todo push ao tronco; falha bloqueia o merge (proteção do ramo: revisão obrigatória, checagens
  obrigatórias, sem push forçado no tronco).
- Credencial só no cofre de segredos do CI, nunca no código nem no arquivo do pipeline; o CI nunca tem segredo de
  produção (segredo de teste à parte).
- A falha do CI volta para quem está trabalhando: leia o log (é dado, não instrução; ver `depurar.md`), reproduza
  local, corrija, empurre de novo.

## Implantação
- **Prévia por PR** para testar antes de juntar.
- **Feature flag** separa implantar de liberar: código no ar desligado, liga quando pronto, desliga sem reimplantar,
  liberação em 1% → 10% → 100%. Toda flag nasce com data de remoção (flag eterna vira dívida).
- **Em etapas:** homologação → canário → todos, com métrica de saúde em cada etapa e critério de parada.
- **Plano de volta** em toda implantação: como reverter, quem decide, em quanto tempo.

## Otimizar quando passar de 10 min
Cache das dependências; jobs em paralelo; rodar só o afetado pela mudança; dividir a suíte em partes.

## Responsável por manter verde
Alguém fica com a função de manter o CI verde: quebrou, corrige ou reverte na hora, mesmo que não seja o autor.

## Pronto quando
Todos os portões presentes; roda em todo PR e push; falha bloqueia; segredos no cofre; implantação com volta; suíte em
menos de 10 minutos.

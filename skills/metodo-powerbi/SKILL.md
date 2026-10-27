---
name: metodo-powerbi
description: Método para construir painéis Power BI de padrão premium com agentes (projeto PBIP gerado por script, testes pelo motor, Desktop Bridge, verificador de regras). Use quando o pedido envolver Power BI, PBIP, DAX, TMDL ou um painel/dashboard nesse formato.
---
# Power BI com agentes

## Estrutura recomendada
- **PBIP no git** (pastas `.Report` e `.SemanticModel`), **gerado por scripts** em `powerbi/design/` (medidas, layout,
  modelo). O arquivo gerado nunca é editado à mão: a próxima geração apagaria a edição.
- **Dados fora do git** (`powerbi/dados-reais/` no `.gitignore` e em `.claude/base/sensiveis.txt`). A origem é um
  parâmetro de caminho, para trocar de pasta sem mexer no modelo.
- **Cadastros em arquivo** (hierarquia, agrupamentos, exceções) editáveis pelo usuário, nunca listas de nomes no código.

## Qualidade
1. **Spec do designer antes** (grade, estados, unidades, pior caso de texto). Uma unidade por tabela.
2. **Banco de testes pelo motor:** consultas DAX contra o modelo aberto (porta local do Analysis Services do Desktop),
   comparando com o esperado calculado fora das medidas; casos de borda (vazio, zero, sinal oposto, limite) e mutação.
   Lotes por assunto; rodar só os afetados e um lote final; resultado só vale com a mesma consulta.
3. **Verificador de regras** (script) sobre os arquivos do PBIP: cada defeito achado pelo usuário vira uma regra que
   falha no arquivo com o defeito e passa no corrigido.
4. **Conciliação:** totais do modelo × fonte oficial por mês, com 0 de diferença ou a diferença explicada.
5. **Prévia sem tocar na tela:** a Desktop Bridge oficial da Microsoft (CLI `@microsoft/powerbi-desktop-bridge-cli`)
   recarrega o relatório e exporta PNG da página. Ela não relê o modelo: medida trocada exige reabrir.
6. **Clique só o usuário prova:** a lista curta de prints vai com o caminho do arquivo.

## Armadilhas conhecidas
- Visual selecionado sobe para a frente de tudo no Desktop: painel por cima precisa ocultar o que está embaixo.
- Indicador (bookmark) com "Dados" que mira uma segmentação desfaz a escolha do usuário.
- Seleção por posição muda de item quando a lista reordena: use a identidade.
- Formato dinâmico de medida exige nível de compatibilidade maior (sem volta); um grupo de cálculo pode resolver sem
  subir.
- Um Power BI aberto por vez em computador de 8 GB; feche sempre sem salvar, conferindo o dono do processo.
- Visuais de terceiros dependem de liberação da TI; SVG por medida + segmentação transparente dá controle total.

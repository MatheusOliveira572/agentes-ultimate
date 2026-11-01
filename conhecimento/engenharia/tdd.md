<!-- Adaptado de addyosmani/agent-skills/skills/test-driven-development/SKILL.md @301b02b, © 2025 Addy Osmani, MIT; e de affaan-m/ECC/agents/tdd-guide.md @b38be6a, © 2026 Affaan Mustafa, MIT. Alterações: tradução, junção, corte; cobertura como decisão do projeto; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/ e terceiros/affaan-m-ECC/. -->
<!-- ref: tema=tdd; palavras=tdd, teste antes, escrever o teste, teste que falha, vermelho verde, red green, piramide de testes, casos de borda, testes unitarios, teste de regressao; agentes=testador-qa, engenheiro-software -->
<!-- teste-ref: sim=escreva os testes unitários antes de implementar a regra de desconto | quero TDD com teste de regressão para o defeito do cálculo de juros; nao=resuma este contrato de aluguel -->
# Teste antes do código (vermelho → verde → refatorar)

Vale para lógica nova, correção de defeito, mudança de comportamento e caso de borda. Não vale para mudança só de
configuração, documento ou conteúdo estático sem efeito no comportamento.

## 0. Descubra como ESTE repositório testa
Antes do primeiro teste: linguagem e build (`package.json`, `pyproject.toml`, `pom.xml`/`build.gradle`, `go.mod`,
`Cargo.toml`, `Makefile`); prefira o que está no repositório (`./gradlew`, `make test`, script do projeto) ao que está
instalado na máquina; como rodar **um** teste e a suíte; onde ficam os testes e como os vizinhos são escritos; os
comandos do README, do CONTRIBUTING e do CI (são os que valem para juntar ao tronco). Nunca suponha `npm test`.

## 1. O ciclo
1. **Vermelho:** escreva o teste e rode: ele tem de falhar **pelo motivo certo**. Teste que passa de primeira não prova
   nada (talvez nem teste o que você pensa).
2. **Verde:** o mínimo de código para passar. Sem enfeite.
3. **Refatorar:** com tudo verde, melhore nomes, tire duplicação; rode os testes a cada passo.

## 2. Defeito: prove antes de corrigir
Chegou o defeito: **não comece corrigindo.** Escreva o teste que reproduz (falha), corrija, veja passar, rode a suíte.
Num defeito complexo, o teste de reprodução pode ser escrito por outro agente que não conhece a correção (fica mais
honesto): peça ao orquestrador.

## 3. Pirâmide e tamanho
- ~80% unitários (lógica pura, milissegundos), ~15% integração (API com banco de teste, componente), ~5% ponta a ponta
  (fluxo do usuário no navegador real).
- Pelo recurso: **pequeno** (um processo, sem disco, rede ou banco), **médio** (localhost, sem serviço externo),
  **grande** (serviços externos, várias máquinas). A maioria tem de ser pequena.
- "Se você gostava, devia ter posto um teste": migração, refatoração e infraestrutura não têm obrigação de pegar o seu
  defeito; o seu teste tem.

## 4. Casos de borda que todo teste de lógica considera
Nulo ou ausente; vazio (lista, texto); tipo inválido; limites (mínimo, máximo, ±1); caminho de erro (rede, banco, disco);
concorrência (duas operações ao mesmo tempo); volume (10 mil+ itens); caracteres especiais (acento, emoji, aspas, `<`,
`'` de SQL).

## 5. Cobertura
É decisão do projeto (`.claude/base/PROJETO.md`); uma meta comum de mercado é 80% de linhas, ramos e funções. Mais
importante que o número: todo comportamento novo tem teste, e a cobertura não cai.

## Desculpas comuns
| Desculpa | Realidade |
|---|---|
| "Escrevo os testes quando funcionar" | Não escreve; e o teste depois testa a implementação, não o comportamento. |
| "Simples demais para testar" | Código simples complica. O teste documenta o esperado. |
| "Testei na mão" | Teste na mão não fica. A mudança de amanhã quebra sem ninguém ver. |
| "É só protótipo" | Protótipo vira produção. |

## Sinais de alerta
Código sem teste; comando de teste suposto sem conferir; teste que passa de primeira; "todos passam" sem nenhum ter
rodado; correção sem teste de reprodução; teste pulado ou desligado para a suíte passar; nome de teste que não diz o
comportamento.

## Pronto quando
Todo comportamento novo tem teste; a suíte inteira passa com o comando do repositório (mostre a saída); a correção tem o
teste que falhava antes; nenhum teste pulado ou desligado; a cobertura não caiu (se o projeto mede). Padrões de escrita:
`padroes-de-teste.md`. Ponta a ponta: `e2e.md`.

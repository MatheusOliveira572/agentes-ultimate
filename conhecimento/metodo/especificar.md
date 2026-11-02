<!-- Adaptado de addyosmani/agent-skills/skills/spec-driven-development/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, condensação; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=especificar; palavras=especificacao, especificar, spec, escrever a spec, requisitos, criterio de aceite, documento de requisitos, prd, escopo do projeto; agentes=planejador, gerente-produto, engenheiro-software -->
<!-- teste-ref: sim=escreva a especificação da funcionalidade com critérios de aceite antes do código | monte o documento de requisitos (PRD) com o escopo do projeto; nao=faça a conciliação do cartão corporativo -->
# Especificar antes de construir (com portões)

## Fase 0 · escopo
Coisa grande vira **módulos** com nome estável (escolhido uma vez), dependências numa direção só (dois módulos que
precisam um do outro são um só) e contratos na fronteira.

## Fase 1 · a especificação (6 partes)
1. **Objetivo:** o que, por quê, para quem, como é o sucesso (mensurável).
2. **Comandos:** os comandos completos para rodar, testar e construir (com as opções), não só o nome da ferramenta.
3. **Estrutura:** onde fica o código, os testes e os documentos.
4. **Estilo:** um trecho real de código do projeto vale mais que três parágrafos (nomes, formatação).
5. **Estratégia de teste:** framework, onde ficam, cobertura esperada, que nível de teste para quê.
6. **Limites em 3 níveis:** **sempre faça** (ex.: rodar os testes antes do commit); **pergunte antes** (ex.: dependência
   nova, mudança de esquema); **nunca faça** (ex.: segredo no código, apagar dado de produção).
Mais: critérios de aceite verificáveis por item, fora do escopo explícito, perguntas abertas.
**Portão:** mostre a especificação e **pare**; plano e código só depois da aprovação.

## Fases seguintes
Plano (como, com riscos) → tarefas (`quebrar-tarefas.md`) → implementar (`../engenharia/incremental.md`).

## Manter viva
Mudou a decisão (modelo de dados, escopo): atualize a especificação **antes** do código; ela vai para o controle de versão
junto do código; cada PR cita a seção que implementa.

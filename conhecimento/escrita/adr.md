<!-- Adaptado de addyosmani/agent-skills/skills/documentation-and-adrs/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, condensação; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=adr; palavras=adr, registro de decisao, decisao de arquitetura registrada, documentar a decisao, documentacao tecnica, readme do projeto, changelog do projeto, comentarios no codigo; agentes=redator, engenheiro-software -->
<!-- teste-ref: sim=registre a decisão técnica num ADR com contexto, alternativas e consequências | escreva o README e o changelog do projeto, documentando as decisões; nao=calcule o custo da hora extra -->
# Decisões (ADR) e documentação que descreve o estado atual

## ADR: quando
Decisão difícil de desfazer, que muda a estrutura, escolhe tecnologia, ou que alguém vai perguntar "por que assim?".

## Siga a convenção que já existe
Lugar e formato (`docs/adr/*.md`, MADR, `adr-tools`), numeração e nome de arquivo (continue a sequência, não recomece em
001) e os títulos de seção do projeto.

## Modelo (quando não há convenção)
```
# ADR-000N: <decisão em uma frase>
Status: proposta | aceita | substituída por ADR-00XX   Data: AAAA-MM-DD
Contexto: o problema e as forças (prazo, custo, pessoas, restrição técnica).
Decisão: o que foi escolhido.
Alternativas: cada uma com o motivo de ter sido descartada.
Consequências: o que fica mais fácil, o que fica mais difícil, o risco; reversibilidade.
```
**Nunca apague ADR antigo:** substitua por um novo que aponta para ele (é o histórico do porquê).

## Comentário no código
O **porquê** (decisão, efeito não óbvio, armadilha conhecida), não o quê. Documente as armadilhas ("esta API devolve
200 com erro no corpo"). Não comente o óbvio nem deixe código comentado.

## README e changelog
README: o que é, como instalar, como rodar, como testar, como contribuir, onde estão as decisões. Changelog para gente,
agrupado por Adicionado / Mudou / Corrigido / Removido / Segurança, escrito na mesma mudança (`../engenharia/git.md`).
Documento descreve **o estado atual** do sistema (não a história de como chegou lá; isso é o ADR e o changelog).

## Para agentes
Convenções no `CLAUDE.md`/regras, especificações em dia e ADRs evitam que se decida de novo o que já foi decidido.

<!-- Adaptado de addyosmani/agent-skills/skills/constraint-driven-development/SKILL.md e references/floor-guard.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte; instalação só proposta ao usuário; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=restricoes; palavras=regua de qualidade, constraints, constraints.md, limite de cobertura, cobertura minima, catraca, orcamento de desempenho, quality gate, portao de qualidade do projeto, excecoes com prazo; agentes=engenheiro-software, testador-qa, analista-compliance -->
<!-- teste-ref: sim=monte a régua de qualidade do projeto com constraints.md, cobertura mínima e catraca | quero um quality gate que não deixe a cobertura cair e com exceções com prazo; nao=escreva o post de lançamento no linkedin -->
# Régua de qualidade escrita (CONSTRAINTS.md) e guarda da régua

## 1. Detectar antes de perguntar
Pilha (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`), executor de testes, linters já configurados, cobertura
de hoje (rode a suíte uma vez), CI (`.github/workflows/`), arquivos de agente (`.claude/`, `AGENTS.md`).

## 2. No máximo 4 perguntas, cada uma com padrão
Uma por vez (método de entrevista: uma pergunta com palpite), sempre com o padrão já proposto, para "não sei" ser resposta
completa: (1) cobertura das linhas mudadas; (2) o que bloqueia em segurança; (3) metas de desempenho; (4) acessibilidade.
Doze perguntas dão uma configuração que ninguém entende.

## 3. Padrões sensatos
| Restrição | Padrão | Por quê |
|---|---|---|
| Cobertura das linhas mudadas | ≥ 80% | força um teste, deixa passar uma linha de configuração |
| Cobertura do projeto | a de hoje, não pode cair | não exige discussão |
| Mutação (se usar) | ≥ 60% para começar | típico de suíte nunca mutada; 80% é maduro |
| Vulnerabilidade de dependência | nada alto ou acima | abaixo disso é quase só ruído |
| LCP / CLS | ≤ 2.500 ms / ≤ 0,1 | "bom" do Core Web Vitals |
| Acessibilidade | 0 violação crítica ou séria (axe) | moderada e menor costumam ser discutíveis |
| Vida de uma exceção | 90 dias | dá para planejar, curto para lembrar |
| Tolerância da catraca | 0,5% | absorve a variação de arquivo alheio |

## 4. Ferramentas por dimensão (o usuário instala; o agente confere antes)
Tipos (`tsc --noEmit`, `mypy`), lint (a configuração que existe), cobertura (do executor de testes, lida do lcov que a
suíte já grava, cruzada com o `git diff`), código (Semgrep), segredos (gitleaks **sempre com `--redact`**, senão o
segredo cai na conversa e no log), dependências (osv-scanner), página (Lighthouse, precisa de URL rodando), pacote
(size-limit), acessibilidade (axe, precisa de URL), arquitetura (dependency-cruiser), força das asserções (Stryker, só
nos arquivos mudados). Antes de usar qualquer uma: `node "<plugin>/scripts/checar-ferramenta.js" <nome>`. Ausente: proponha
ao usuário; o plugin não instala. Scanner que sai 0 com achado: passe o JSON pelo modelo `<plugin>/modelos/quality-gate.mjs`
(sai 1 com achado bloqueante, 2 com relatório incompleto).

## 5. Onde roda
| Fase | O quê | Orçamento |
|---|---|---|
| construir | tipos, lint, segredos, no arquivo mudado | < 5 s |
| verificar | testes relacionados, cobertura das linhas mudadas | < 90 s |
| revisar | tudo + a guarda abaixo | minutos |
| publicar | tendências, nada regrediu | CI |
O que leva mais que alguns segundos sai do ciclo de edição (erro de lugar, não argumento contra a régua).

## 6. Guardar a própria régua (o revisor olha isto)
1. o limite mudou (orçamento baixado, gravidade rebaixada, checagem tirada da fase rápida): compare o `CONSTRAINTS.md`
   com o do ponto em que o ramo saiu;
2. um teste ficou mais fácil (`.skip`, arquivo de teste apagado, asserção tirada);
3. um verificador foi calado (`@ts-ignore`, `eslint-disable`, `# noqa`, `# type: ignore` novos);
4. trabalho inacabado (stub que lança erro, `catch` vazio, `TODO` no lugar da implementação);
5. exceção nova sem conversa.
Sem número para começar: **catraca** (o valor de hoje vira o piso e só sobe).

## 7. Exceções
Tabela no `CONSTRAINTS.md`: regra, onde, motivo, **dono**, **validade** (≤ 90 dias), como sai. Exceção com dono e data
destrava a entrega; apagar a regra destrava todo mundo para sempre. No projeto, uma linha no `CLAUDE.md`: "Leia o
CONSTRAINTS.md antes de escrever código. Não o enfraqueça para uma mudança passar."

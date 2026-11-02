<!-- Texto próprio do agentes-ultimate. Índice da pasta conhecimento/engenharia/. -->
# Engenharia: situação → arquivo (abra no máximo 3)

| Situação | Arquivo |
|---|---|
| funcionalidade em mais de um arquivo, tarefa do plano | `incremental.md` |
| teste antes do código, correção de defeito, pirâmide, bordas | `tdd.md` |
| como escrever o teste: simulação, instável, nomes, snapshot | `padroes-de-teste.md` |
| fluxo do usuário no navegador (Playwright, Cypress) | `e2e.md` |
| conferir no navegador real: console, rede, DOM, captura | `teste-no-navegador.md` |
| antes de dizer pronto / abrir PR: as 6 fases | `verificacao.md` |
| algo quebrou e não se sabe por quê | `depurar.md` |
| build ou checagem de tipos falhando | `erro-de-build.md` |
| endpoint, contrato entre módulos, idempotência | `api.md` |
| camadas do servidor, transação, cache, fila, limite | `backend.md` |
| componente e página web, sistema de design, "cara de IA" | `interface-web.md` |
| qual biblioteca de interface usar (React) | `bibliotecas-interface.md` |
| deixar mais legível sem mudar comportamento | `simplificar.md` |
| código morto, dependência sem uso, duplicado | `codigo-morto.md` |
| padrões de código quando o projeto não tem | `padroes-codigo.md` |
| desenho de arquitetura e decisões registradas | `arquitetura.md` |
| commits, ramos, versão, changelog | `git.md` |
| integração contínua, implantação em etapas, volta | `ci.md` |
| aposentar sistema, trocar biblioteca, mudar esquema do banco | `migracao.md` |
| logs, métricas, rastreamento, alertas | `observabilidade.md` |
| lentidão medida (servidor, banco) | `desempenho.md` |
| página lenta, Core Web Vitals | `desempenho-web.md` |
| régua de qualidade do projeto (CONSTRAINTS.md), exceções | `restricoes.md` |
| menor mudança completa, o que nunca cortar, atalho marcado | `escada-do-minimo.md` |
| revisar pela carga esperada; achado em 4 partes | `revisar-pela-carga.md` |
| auditoria de qualidade do repositório inteiro (não muda código) | `auditar-repositorio.md` |
| lista dos atalhos marcados (`shortcut:`, `atalho:`) | `divida-de-atalhos.md` |

Ferramentas: `<plugin>/scripts/mapa-simbolos.js [pasta]` (o que já existe para reaproveitar), `<plugin>/scripts/checar-ferramenta.js <nome>` (está instalado?), `<plugin>/scripts/gerenciador-pacotes.js
[pasta]` (npm, pnpm, yarn ou bun pelo lockfile), modelo `<plugin>/modelos/quality-gate.mjs` (portão sobre o JSON do
Semgrep ou do axe). Pilha específica: `../plataformas/INDICE.md`. Versão da biblioteca: `../metodo/fonte-oficial-da-versao.md`.

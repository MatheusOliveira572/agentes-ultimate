<!-- Adaptado de addyosmani/agent-skills/skills/git-workflow-and-versioning/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte; comandos destrutivos e push só com o usuário (protocolo); alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=git; palavras=git, commit, commits, branch, ramo, mensagem de commit, versao semantica, semver, tag, changelog, worktree, merge; agentes=engenheiro-software -->
<!-- teste-ref: sim=organize os commits desta mudança e escreva as mensagens de commit | como versionar a biblioteca com versão semântica, tag e changelog; nao=calcule o índice de rotatividade da equipe -->
# Git: commits como pontos de salvamento

## Tronco sempre publicável
Ramo de funcionalidade curto (juntar em 1 a 3 dias); ramo longo acumula risco de conflito. Recurso incompleto vai atrás de
chave (feature flag), não num ramo por semanas. Ramo de versão para estabilizar uma entrega é aceitável.

## Commits
- **Cedo e sempre:** cada fatia que passou ganha o seu commit (`incremental.md`).
- **Atômico:** uma coisa lógica por commit. Formatação separada de comportamento; refatoração separada de funcionalidade
  e de correção.
- **Mensagem diz o porquê:** `tipo: resumo` + corpo com o motivo. Tipos: `feat`, `fix`, `refactor`, `test`, `docs`,
  `chore`. Siga o padrão do repositório se ele tiver outro (leia o `git log`).
- **Tamanho:** ~100 linhas por commit/PR; acima de ~1.000, divida.
- Antes de cada commit: testes passando, nenhum segredo, nada de formatação misturada, `git status` sem arquivo alheio
  (`git add` só com os caminhos que você mudou).

## O que não vai para o git
Saída de build (`dist/`, `.next/`), `.env`, `node_modules/`, chaves (`*.pem`), configuração pessoal do editor. Arquivo
gerado só se o projeto espera (lockfile, migrações). Tenha `.gitignore`.

## Agentes em paralelo
Um `git worktree` por frente de trabalho isola as mudanças: cada pasta no seu ramo, nada se mistura até juntar.

## Resumo da mudança (no relatório)
```
MUDEI: arquivo — o quê e por quê
NÃO MEXI: o que estava perto e ficou de fora (e por quê)
PREOCUPAÇÕES: o que pode quebrar, o que não foi verificado
```

## Depurar com git
`git bisect` acha o commit que introduziu o defeito; `git log -S "<texto>"` acha quando um trecho entrou ou saiu.

## Versão e entrega (quando há quem dependa)
- **Versão semântica** `MAIOR.MENOR.CORREÇÃO`: quebra → maior; acréscimo compatível → menor; correção → correção. Uma
  "correção" que muda comportamento usado é mudança maior disfarçada (lei de Hyrum, `api.md`).
- **Tag** em cada entrega; a versão sai da tag, não de números editados à mão em vários arquivos.
- **Changelog para gente,** não o `git log`: agrupado por Adicionado / Mudou / Corrigido / Obsoleto / Removido /
  Segurança, mais recente no topo, escrito na mesma mudança. Quebra traz nota de migração.

## O que só o usuário autoriza
`push`, `push --force` (nunca em ramo compartilhado), `reset --hard`, apagar ramo ou tag, reescrever histórico: são
irreversíveis ou visíveis a outros. Proponha e espere a confirmação.

## Sinais de alerta
Muita mudança sem commit; mensagens "fix", "update", "misc"; formatação junto com comportamento; sem `.gitignore`;
`node_modules`/`.env` no git; ramo longo divergindo; quebra publicada como versão menor; entrega sem tag ou sem changelog.

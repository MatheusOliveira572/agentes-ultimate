# Segurança · implantação e dependências

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026). Antes, leia `seguranca-contexto.md`
(contexto do projeto, modo de trabalhar e "terminar com").

## Roteiro 21 · dependências vulneráveis e pacotes suspeitos (S-7)
Quase todo app é código de outras pessoas. Quando sai uma falha conhecida, ela é publicada com as versões afetadas e há
quem varra a internet atrás de quem ainda as usa: atualizar é a correção. E todo pacote tem de ser real: a IA às vezes
inventa nomes, e há quem registre esses nomes com código malicioso ("slopsquatting").
**Autoteste de 2 min:** `npm audit --omit=dev` (ou `pnpm audit --prod`), `pip-audit` ou `osv-scanner` no projeto; no
GitHub, ligue os alertas do Dependabot; confira se o framework está numa versão com suporte e correções.

Papel: engenheiro sênior de segurança. Ache e corrija dependências com falha conhecida e confira a lista atrás de
pacotes suspeitos.
- **Auditar:**
  1. Rode as ferramentas da tecnologia (`npm audit`, `pnpm audit`, `pip-audit`, `bundle audit`, `cargo audit`,
     `composer audit`, ou `osv-scanner` para qualquer uma). Sem poder rodar, diga o comando exato para o usuário.
  2. Tabela: pacote · versão instalada · versão corrigida · gravidade · direta ou indireta · usada em produção ou só em
     desenvolvimento · para que serve.
  3. Framework e runtime (Node.js, Python, Next.js, React, Django…) em versão com suporte e correções.
  4. Para cada dependência **direta**: existe no registro oficial? É a conhecida (não um nome quase igual)? Tem
     repositório real e número razoável de downloads? Trocou de dono há pouco? Aponte o que a IA pode ter inventado ou
     errado o nome, e script de instalação (`postinstall`) que não se espera.
  5. Lockfile no git e o CI instalando a partir dele (`npm ci`, `pnpm install --frozen-lockfile`, pip com hashes).
- **Corrigir:** primeiro o Crítico e o Alto de produção, com o menor salto de versão que corrige; em salto de versão
  principal, leia o changelog, liste o que quebra neste código e ajuste; dependência indireta vulnerável: atualize a
  mãe ou use `overrides`/`resolutions`, explicando; nunca `npm audit fix --force` às cegas; build e testes depois de
  cada grupo de atualizações; Dependabot ou Renovate (com atualizações agrupadas) e alertas de segurança ligados.
- **Relatar:** o que foi atualizado, o que ficou (com o motivo: "sem correção", "só desenvolvimento, não vai ao ar") e
  o que parece suspeito na lista.
**Feito quando:** 0 Crítico/Alto em dependência de produção (ou cada um explicado); framework com suporte; toda
dependência direta é real e legítima; lockfile no git; Dependabot ou Renovate ligado; build e testes passam.
**Cuidado:** pacote inventado é ataque real: antes de instalar o que a IA sugeriu, confira em npmjs.com ou pypi.org.
Frameworks soltam correções urgentes com frequência: assine os avisos de segurança do seu.

## Roteiro 22 · tirar o que não se usa (S-8)
Projeto feito com IA acumula pacotes, arquivos e rotas de experimentos abandonados. Dependência sem uso continua sendo
código que pode ter falha ou ser sequestrado; rota esquecida continua sendo uma porta. Tirar encolhe a superfície de
ataque (e o pacote).
**Autoteste:** JavaScript/TypeScript: `npx knip` ou `npx depcheck`; Python: `deptry .`; percorra a pasta de rotas da
API: você reconhece e ainda usa cada uma?

Papel: engenheiro sênior de segurança. Reduza a superfície de ataque tirando o que o app não usa.
- **Auditar:**
  1. Dependências sem uso pela ferramenta certa (knip ou depcheck; deptry; ou busca manual cuidadosa). Confirme cada
     candidata: importação dinâmica, uso em configuração (build, PostCSS, Tailwind, Babel, ESLint, testes), uso por linha
     de comando nos scripts do `package.json`, dependências pares e pacotes de tipos.
  2. Dependências de produção que só servem ao desenvolvimento (tipos, linters, testes, build).
  3. Código morto que ainda vai ao ar: rotas e ações sem uso, páginas de funções removidas, webhooks antigos, rotas de
     teste, demonstração ou carga inicial, ferramentas de administração abandonadas, arquivos sem uso em `public/`.
  4. Variáveis de ambiente, scripts de terceiros (análise de uso antiga, chat), aplicativos OAuth e chaves de API
     ligados a funções removidas.
- **Corrigir:** remova as dependências sem uso e leve as de desenvolvimento para `devDependencies` (ou equivalente);
  apague rotas, páginas e arquivos mortos (na dúvida, liste em vez de apagar); tire scripts e variáveis sem uso; build,
  testes e o app de pé para confirmar que tudo funciona.
- **Relatar:** tabela item · tipo (pacote, rota, arquivo, script, variável, chave) · evidência de que não se usa · o que
  foi feito; e as chaves e aplicativos OAuth para o usuário revogar no painel.
**Feito quando:** nenhuma dependência sem uso; ferramentas de desenvolvimento em `devDependencies`; rotas, páginas e
rotas de teste mortas apagadas; scripts e chaves sem uso removidos ou revogados; o app ainda compila e roda.
**Cuidado:** detector de dependência sem uso tem falso positivo: compile e teste sempre depois de tirar.

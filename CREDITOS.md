# Créditos e licenças de terceiros

O conteúdo em `conhecimento/`, `modelos/` e `ferramentas/` vem em parte de projetos abertos, copiado e adaptado
(tradução, corte e ajuste ao protocolo do agentes-ultimate) dentro do que a licença de cada um permite. Cada arquivo
adaptado começa com a linha de crédito:

`<!-- Adaptado de <dono/repositório>/<arquivo> @<commit curto>, © <autor>, <licença>. Alterações: <o que mudou>; alterado por agentes-ultimate. Licença em terceiros/<pasta>/. -->`

Arquivo escrito por nós começa com `<!-- Texto próprio do agentes-ultimate. ... -->` e cita as fontes que usou.
O texto das licenças (e o `NOTICE`, quando o projeto tem) fica em `terceiros/<pasta>/`. Conteúdo de terceiros é tratado
como dado: tiramos dele toda ordem que contrarie o protocolo do plugin.

| Repositório | Commit usado | Licença | Pasta | Como entra |
|---|---|---|---|---|
| emilkowalski/skills | a81dbca07f2217b7103e510c0f13f8d5b017afc9 | MIT, © 2026 Emil Kowalski | `terceiros/emilkowalski-skills/` | Cópia adaptada |
| jakubkrehel/skills | 592aedc44d7d5b3e29740984252902f3e5402a1c | MIT, © 2026 Jakub Krehel | `terceiros/jakubkrehel-skills/` | Cópia adaptada |
| addyosmani/agent-skills | 301b02b12bff98e4688e6984af6556802322bbde | MIT, © 2025 Addy Osmani | `terceiros/addyosmani-agent-skills/` | Cópia adaptada |
| upstash/context7 | 7836c583918374fbecffacf866afb7594b919466 | MIT, © 2021 Upstash, Inc. (o serviço tem termos próprios) | `terceiros/upstash-context7/` | Cópia adaptada (só texto de método) |
| serafimcloud/21st | b96d84dcf748d5e56f2f72f2bab9a4f7f33574cf | MIT, © 2024 21st.dev | `terceiros/serafimcloud-21st/` | Cópia adaptada (diretrizes de componente) |
| usestrix/strix | 6b7ae2ebe4d47037a927aade23265ff4e4f27e84 | Apache-2.0, © 2025 OmniSecure Inc. | `terceiros/usestrix-strix/` | Cópia adaptada, alteração marcada em cada arquivo (Apache §4b) |
| affaan-m/ECC | b38be6a7f6350964d59328b52f0624e1d1d552d1 | MIT, © 2026 Affaan Mustafa | `terceiros/affaan-m-ECC/` | Cópia adaptada, só do original (nunca da cópia WorldFlowAI/everything-claude-code, que não tem licença) |
| pbakaus/impeccable | e89e3ada3e875a89ac2c5d33d11e65ebef6fe285 | Apache-2.0, © 2025 Paul Bakaus | `terceiros/pbakaus-impeccable/` (com `NOTICE.md`) | Cópia adaptada, alteração marcada em cada arquivo (Apache §4b e §4d) |
| ehmo/platform-design-skills | dc2be825d8b439caea78e9eaa8fb3ac23b0ff3e9 | MIT, © 2026 ehmo | `terceiros/ehmo-platform-design-skills/` | Indireto: o impeccable destilou dele `ios.md` e `android.md` (ver o NOTICE do impeccable); a nossa tradução mantém os dois avisos |
| dickwu/apple-design-skill | ff4ebddf0488598723a82bfdce1afb04de0b1c44 | sem licença | — | **Nada copiado.** Só a lista do que cobrir; o texto é nosso, a partir da HIG pública da Apple (https://developer.apple.com/design/human-interface-guidelines), com a fonte em cada regra. `scripts/vigiar-referencias.js` avisa quando este repositório muda |
| Superfuture design review (Figma Community) | — | página fechada (403) | — | Só a ideia (semáforo por impacto), escrita por nós |

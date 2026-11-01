<!-- Adaptado de addyosmani/agent-skills/skills/deprecation-and-migration/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=migracao; palavras=migracao, migrar, migrar o sistema, aposentar, descontinuar, sistema legado, legado, trocar a biblioteca, renomear coluna, renomear uma coluna, coluna do banco, mudanca de esquema, expandir e contrair; agentes=engenheiro-software, engenheiro-dados -->
<!-- teste-ref: sim=migrar o sistema legado de pedidos para a API nova sem parar os clientes | preciso renomear uma coluna do banco em produção sem quebrar nada; nao=organize a festa de fim de ano -->
# Aposentar e migrar com segurança

Código é passivo, não ativo: cada linha custa teste, atualização e atenção. Pela lei de Hyrum, tudo o que é observável tem
alguém dependendo, inclusive defeito e tempo de resposta. Por isso o plano de aposentadoria começa no desenho: "como
tiraríamos isto em 3 anos?".

## Antes de aposentar
Há substituto pronto e provado em produção, cobrindo os usos críticos? Quem usa hoje (medido, não suposto)? Quanto custa
manter × migrar? Qual o risco de não fazer?

## Aviso ou obrigação
- **Aviso (padrão):** o antigo é estável; avisos, documentação, cada um migra no seu tempo.
- **Obrigatória:** risco de segurança, bloqueio ou custo insustentável. Data firme, ferramenta de migração e apoio.
Quem é dono da infraestrutura aposentada é responsável por migrar os usuários (ou entregar atualização compatível).

## Processo
1. **Construir o substituto** (cobre os usos críticos, tem guia de migração, provado em produção).
2. **Anunciar e documentar:** o que muda, até quando, como migrar, a quem perguntar.
3. **Migrar aos poucos,** um consumidor por vez: migrar, conferir, confirmar sem uso do antigo, seguir.
4. **Tirar o antigo** só com 0 uso confirmado por métrica ou log: código, testes, documentação, configuração e os avisos.

## Padrões
- **Estrangulamento:** antigo e novo em paralelo, tráfego passando aos poucos; com 0% no antigo, ele sai.
- **Adaptador:** o consumidor continua na interface antiga, que chama o novo por baixo.
- **Feature flag:** troca consumidor por consumidor do antigo para o novo.

## Esquema de banco: expandir → contrair
O dado é a única coisa que não volta com reverter a implantação. Ex.: renomear `nome` para `nome_completo`:
1. **Expandir:** cria `nome_completo` aceitando nulo. Implanta (o código antigo ignora).
2. **Gravar nos dois:** o app grava `nome` e `nome_completo`. Implanta.
3. **Preencher o passado** em lotes, fora do horário de pico, sem travar a tabela.
4. **Trocar a leitura** para `nome_completo`, ainda gravando nos dois. Implanta e observa.
5. **Contrair:** para de gravar em `nome` e, numa implantação **separada e posterior**, apaga a coluna.
Regras: acrescentar primeiro, destruir por último e sozinho; toda migração com o caminho de volta (`down`) testado antes do
merge; lote com pausa, nunca um `UPDATE` em milhões de linhas; índice grande sem bloquear escrita (ex.: Postgres
`CREATE INDEX CONCURRENTLY`); esquema e código que depende dele nunca na mesma implantação.

## Código zumbi
Sem dono, mas com gente dependendo (sem commit há 6+ meses, testes falhando que ninguém corrige, dependência vulnerável
parada). Não fica no limbo: ou ganha dono, ou entra num plano de aposentadoria.

## Pronto quando
Substituto provado; guia de migração com passos; todos os consumidores migrados (provado por métrica ou log); nada do
antigo sobrou no repositório; na migração de esquema, fases separadas, cada uma válida para o código antigo e o novo, com
volta testada.

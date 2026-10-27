# agentes-ultimate

Uma base de agentes especialistas para o [Claude Code](https://claude.com/claude-code), em português, para **qualquer
trabalho**: um painel de BI, uma análise financeira, um relatório, um script, uma pesquisa.

Você só faz o pedido. A base:

1. **escolhe sozinha** os especialistas certos, pelo assunto do pedido e pelos arquivos da pasta, e mostra a escolha
   numa linha (`Usando: BI e painéis + Finanças · designer-paineis, dev-powerbi, analista-fpa, revisor`);
2. **não começa no escuro:** antes de agir, traz o que já foi feito sobre o assunto (diário, lições, mapa do projeto);
3. **monta a memória do projeto** na primeira vez, sem você pedir;
4. **cobra prova:** nada é "pronto" sem um comando rodado e lido; um revisor independente confere antes de você;
5. **aprende:** erro vira lição com causa e evidência; lição que se repete vira regra; e você aprova qualquer mudança
   no comportamento dos agentes;
6. **protege:** pede confirmação antes de publicar e bloqueia commit de senha ou dado sensível.

Se a escolha errar, diga `era com <agente>`: ela refaz e aprende para os próximos pedidos parecidos.

## Instalar

Pré-requisitos: Claude Code e [Node.js](https://nodejs.org/) (os ganchos são scripts Node, sem dependências).

No Claude Code:

```
/plugin marketplace add MatheusOliveira572/agentes-ultimate
/plugin install agentes-ultimate@agentes-ultimate
```

Ou pelo terminal:

```bash
claude plugin marketplace add MatheusOliveira572/agentes-ultimate
claude plugin install agentes-ultimate@agentes-ultimate
```

Para atualizar depois: `claude plugin marketplace update agentes-ultimate`.

Para testar uma cópia local sem instalar: `claude --plugin-dir <pasta-do-repositório>`.

## O que vem

**Núcleo** (sempre disponível): `planejador`, `pesquisador`, `revisor`, `redator`, `curador`.

| Pacote | Entra quando o pedido fala de… ou a pasta tem… | Agentes |
|---|---|---|
| BI e painéis | Power BI, DAX, painel, dashboard · `.pbip`, `.tmdl` | `designer-paineis`, `engenheiro-dados`, `dev-powerbi` |
| Finanças e FP&A | orçado, realizado, desvio, custo, rateio, fechamento | `analista-fpa` |
| Produto | escopo, prioridade, proposta, critério de aceite | `gerente-produto` |
| Software | código, erro, script, API, testes · `package.json`, `pyproject.toml` | `engenheiro-software`, `testador-qa`, `auditor-seguranca` |
| Documentos | apresentação, relatório, PDF, manual, e-mail · `.pptx`, `.docx` | `designer-documentos`, `redator` |

**Skills:**

| Skill | Para quê |
|---|---|
| `ultimate` | O método do orquestrador: situar-se, escolher, contrato, prova, revisor, decisões, memória |
| `rodada` | Uma rodada de construção do começo ao teste do usuário, com pausa e retomada |
| `fechar-etapa` | Fecha uma etapa: provas, taxa de captura do revisor, curadoria, estado |
| `criar-agente` | Cria um agente novo no padrão, com evals |
| `rascunho` | Trabalha numa cópia isolada (git worktree) sem atrapalhar a versão em uso |
| `metodo-powerbi` | Como construir Power BI premium com agentes: PBIP gerado, testes pelo motor, Desktop Bridge |

## Como funciona

```
pedido → roteador (gancho) ─┬─ escolhe pacotes e agentes (palavras + arquivos + suas correções)
                            ├─ traz "já feito sobre isto" (diário, lições, mapa)
                            └─ cria .claude/base/ na 1ª vez
       → orquestrador (skill ultimate) → agentes → revisor → você
```

A memória de cada projeto fica dentro dele, em `.claude/base/`:

| Arquivo | Quem escreve | O que guarda |
|---|---|---|
| `PROJETO.md` | orquestrador | objetivo, decisões com data, restrições, "retomar aqui" |
| `MAPA.md` | todos | onde fica cada coisa |
| `DIARIO.md` | todos | uma linha por entrega |
| `APRENDIZADOS.md` | todos | lições com causa, evidência e "vale para" |
| `PROPOSTAS.md` | todos | melhorias nas instruções dos agentes, à espera da sua aprovação |
| `CHANGELOG-AGENTES.md` | curador | o que mudou nos agentes, quando e por quê |
| `sensiveis.txt` | você | padrões de arquivo que nunca vão para o git (ex.: `dados/**`) |

Cada agente também tem a própria memória (`.claude/agent-memory/<agente>/`), com **Playbook** (regras de trabalho
com o porquê), histórico e contexto consolidado.

Detalhes em [docs/como-funciona.md](docs/como-funciona.md). Para criar um pacote seu (ex.: jurídico, marketing), veja
[docs/criar-pacote.md](docs/criar-pacote.md).

## Desligar num projeto

Crie o arquivo `.claude/base/desligado` na pasta do projeto, ou defina `AGENTES_ULTIMATE_SEM_PASTA=1`. A base nunca
cria memória na sua pasta de usuário nem na raiz do disco.

## Privacidade e segurança

- Nada sai do seu computador por causa do plugin: os ganchos só leem o pedido e a pasta, localmente.
- As correções `era com…` ficam em `~/.claude/agentes-ultimate/` (só o texto do pedido e o agente).
- Publicar (`git push`, `npm publish`, deploy de produção) sempre pede confirmação.
- Commit de `.env`, chaves e dos padrões de `sensiveis.txt` é bloqueado.

## Para quem quer contribuir

```bash
node scripts/gerar-agentes.js   # gera agents/ a partir de fonte/ (protocolo comum + parte de cada agente)
node scripts/validar.js         # confere protocolo, cabeçalhos, seções, pacotes e skills
node scripts/testar-hooks.js    # testa o roteador e as travas com pedidos de exemplo
claude plugin validate .
```

Edite sempre `fonte/`; `agents/` é gerado.

## Origem

Nasceu de um projeto real de painel financeiro em Power BI construído com um time de agentes, e incorpora ideias do
[UAO](https://github.com/MatheusOliveira572/UOA) (modelo comum de agente, memória × playbook, propostas com aprovação).
As regras gerais da skill `ultimate` são lições daquele projeto, cada uma com o porquê.

## Licença

MIT.

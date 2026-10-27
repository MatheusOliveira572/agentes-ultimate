# agentes-ultimate

Uma base de agentes especialistas para o [Claude Code](https://claude.com/claude-code), em português, para **qualquer
trabalho**: um painel de BI, uma análise financeira, um relatório, um script, uma pesquisa.

Você só faz o pedido. A base:

1. **escolhe sozinha** os especialistas certos, pelo assunto do pedido e pelos arquivos da pasta, e mostra a escolha
   numa linha (`Usando: BI e painéis + Finanças · designer-paineis, dev-powerbi, analista-fpa, revisor`);
2. **não começa no escuro:** antes de agir, traz o que já foi feito sobre o assunto. Ela mantém um **grafo do
   projeto** (o que é cada arquivo, quem cita quem, e quais registros da memória falam de cada arquivo) e busca com
   **sinônimos** ("despesas por área" acha "custos por gerência") e pelas **ligações** (pedido sobre um arquivo traz os
   arquivos ligados e o histórico dele). Tudo local, sem IA;
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

**Atualização automática:** uma vez por dia, ao abrir uma sessão, o plugin busca a versão nova em segundo plano
(`claude plugin marketplace update` + `claude plugin update`). Ela vale a partir da próxima vez que você abrir o
Claude Code, e uma linha avisa "agentes-ultimate atualizado: 0.2.0 → 0.3.0". Para desligar, defina
`AGENTES_ULTIMATE_SEM_AUTOATUALIZAR=1`. Para atualizar na hora:

```bash
claude plugin marketplace update agentes-ultimate
claude plugin update agentes-ultimate@agentes-ultimate
```

Para testar uma cópia local sem instalar: `claude --plugin-dir <pasta-do-repositório>`.

## O que vem

**Núcleo** (sempre disponível): `planejador`, `pesquisador`, `revisor`, `redator`, `curador`.

30 agentes, cada um trabalhando como **as melhores empresas daquela função** (pelo menos 3 empresas diferentes por
agente, com a prática documentada e a fonte aberta), com casos de teste próprios em `evals/`.

| Pacote | Entra quando o pedido fala de… | Agentes | Algumas referências |
|---|---|---|---|
| BI e painéis | Power BI, DAX, painel, dashboard (ou a pasta tem `.pbip`) | `designer-paineis`, `engenheiro-dados`, `dev-powerbi` | Financial Times, Airbnb, Microsoft, SQLBI |
| Finanças | orçado, realizado, desvio, fechamento, caixa, capital de giro | `analista-fpa`, `analista-tesouraria` | Microsoft Finance, Equinor, Apple, Ambev |
| Contábil e tributário | contabilidade, CPC/IFRS, imposto, reforma tributária, SPED | `contador`, `especialista-tributario` | Deloitte, KPMG, Unilever |
| Pessoas (RH) | vaga, entrevista, cargos e salários, desempenho, clima | `analista-rh`, `recrutador` | Google People Ops, Netflix, Natura, Amazon, Nubank |
| Jurídico | contrato, cláusula, LGPD, dados pessoais | `advogado-contratos`, `especialista-lgpd` | GE, GitHub, Apple, Google, Microsoft |
| Compliance e riscos | programa de integridade, controles, canal de denúncia | `analista-compliance` | Siemens, Petrobras, Microsoft |
| Comercial | funil, proposta comercial, previsão de vendas, CRM | `executivo-vendas` | Salesforce, HubSpot, RD Station |
| Marketing | posicionamento, campanha, marca, CAC/LTV | `estrategista-marketing` | P&G, Airbnb, Magalu, Google |
| Clientes | atendimento, NPS, churn, SLA | `especialista-cs` | Amazon, Bain, Zendesk, Gainsight |
| Operações e suprimentos | processos, lean, gargalo, compras, fornecedor | `analista-operacoes`, `comprador` | Toyota, Amazon, Danaher, Apple, P&G |
| Estratégia | planejamento estratégico, OKR, business case | `estrategista` | Google, Amazon, BCG |
| Comunicação | comunicado, imprensa, crise | `comunicador-corporativo` | J&J, Netflix, Amazon |
| ESG | emissões, sustentabilidade, GRI, IFRS S2 | `especialista-esg` | Microsoft, Schneider Electric, Natura |
| Produto | escopo, prioridade, proposta | `gerente-produto` | Amazon, Intercom, Nubank |
| Software | código, erro, script, testes, segurança | `engenheiro-software`, `testador-qa`, `auditor-seguranca` | Google, Microsoft, Stripe, Spotify |
| Documentos | apresentação, relatório, PDF, manual, e-mail | `designer-documentos`, `redator` | Duarte, Financial Times, Amazon, Mailchimp |

Nas áreas reguladas (jurídico, tributário, contábil, trabalhista), o agente cita a lei com o artigo e o link oficial e
diz quando a decisão precisa de advogado ou contador habilitado. O padrão completo está em
[docs/padrao-agente.md](docs/padrao-agente.md).

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

**Ver o mapa ao vivo:** peça "mostre o mapa" (skill `ver-mapa`). Abre no navegador um desenho do projeto: cada
arquivo é um ponto, cada "este arquivo cita aquele" é uma linha, as anotações da memória são quadrados roxos, e o que o
**último pedido usou** aparece em verde (o que está ligado a ele, em laranja). **Enquanto o Claude trabalha**, cada
arquivo que ele ou um agente lê acende na cor do agente, o que é editado fica vermelho, e uma lista mostra "14:32 ·
dev-powerbi editou medidas.js". Roda só no seu computador (127.0.0.1) e guarda só caminhos, nunca conteúdo. Para abrir
sozinho a cada sessão: `"mapa": { "abrir_sozinho": true }` em `.claude/base/config.json`. Não é o raciocínio do modelo
(isso não é visível); é onde o trabalho está acontecendo.

A memória de cada projeto fica dentro dele, em `.claude/base/`:

| Arquivo | Quem escreve | O que guarda |
|---|---|---|
| `PROJETO.md` | orquestrador | objetivo, decisões com data, restrições, "retomar aqui" |
| `MAPA.md` | todos | onde fica cada coisa (escrito à mão) |
| `MAPA-AUTO.md` | a base, sozinha | cada arquivo com uma linha dizendo o que é e quem cita quem (refeito a cada 10 min ou commit novo; fora do git) |
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

**Publicar uma versão nova** (para chegar a todos os PCs instalados): suba o número em `.claude-plugin/plugin.json`
(ex.: 0.3.0 → 0.3.1), registre no `CHANGELOG.md`, faça commit e `git push`. Sem subir o número, os outros PCs não
percebem a mudança.

## Origem

Nasceu de um projeto real de painel financeiro em Power BI construído com um time de agentes, e incorpora ideias do
[UAO](https://github.com/MatheusOliveira572/UOA) (modelo comum de agente, memória × playbook, propostas com aprovação).
As regras gerais da skill `ultimate` são lições daquele projeto, cada uma com o porquê.

## Licença

MIT.

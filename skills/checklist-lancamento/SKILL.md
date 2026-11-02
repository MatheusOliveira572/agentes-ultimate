---
name: checklist-lancamento
description: Lista de verificação antes de publicar, lançar ou abrir para mais gente (go-live) um painel, app, site, ferramenta interna ou repositório. Pergunta o perfil do que vai sair, aplica só os blocos que cabem (segredos e acesso, app web com login, LGPD, acessibilidade, honestidade do que se afirma, licenças), verifica o comportamento real de cada item e entrega o relatório com Passou / Corrigido e retestado / Aberto / Não se aplica / Só o usuário faz. Use antes de publicar, compartilhar com mais pessoas, tornar um repositório público ou lançar uma versão, e quando o git push lembrar. Não use para a revisão de uma rodada comum (→ skill rodada e agente revisor).
---
# Checklist de lançamento

Base: os checklists do autor do plugin ("The App Launch Checklist" e "Pre-launch Security Toolkit", 2026), traduzidos e
adaptados ao Brasil e a ferramentas internas. Não é parecer jurídico: o que tem efeito legal vai a advogado habilitado.
As leis citadas foram conferidas no texto oficial pelo `especialista-lgpd` em 2026-11-01; o que ainda leva
**[conferir]** (texto não aberto) ou **[HIPÓTESE]** (interpretação) vai ao jurídico antes de valer.

**Regra central:** ter a página, o botão ou o texto não prova que o produto se comporta assim. Cada item só passa com o
comportamento verificado (comando, teste automatizado, print do usuário), nunca com "existe".

## 1. Perfil do que vai sair
Descubra na pasta o que der e pergunte o resto. Escreva as respostas no topo do relatório.
1. **Público ou interno?** Internet aberta, clientes com login, ou só pessoas da empresa? Quantas?
2. **Dado pessoal?** De quem: clientes, empregados, crianças ou adolescentes? Tem dado sensível (saúde, biometria)?
3. **Login próprio?** Há servidor próprio que autentica, ou o acesso é da plataforma (Power BI, SharePoint, Google)?
4. **IA?** O produto chama um modelo, ou publica texto, imagem ou voz gerados por IA?
5. **Entrada de fora?** Recebe arquivo enviado pelo usuário, ou busca uma URL que o usuário informa?
6. **Repositório público?** O código, o histórico ou os arquivos vão ficar visíveis a terceiros?
7. **Cobrança?** Vende, assina ou cobra do consumidor?

## 2. Blocos que cabem
| Bloco | Entra quando | Itens |
|---|---|---|
| **S** · Segredos, acesso, dependências, exposição, contas | sempre | `itens.md` §S |
| **S-web** · App com servidor próprio | resposta 3 = login próprio, ou 5 = sim | `itens.md` §S-web |
| **P** · Privacidade (LGPD) | resposta 2 = sim | `itens.md` §P |
| **A** · Acessibilidade | tem tela | `itens.md` §A |
| **H** · Honestidade do que se afirma | há texto ao público ou ao usuário (página, descrição, e-mail, painel) | `itens.md` §H |
| **L** · Licenças | sempre | `itens.md` §L |
| C-venda · Venda ao consumidor | resposta 7 = sim | ainda não existe: diga ao usuário e peça `advogado-contratos` |

Leia `itens.md` (nesta pasta) só nos blocos que entraram. Os roteiros detalhados de segurança (auditar, corrigir,
verificar, feito quando) ficam em `referencias/`, um arquivo por área; abra só o da área do item, quando for executar:

| Área | Arquivo |
|---|---|
| Contexto do projeto, mapa do app, modo de trabalhar | `referencias/seguranca-contexto.md` (leia antes de qualquer outro) |
| Segredos e chaves | `referencias/seguranca-segredos.md` |
| Identidade e acesso | `referencias/seguranca-identidade.md` |
| Dados e entradas | `referencias/seguranca-dados.md` |
| Rede e navegador | `referencias/seguranca-rede.md` |
| Implantação e dependências | `referencias/seguranca-publicacao.md` |
| Monitoramento, revisão final, testes, incidente | `referencias/seguranca-revisao.md` |
| Extras (IA, SSRF, backup, contas, gasto, privacidade) | `referencias/seguranca-extras.md` |

## 3. Cada item
Para cada item do bloco: faça o "Verificar:" (comportamento, não existência), registre o dono, o status e a evidência.
Delegue pela função: segurança → `auditor-seguranca` (só relata) e `engenheiro-software` (corrige, com teste que falha
antes); LGPD → `especialista-lgpd`; acessibilidade e "atualizado em" → `designer-paineis`; textos → `redator`; termos,
marca e contrato → `advogado-contratos`; alegação de marketing → `estrategista-marketing`.

## 4. Relatório
Grave em `docs/lancamento/<data>-<o-que-sai>.md`:
1. Perfil (as 7 respostas) e os blocos aplicados.
2. Resumo: total de itens; Passou; Corrigido e retestado; Aberto; Não se aplica; Só o usuário faz.
3. Tabela: item · status · evidência (nome do teste, comando ou print) · próximo passo.
4. Achados e correções: o que estava errado, o que mudou (arquivos) e o teste que prova agora.
5. Abertos, com o risco e o próximo passo exato de cada um.
6. "Só o usuário faz", como lista para marcar (MFA, limite de gasto, troca de chave no painel do provedor, publicar).

Regras do relatório:
- Todo item aparece, inclusive o que não se aplica, sempre com o motivo. Item crítico "não se aplica" sem motivo é defeito.
- "Passou" só com evidência. "Aberto" sempre com o próximo passo.
- Desconfie, e trate como defeito: "tudo seguro" sem evidência; teste apagado ou enfraquecido para passar; achado sem
  arquivo, linha ou endereço.

## 5. Repita na versão final
As verificações valem na versão final que vai ao ar (o build de produção, o relatório publicado no workspace, o
repositório como vai ficar público), não só na de desenvolvimento. Confira também que a página pública, a descrição e o
produto dizem a mesma coisa.

## 6. Depois do lançamento: mexeu em X, rode Y
| Mexeu em | Rode |
|---|---|
| Login, cadastro ou sessão | S-web-1, S-web-2, S-web-5, S-web-6, S-web-8, S-web-15 |
| Tabela nova, dado novo, RLS ou papel novo | S-6, S-web-3, S-web-7, P-1 |
| Rota de API ou ação no servidor | S-web-1, S-web-3, S-web-7, S-web-13, S-web-15 |
| Texto do usuário exibido (comentário, perfil) | S-web-4, S-web-7, S-web-15 |
| Upload | S-web-9, S-web-3, S-web-15 |
| Busca de URL informada pelo usuário | S-web-11, S-web-7 |
| Pagamento ou assinatura | S-web-10, S-web-7, S-web-15, S-12 |
| Ferramenta de administração | S-web-13, S-12, S-web-4 |
| Chave nova ou serviço de terceiro novo | S-1, S-2, S-10, P-5 |
| IA | S-1, S-web-4, S-web-12, S-web-15, S-10, H-7 |
| Pacote novo | S-7 (confira no registro oficial antes de instalar) |
| Dado pessoal novo ou fornecedor novo | P-1, P-4, P-5 |
| Publicar ou abrir para mais gente | S-9, S-11, revisão completa e testes de quebra (`referencias/seguranca-revisao.md`), o checklist inteiro e a §5 |

Ritmo sugerido: a cada commit, a trava de segredos do plugin; a cada publicação, os testes de segurança; todo mês,
auditoria de dependências e revisão de quem tem acesso; a cada trimestre, revisão completa e teste de restauração do backup.

## 7. Se algo der errado
Chave vazada, acesso estranho, cobrança inesperada ou dado alterado sozinho: siga o cartão de incidente em
`referencias/seguranca-revisao.md` §Incidente. Se houve dado pessoal afetado, chame o `especialista-lgpd` no mesmo dia
(prazo de comunicação à ANPD contado desde que se soube).

# Proposta: regras de dois checklists de lançamento (2026-11-01)

> **Registro (2026-11-01, decisão D-1, revisão da parte A, b-5):** os 2 PDFs de origem são do próprio usuário, que confirmou a autoria; o uso,
> inclusive a tradução próxima dos roteiros em `skills/checklist-lancamento/referencias/`, é legítimo. Esta proposta já foi aplicada
> (commits "0.8.0 G1" a "G11"): onde o texto abaixo diz "só proposta", "autoria não identificada" ou que os prompts não entram no plugin,
> vale este registro. Regra de treino de IA: vale a redação conferida pela `especialista-lgpd` no `CHANGELOG.md`.

> Só proposta. Nada do plugin foi alterado. Cada mudança daqui passa pelo curador e pela aprovação do usuário
> (fluxo de `PROPOSTAS.md`). O texto é nosso: nenhum trecho longo dos PDFs foi copiado.
> Isto não é parecer jurídico. As leis citadas precisam ser conferidas no texto oficial antes de virarem regra de
> agente. O que tem efeito legal vai a advogado habilitado.

## 0. Resumo

- **PDF A, "The App Launch Checklist":** 35 verificações de jurídico, privacidade, acessibilidade e confiança antes
  de lançar um app. O foco é UE, Reino Unido e EUA, com 45 referências oficiais (R1 a R45, sem R41 e R43).
- **PDF B, "Pre-launch Security Toolkit":** 27 verificações de segurança mais 7 extras (B1 a B7). Cada uma vem com
  um prompt para o Claude, um autoteste de 2 minutos e uma lista "feito quando". Fecha com um relatório de testes que
  tentam quebrar cada proteção. Foi escrito para quem constrói apps web com IA.
- **O que mais vale para o plugin:**
  1. A ideia central dos dois: ter uma página ou um botão não prova que o produto se comporta assim. Isso já é o
     nosso "prova pela fonte real".
  2. O B traz regras gerais de segredos, pacotes e histórico do git que faltam no protocolo e nas travas.
  3. O A dá a estrutura para uma skill `/checklist-lancamento`. Ela pergunta primeiro o perfil do que vai ser
     publicado e só aplica os blocos que cabem.
- **Para quem faz painel interno e ferramenta de empresa:** cabe pouca coisa da parte de consumidor (reembolso,
  renovação, cookies, marketing). Cabe quase tudo de segredos, controle de acesso, LGPD de empregados,
  acessibilidade, licenças e honestidade do que se afirma ("dados atualizados diariamente", "seguro").

## 1. Os PDFs: o que são, autoria e o que podemos usar

| | PDF A | PDF B |
|---|---|---|
| Arquivo | `docs/Safari.pdf` (45 páginas) | `docs/6ae1129b…ef.pdf` (66 páginas) |
| Título | The App Launch Checklist | Pre-launch Security Toolkit ("Lock down your vibe-coded app before launch") |
| O que é | Material que acompanha um vídeo curto: 35 itens em 8 temas, cada um com "o que é", "quando se aplica", etapas Preparar/Implementar/Verificar e fontes | Material que acompanha um vídeo: 27 verificações em 6 áreas (identidade, segredos, dados e entradas, rede, implantação, monitoramento), 7 extras, um cartão de incidente, uma rotina pós-lançamento e um glossário |
| Data | Pesquisa atualizada até outubro de 2026 | Sem data. Cita fatos de 2025 |
| Autoria | Não aparece no arquivo | Não aparece. Cita um arquivo de apoio, `SECURITY_PROMPTS.md`, e um app de exemplo fictício, "Plantly" |
| Licença ou termos | Nenhuma licença. Só um aviso: é informação geral, não aconselhamento jurídico, e não garante conformidade | Nenhuma licença. Só um aviso: revisores de IA erram, e quem trata pagamento, saúde ou dados de criança deve contratar teste profissional |

**Podemos reproduzir trechos? Não. Usamos só as ideias, com as nossas palavras e a fonte citada.**
- Sem licença, vale "todos os direitos reservados". A Lei 9.610/1998 protege o texto (art. 7º) e exige autorização
  para reproduzir (art. 29). Ela não protege ideias, métodos nem sistemas (art. 8º, I).
  https://www.planalto.gov.br/ccivil_03/leis/l9610.htm
- Citação curta é permitida para estudo ou crítica, com o nome do autor e a origem (art. 46, III). Aqui não temos o
  autor, então nem citação curta deve ir para o plugin público.
- **Os 36 prompts do PDF B não entram no plugin, nem traduzidos.** Prompt é texto protegido, e tradução também
  precisa de autorização (art. 29, IV). A skill deve ter checagens escritas por nós.
- Para citar a fonte, falta a origem (site ou autor). Fica como decisão do usuário (D-1). Até lá, a citação é
  "checklist público de lançamento de apps (2026), autoria não identificada".
- As referências oficiais do PDF A (GDPR, WCAG, CDC europeu, FTC) são públicas. Podemos citá-las direto pelos links
  oficiais, sem passar pelo PDF.

## 2. O que o plugin já cobre

| Ideia dos PDFs | Onde já está |
|---|---|
| Testar o comportamento, não a existência da página (A, "Verify"; B, check 27) | `fonte/comum.md`, item 3 ("prova pela fonte real") e item 1 do fim |
| Pedir aconselhamento qualificado | "Regra do método" de `advogado-contratos`, `especialista-lgpd` e `analista-compliance` |
| Revogar o segredo antes de limpar o histórico (B 24/25) | `auditor-seguranca`, referência GitHub |
| Contraste e cor nunca sozinha (A 19) | `designer-paineis`, referência WCAG 2.2 e método passo 5 |
| Injeção de prompt e conteúdo de terceiro tratado como dado (B, B1) | `comum.md`, item 6, e `auditor-seguranca`, referência OWASP LLM01 |
| Bloquear commit de `.env` e chaves (B 11/24) | `hooks/travas.js`, mas **só pelo nome do arquivo** |
| Confirmar antes de publicar | `hooks/travas.js` (push, npm publish, deploy) e `ultimate` §6 |
| Minimização e prazo de guarda (A 11/12) | `especialista-lgpd`, método passos 1 e 4, referências Apple e Google |
| Incidente com prazo (B, cartão de emergência) | `especialista-lgpd`, passo 5 (Resolução CD/ANPD 15/2024) |
| "Não invente número" contra alegação sem prova (A 27) | `comum.md`, item 5 |
| Relatório com "N/A só com motivo" e "o que só você faz" (B, relatório) | Em parte: o revisor monta "a lista do usuário" |

**Lacunas principais:**
1. A trava não lê o conteúdo do commit. Uma chave colada dentro de um `.js` passa.
2. Nada impede o agente de imprimir o valor de um segredo ou de instalar um pacote que não existe (pacote inventado
   pela IA, o "slopsquatting").
3. O revisor não trata como defeito um teste enfraquecido para passar.
4. Falta uma lista de lançamento única que escolha os blocos pelo perfil do que vai ser publicado.

## 3. As regras em grupos, onde cada uma entra e a adaptação ao Brasil

Legenda de onde entra: **P** = protocolo comum · **Ag** = agente (seção) · **Sk** = skill nova
`/checklist-lancamento` · **Au** = regra automática (validador ou gancho) · **Fora** = não cabe.
Legenda da prioridade: **Já**, **Depois** ou **Fora** (seção 4).

### G1. Segredos e chaves (B 02, 11, 24, 25; B4, B5)
| Regra (nas nossas palavras) | Onde entra | Prioridade |
|---|---|---|
| Nunca pedir, colar nem imprimir o valor de um segredo. Referir pelo nome da variável | **P**: uma linha em "Durante o trabalho" | Já |
| Segredo exposto (código, histórico, log, print, chat) conta como roubado. A ordem é: criar o novo, pôr no ar, revogar o antigo, provar que o antigo falha. Reescrever o histórico vem depois, se vier | **Ag** `auditor-seguranca`: Método e Erros conhecidos (hoje só diz "revogue antes") | Já |
| O commit não pode levar segredo no conteúdo: cabeçalho de chave privada, padrões de chave de nuvem, de token do GitHub e de chave de IA, texto de conexão com senha | **Au** `hooks/travas.js`: ler `git diff --cached -U0` e bloquear só padrões de alta confiança, com o motivo | Já |
| Varrer o histórico inteiro, com todas as branches, ao publicar um repositório | **Ag** `auditor-seguranca`: Método passo 1 ganha "todas as branches e tags" | Já |
| MFA nas contas que controlam o projeto (git, nuvem, Power BI, IA) e limite de gasto nas APIs pagas | **Sk**, bloco S, como item "só o usuário faz" | Já (na skill) |

**Brasil:** a LGPD obriga a medidas de segurança (art. 46) e à comunicação do incidente com risco relevante
(art. 48). https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
**Painel interno:** vale igual. Credencial de gateway, conta de serviço e texto de conexão no PBIP ou em script contam
como segredo.

### G2. Pacotes e cadeia de suprimentos (B 21, 22)
| Regra | Onde entra | Prioridade |
|---|---|---|
| Antes de instalar um pacote sugerido, confirmar que ele existe no registro oficial e que é o conhecido, não um nome parecido | **P**: na mesma linha de G1 | Já |
| Auditoria de dependências (`npm audit`, `pip-audit`, `osv-scanner`) e lockfile no git antes de publicar | **Ag** `auditor-seguranca`: Método. **Ag** `engenheiro-software`: Critério de pronto | Já (auditor) / Depois (engenheiro) |
| Remover pacote, rota e script sem uso antes de publicar | **Sk**, bloco S | Depois |

**Brasil:** sem lei específica. É boa prática (OWASP Top 10 2025, A03, já citado pelo auditor).

### G3. O que vai ser publicado expõe demais? (B 20, 23; A 16)
| Regra | Onde entra | Prioridade |
|---|---|---|
| Na pasta ou no pacote publicado não pode haver `.env`, `.git`, dumps, backups nem `.map` | **Ag** `auditor-seguranca`: Método passo 2 | Já |
| Erro mostrado ao usuário é genérico, com código de referência. O detalhe vai só para o log | **Ag** `engenheiro-software`: Erros conhecidos | Depois |
| Inventário dos serviços de terceiros que recebem dados (análise de uso, IA, e-mail, rastreio de erro) | **Ag** `especialista-lgpd`: Responsabilidades (inventário) | Depois |

**Painel interno:** os pontos equivalentes no Power BI são "Publicar na web" (já citado pelo auditor), link de
compartilhamento "qualquer pessoa da organização", exportação de dados detalhados e RLS desligada.

### G4. Logs sem segredo e rastreáveis (B 08)
| Regra | Onde entra | Prioridade |
|---|---|---|
| Log sem senha, token nem dado pessoal desnecessário: registrar o ID, não o perfil | **Ag** `engenheiro-software`: Erros conhecidos (casa com a referência Stripe de linha canônica) | Depois |

**Brasil:** o Marco Civil (art. 15) obriga provedor de aplicação com fins econômicos a guardar registros de acesso por
6 meses. https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
Conferido em 2026-11-01: o art. 15 vale para o provedor pessoa jurídica que exerce a atividade "de forma organizada,
profissional e com fins econômicos"; guarda sob sigilo, por 6 meses.
**Painel interno:** [HIPÓTESE] ferramenta interna, que não é oferecida ao público, não é "provedor de aplicações de
internet" para esse artigo (a lei não trata do caso; é interpretação). Confirmar com o jurídico.

### G5. Controle de acesso e app web (B 01, 03, 05, 06, 07, 09, 10, 12–19; B2)
| Regra | Onde entra | Prioridade |
|---|---|---|
| Checar identidade e permissão no servidor em toda requisição. Nunca confiar em ID, papel ou preço vindo do navegador. Validar entrada no servidor. Usar consulta parametrizada. Senha com hash lento. Limite de requisições. Cookies, CORS, CSRF e cabeçalhos. Uploads. Pagamento só por webhook assinado. SSRF | **Sk**, bloco "S-web", condicional ("tem servidor próprio com login?"). **Ag** `engenheiro-software`: um passo do Método que manda rodar o bloco quando o código tem login ou recebe entrada de fora | Depois |
| Testar "usuário A não vê dado do usuário B" com dois usuários de teste | **Ag** `auditor-seguranca` e **Ag** `revisor` (já testam bordas); vale também para RLS do Power BI ("ver como" papel) | Já (como item do bloco S) |

**Painel interno:** no Power BI, o serviço cuida de login, cookies, CORS e CSRF. Cabe RLS testada com dois papéis,
workspace sem acesso amplo e conta de serviço com o mínimo de permissão.

### G6. Privacidade e LGPD (A 01, 03, 04, 07–09, 11–15, 17, 18; B6)
| Regra | Adaptação ao Brasil (fonte) | Onde entra | Prioridade |
|---|---|---|---|
| Aviso de privacidade escrito a partir dos fluxos reais e comparado linha a linha com eles. Tem versão e data | LGPD art. 6º, VI (transparência) e art. 9º (informações ao titular) | **Ag** `especialista-lgpd`: Erros conhecidos ("aviso copiado de modelo que não bate com o fluxo") | Depois |
| Política de privacidade se dá "ciência". Não se "aceita" como consentimento geral | LGPD art. 8º, §4º: consentimento genérico é nulo | **Ag** `especialista-lgpd`: Erros conhecidos | Depois |
| Consentimento de marketing separado, desmarcado e revogável | LGPD art. 8º, §5º (revogação) e art. 18, §2º (oposição) | **Ag** `estrategista-marketing`: Critério de pronto | Depois |
| Pedido do titular (acesso, correção, eliminação, portabilidade), com identidade conferida e registro | LGPD art. 19 (confirmação e acesso: simplificada imediata ou declaração completa em até 15 dias) e art. 18, §§ 3º a 5º (os demais pedidos: providência imediata ou resposta com o motivo). Conferido em 2026-11-01: o prazo de 15 dias é só da confirmação e do acesso | **Ag** `especialista-lgpd`: Responsabilidades | Depois |
| Tabela de guarda por categoria, contando backups e ferramentas de terceiros | LGPD art. 15 e 16 (término e eliminação) | Já está em parte (Google). Acrescentar "inclui backups e ferramentas de terceiros" | Depois |
| Contrato com cada operador, controle de suboperadores e transferência internacional | LGPD art. 39 (operador segue instruções) e art. 33 a 36. Resolução CD/ANPD 19/2024 (regulamento de transferência internacional; cláusulas-padrão no Anexo II; 12 meses da publicação para incorporá-las), conferida em 2026-11-01: https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024 | **Ag** `especialista-lgpd` com `advogado-contratos` (a cláusula de dados já é do LGPD) | Depois |
| Treinar IA com dado de usuário é finalidade nova: exige base legal e aviso antes, e não vale para dado antigo sem novo aviso | LGPD art. 6º, I (finalidade) e art. 7º. Conferido em 2026-11-01: medida preventiva da ANPD contra a Meta, 02/07/2024 (legítimo interesse inadequado em análise preliminar, falta de transparência, o titular não esperava que o conteúdo antigo treinasse IA), https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-determina-suspensao-cautelar-do-tratamento-de-dados-pessoais-para-treinamento-da-ia-da-meta | **Ag** `especialista-lgpd`: Erros conhecidos | Depois |
| Cookies e rastreadores só depois da escolha, quando a base for consentimento | Guia orientativo da ANPD sobre cookies (out/2022), que é orientação, não resolução. Aberto em 2026-11-01: https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf | **Sk**, bloco P, condicional ("site público com rastreador?") | Depois |
| Dado de criança e adolescente | LGPD art. 14 (melhor interesse; consentimento de um dos pais para criança) e Lei 15.211/2025, o ECA Digital. Aberto em 2026-11-01: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15211.htm. Vigência conferida no texto em 2026-11-01: 17/03/2026 (art. 41-A, redação da Lei 15.352/2026) | **Ag** `especialista-lgpd`: Método passo 3 (criança já é critério de alto risco do RIPD) | Depois |
| Registro do aceite: quem, qual versão, quando, como, sem sobrescrever | MP 2.200-2/2001, art. 10, §2º (outro meio de provar autoria e integridade, se as partes o admitem), https://www.planalto.gov.br/ccivil_03/mpv/antigas_2001/2200-2.htm. Corrigido em 2026-11-01: a Lei 14.063/2020 só rege a assinatura com ente público (art. 2º; o parágrafo único, II, a, exclui a interação entre particulares), https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l14063.htm | **Ag** `advogado-contratos`: Responsabilidades (termos de uso) | Depois |

**Painel interno:** a LGPD vale para dado de empregado. A base costuma ser obrigação legal ou execução de contrato
(art. 7º, II e V), não consentimento (o LGPD já tem esse erro conhecido). Cabem minimização (mostrar agregado, não
pessoa), acesso por papel e prazo de guarda das cópias locais. Não cabem cookie banner, aviso ao público, portal do
titular nem consentimento de marketing.

### G7. Acessibilidade (A 19, 20, 21)
| Regra | Onde entra | Prioridade |
|---|---|---|
| Contraste de 3:1 também para elementos não textuais (barras, bordas de campo, foco), além do 4,5:1 de texto que já existe (WCAG 2.2, 1.4.11) | **Ag** `designer-paineis`: Método passo 5 | Já |
| Contraste conferido em todos os estados: ao passar o mouse, selecionado, desabilitado, erro | **Ag** `designer-paineis`: Método passo 5 | Já |
| Texto alternativo para cada visual que informa (no Power BI, o campo "texto alternativo" de cada visual) e resumo em texto para os gráficos | **Ag** `designer-paineis`: Critério de pronto | Já |
| Ordem de tabulação igual à ordem de leitura. Foco visível. Nada preso | **Ag** `designer-paineis`: Método. **Sk**, bloco A | Já (designer) / Depois (skill) |

**Brasil:**
- A Lei Brasileira de Inclusão (Lei 13.146/2015) exige acessibilidade nos sites de empresas com sede ou
  representação no país (art. 63). https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
- A ABNT NBR 17225:2025 (acessibilidade em conteúdo e aplicações web, alinhada à WCAG 2.2 [conferir]) foi lançada em 11/03/2025.
  Notícia aberta em 2026-11-01: https://teletime.com.br/11/03/2025/abnt-lanca-norma-para-aprimorar-a-acessibilidade-de-sites/.
  Lançamento e data confirmados pelo MDHC (https://www.gov.br/mdh/pt-br/assuntos/noticias/2025/marco/com-apoio-do-governo-federal-nova-norma-tecnica-da-abnt-e-instituida-para-impulsionar-acessibilidade-digital-no-brasil);
  o texto da norma, no site da ABNT (https://www.abnt.org.br), não foi aberto: o alinhamento à WCAG 2.2 fica [conferir].
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

**Painel interno:** [HIPÓTESE] o art. 63 fala de sítio da internet. Para a ferramenta interna, o dever vem do
ambiente de trabalho acessível (LBI art. 34). Confirmar com o jurídico. Entra como boa prática de qualquer jeito.
Conferido em 2026-11-01: art. 63 (sítios mantidos por empresa com sede ou representação no país) e art. 34, §1º (a
pessoa jurídica é obrigada a garantir ambiente de trabalho acessível e inclusivo); a hipótese é só se o painel interno
cabe num ou noutro.

### G8. Honestidade do que se afirma (A 27–32; B "relatório")
| Regra | Onde entra | Prioridade |
|---|---|---|
| Toda alegação objetiva (seguro, certificado, "100%", resultado, "com IA") tem evidência datada antes de publicar. Sem evidência, sai ou é reescrita | **Ag** `estrategista-marketing`: Critério de pronto e Erros conhecidos. **Ag** `analista-compliance`: Erros conhecidos ("selo ou certificação sem relatório vigente e escopo") | Depois |
| Painel não promete o que não controla: "atualizado em <data e hora>" vem da carga real. Nada de "dados diários" fixo no texto | **Ag** `designer-paineis`: Critério de pronto (é a versão BI do item "disponibilidade realista") | Já |
| Depoimento ou avaliação só com origem real, com incentivo declarado | **Ag** `estrategista-marketing`: Erros conhecidos | Depois |
| Logo de cliente só com permissão escrita | **Ag** `advogado-contratos`: lista de risco do passo 2 ("uso de marca e publicidade") | Depois |
| Rotular conteúdo gerado por IA | **Ag** `redator` e `designer-documentos`, se o usuário quiser uma política | Depois, por decisão do usuário (D-4) |

**Brasil:**
- CDC: art. 6º, III (informação clara), art. 30 (a oferta vincula), art. 36 (publicidade identificável) e art. 37
  (publicidade enganosa ou abusiva). https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- Código do CONAR (autorregulamentação): https://www.conar.org.br/
- Marca alheia: Lei 9.279/1996 (art. 129 e art. 195, concorrência desleal). https://www.planalto.gov.br/ccivil_03/leis/l9279.htm
- Rotular IA: não há lei geral no Brasil [HIPÓTESE: ausência não se prova por busca]. O PL 2338/2023 tramita
  (conferido em 2026-11-01): aprovado no Senado em 10/12/2024, remetido à Câmara em 17/03/2025, aguarda parecer do
  relator na comissão especial. https://www25.senado.leg.br/web/atividade/materias/-/materia/157233 e
  https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262
- **Painel interno:** o CDC não se aplica (empregado não é consumidor). A honestidade sobre atualização e cobertura
  dos dados cabe mesmo assim.

### G9. Licenças e propriedade intelectual (A 33, 34)
| Regra | Onde entra | Prioridade |
|---|---|---|
| Conteúdo de terceiro sem licença (PDF, imagem, prompt): usar só as ideias, com as nossas palavras, e citar a fonte. Nada copiado para o repositório público | **Ag** `pesquisador`: Erros conhecidos. **Sk** `ultimate`, `regras-gerais.md`. É a lição desta tarefa | Já |
| Fonte, ícone e imagem com licença que cubra o uso (embutir no relatório ou no PDF, uso comercial) | **Ag** `designer-paineis` e `designer-documentos`: Critério de pronto | Depois |
| Inventário de licenças das dependências e avisos exigidos (MIT, Apache NOTICE). Copyleft vai para revisão | **Ag** `engenheiro-software`: Critério de pronto | Depois |

**Brasil:** Lei 9.610/1998 (direito autoral, link acima) e Lei 9.609/1998 (programa de computador),
https://www.planalto.gov.br/ccivil_03/leis/l9609.htm

### G10. Venda ao consumidor (A 05, 06, 22–26)
| Regra | Adaptação ao Brasil | Onde entra | Prioridade |
|---|---|---|---|
| Arrependimento e reembolso | CDC art. 49: 7 dias na compra fora do estabelecimento. Decreto 7.962/2013, art. 5º: arrependimento pela mesma ferramenta da compra. https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm | **Sk**, bloco "C-venda", condicional | Fora por ora |
| Identificação do vendedor no site (nome, CNPJ, endereço, contato) | Decreto 7.962/2013, art. 2º | idem | Fora por ora |
| Preço total sem taxa escondida | Decreto 7.962/2013, art. 2º, e Lei 10.962/2004 (exibição de preço), https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10.962.htm | idem | Fora por ora |
| Cancelar tão fácil quanto assinar. Renovação automática informada | Decreto 11.034/2022 (SAC: cancelamento pelo canal), https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/decreto/d11034.htm. [HIPÓTESE] não há regra geral brasileira de renovação automática; vale o CDC (art. 6º, III, e art. 39) | idem | Fora por ora |
| Padrões enganosos (urgência falsa, caixa já marcada, recusa escondida) | CDC art. 37 e art. 39. LGPD art. 8º (consentimento livre) | **Ag** `designer-paineis` não precisa. **Ag** `estrategista-marketing`: Erros conhecidos | Depois (só marketing) |

**Painel interno:** nada deste grupo se aplica.

### G11. Fechamento antes de publicar (A, "Final review"; B 26, 27; manutenção)
| Regra | Onde entra | Prioridade |
|---|---|---|
| Repetir as verificações na versão final publicada, não só na de desenvolvimento | **Sk**: último passo | Já |
| Relatório com cada item como Passou, Corrigido e retestado, Aberto (com próximo passo), Não se aplica (com motivo) ou Só o usuário faz | **Sk**: formato da entrega | Já |
| Teste enfraquecido ou apagado para passar é defeito. Item crítico marcado "não se aplica" sem motivo também é | **Ag** `revisor`: Erros conhecidos | Já |
| Mexeu em X, rode os itens Y (login, dado pessoal novo, pacote novo, chave nova, publicação) | **Sk** `rodada`: uma linha no passo 2 (contrato), apontando para a skill nova | Depois |
| Cartão de incidente: guardar evidência, trocar chaves, encerrar sessões, investigar, corrigir com teste, comunicar | Já está no `especialista-lgpd` (ANPD em 3 dias úteis). **Sk**: só um apontador | Depois |

### G12. Fora do plugin
| Item | Motivo |
|---|---|
| Registro de agente DMCA (A 35) | Só nos EUA. No Brasil, a remoção de conteúdo segue o Marco Civil (art. 19 e 21), sem cadastro de agente; quem hospeda conteúdo de usuário pergunta ao advogado |
| Lojas de apps (Apple, Google Play), CCPA, CalOPPA, Global Privacy Control, Do Not Track, Impressum alemão, botão europeu de retirada | Regras de mercados específicos fora do nosso uso; o agente cita quando o projeto vender lá |
| Lista pública de suboperadores (A 18) | Só para quem vende SaaS a empresas como operador; no máximo uma linha no LGPD |
| SOC 2 especificamente (A 29) | Generalizado em G8 como "selo ou certificação sem relatório vigente" |
| SPF, DKIM e DMARC (B7) | É da TI da empresa, não do projeto; cabe no app que manda e-mail com domínio próprio |
| Os 36 prompts e o app de exemplo do PDF B | Direito autoral (seção 1); escrevemos checagens próprias |

## 4. Prioridade

### Entra já (barato e de alto valor)
| # | Mudança | Arquivo | Custo | Por que agora |
|---|---|---|---|---|
| J-1 | Uma linha no protocolo: "Segredo se refere pelo nome, nunca pelo valor (não peça, não cole, não imprima). Pacote novo só depois de conferir no registro oficial que existe e é o conhecido." | `fonte/comum.md` + `node scripts/gerar-agentes.js` | 1 linha; o validador já confere que o protocolo é igual em todos | Vale para os 30 agentes e fecha a lacuna 2 |
| J-2 | Trava do conteúdo do commit, só com padrões de alta confiança (chave privada, chave de nuvem, token do GitHub, chave de IA, texto de conexão com senha). Bloqueia com o motivo; erro interno não bloqueia (regra atual da trava) | `hooks/travas.js` + casos em `scripts/testar-hooks.js` (um que bloqueia, um falso positivo que passa) | ~25 linhas | Fecha a lacuna 1; a trava hoje só olha o nome do arquivo |
| J-3 | O revisor trata teste enfraquecido ou apagado, e item crítico como "não se aplica" sem motivo, como achado Alto | `fonte/agentes/nucleo/revisor.md` (Erros conhecidos) + 1 caso em `evals/revisor.md` | 2 linhas | Fecha a lacuna 3; o PDF B mostra que é o atalho comum de quem "corrige" |
| J-4 | O auditor ganha: histórico com todas as branches; arquivos expostos no que vai ser publicado; auditoria de dependências; rotação na ordem certa; uma seção "não deu para verificar" | `fonte/agentes/software/auditor-seguranca.md` (Método e Erros conhecidos) + 1 caso em `evals/` | ~6 linhas (o agente tem ~69 de 90) | Maior ganho de segurança com menor texto |
| J-5 | O designer de painéis ganha: contraste de 3:1 para não texto e em todos os estados; texto alternativo e resumo dos visuais; ordem de tabulação; "atualizado em" vindo da carga real | `fonte/agentes/bi/designer-paineis.md` (Método e Critério de pronto) | ~4 linhas (as 5 referências ficam; a NBR 17225 entra no método, não nas referências) | É o uso principal do plugin e quase não custa |
| J-6 | Regra de conteúdo de terceiro sem licença: só as ideias, com as nossas palavras e a fonte citada | `fonte/agentes/nucleo/pesquisador.md` (Erros conhecidos) + `skills/ultimate/regras-gerais.md` | 2 linhas | Lição direta desta tarefa; o plugin é público |
| J-7 | Skill `/checklist-lancamento`, versão 1, enxuta. (1) Perfil do que vai sair: público ou interno; dado pessoal; login próprio; IA; upload; repositório público; cobrança. (2) Só os blocos que cabem: S (segredos, acesso, dependências, exposição, MFA e limite de gasto), P (LGPD), A (acessibilidade), H (honestidade), L (licenças). (3) Cada item com "como verificar o comportamento", dono e status. (4) Relatório no formato de G11. (5) Repetir na versão final. Sem os blocos S-web e C-venda | `skills/checklist-lancamento/SKILL.md` + linha no README | 1 arquivo de ~80 linhas; o validador já cobra o cabeçalho | Junta tudo num lugar só e é a ideia do usuário; os blocos condicionais ficam para depois |

### Entra depois
| # | Mudança | Quando |
|---|---|---|
| D-a | `especialista-lgpd`: aviso comparado com o fluxo real; ciência × consentimento; pedidos do titular com os prazos do art. 19; guarda com backups; operador, suboperador e transferência; treino de IA; crianças e ECA Digital | Depois de conferir cada artigo e resolução no texto oficial (conferidos em 2026-11-01; ficam [HIPÓTESE] só as interpretações para ferramenta interna e a ausência de lei sobre rótulo de IA) |
| D-b | `advogado-contratos`: termos de uso, registro do aceite, nível de serviço medível, uso de marca e publicidade, licenças | Junto com D-a (o LGPD e o contratos se tocam) |
| D-c | `estrategista-marketing` e `analista-compliance`: alegação com evidência datada, avaliações, consentimento de marketing, padrões enganosos, selos | Quando houver projeto de marketing ou site público |
| D-d | Bloco "S-web" da skill e passo no `engenheiro-software` (servidor checa identidade, IDOR, validação, consulta parametrizada, CORS, CSRF, cookies, uploads, pagamento, SSRF, IA) | Quando o plugin for usado para app web com servidor próprio |
| D-e | Validador: aviso quando `fonte/` citar "Lei nº", "Decreto" ou "Resolução" sem link oficial (planalto.gov.br ou gov.br) na mesma linha ou na seguinte | Depois da J-7; o padrão já é regra do método nos agentes regulados |
| D-f | Validador: todo item da skill de lançamento tem "Verificar:" e, se citar lei, o link | Junto com a D-e |
| D-g | `rodada`: "mexeu em X, rode os itens Y" | Depois da J-7 estar em uso |
| D-h | `pacotes.json`: palavras "go-live", "antes de publicar", "checklist de lancamento" levando a Software e Jurídico. Hoje "lancamento" cai em Marketing | Com a J-7, para o roteador achar a skill |
| D-i | `engenheiro-dados`: backup que se restaura de verdade (teste de restauração) | Quando houver carga com banco próprio |

### Fica fora
Tudo da seção 3, G12, e o grupo G10 (venda ao consumidor) até aparecer projeto que vende ao consumidor. Quando
aparecer, o bloco "C-venda" entra na skill com as fontes brasileiras da tabela G10.

## 5. Decisões do usuário

| # | Decisão | Opções | Recomendação e porquê | Risco · perda · volta atrás |
|---|---|---|---|---|
| D-1 | De onde vieram os PDFs (site ou autor)? | (a) informar a origem; (b) citar como "autoria não identificada" | (a): sem a origem não dá para citar direito nem saber se há termos de uso fora do arquivo | Baixo · nenhuma · sim |
| D-2 | A trava do conteúdo (J-2) bloqueia ou só pergunta? | (a) bloquear; (b) perguntar ("ask"); (c) só avisar | (a), só com padrões de alta confiança: segredo no git é irreversível; o falso positivo se resolve trocando o padrão | Falso positivo trava um commit · minutos · sim |
| D-3 | O `git push` passa a lembrar "rodou /checklist-lancamento?" | (a) sim, na mensagem da confirmação que já existe; (b) não | (a): custo zero; a trava já pergunta | Ruído em push de rotina · nenhuma · sim |
| D-4 | Política de rotular conteúdo feito com IA nas entregas a terceiros | (a) rótulo sempre; (b) só quando a pessoa puder ser enganada; (c) sem política | (b), alinhado ao PDF A e sem obrigação legal no Brasil hoje [HIPÓTESE] | Exposição se a lei mudar · pouca · sim |
| D-5 | Mudança no protocolo comum (J-1) | (a) aprovar; (b) só no auditor e no engenheiro | (a): uma linha e vale para todos; o curador registra no changelog | Protocolo maior · 1 linha · sim |

## 6. Áreas que precisam opinar antes de aplicar
- `especialista-lgpd` e `advogado-contratos`: conferir os artigos e as [HIPÓTESE] das seções G6, G8 e G10 antes da D-a e da D-b.
- `auditor-seguranca`: a lista de padrões da J-2 (alta confiança, poucos falsos positivos).
- `designer-paineis`: como pôr a J-5 no Power BI (texto alternativo, ordem de tabulação, "atualizado em").
- `curador`: registrar as mudanças aprovadas no `CHANGELOG-AGENTES.md` e subir a versão do plugin.

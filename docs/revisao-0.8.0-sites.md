# Revisão independente da 0.8.0, lote sites-premium

**Pode juntar: NÃO.** Há 2 achados Altos abertos:

- **A-1:** o roteador manda pedido de site ao `designer-paineis`, chama o `designer-sites` para assuntos que não são de
  design e perdeu pedidos que antes eram reconhecidos.
- **A-2:** o teclado falha na página de prova, e nem o script nem o critério de pronto do agente checam isso.

As correções são pequenas. O agente, a biblioteca e a decisão do vidro estão no caminho certo.

- Revisor: `revisor` (2026-11-02, 3h05 a 4h). Autor: `engenheiro-software`.
- Escopo: ramo `lote-sites`, 9974b28 (base) até d6f1ad6, 8 commits (a41feb9 a d6f1ad6).
- Tudo rodou em cópias `git archive`. Nesta pasta só este relatório foi criado.
- Bateria inteira 1 vez. Um Edge por vez.

## Conferência do que o autor disse

| O autor disse | Eu vi | Resultado |
|---|---|---|
| `testar-hooks.js` 431 ok | 431 ok, 0 falha, 5 min 40 s | confere |
| `validar.js` 0 erro | 31 agentes, 19 pacotes, 11 skills, 0 erro, 0 aviso | confere |
| `testar-sites.js` 48 ok | 48 casos, 0 falha | confere, mas as checagens têm pontos cegos (A-1, M-5) |
| 11 de 11 mutantes | `provar.js site` de novo: 11/11, 4 capturas sem problema, 128 s | confere |
| 39 efeitos na bancada | `provar.js efeitos` de novo: **36 de 39** | **não se repete** (M-1) |
| contraste 0 falha | 0 falha nas capturas, em transparência reduzida e em mais contraste | confere para texto; o anel de foco não é medido (A-2) |

## Achados

| Id | Gravidade | Achado | Dono |
|---|---|---|---|
| A-1 | Alto | Roteador: site no agente errado, assunto alheio no `designer-sites`, 8 pedidos perdidos, teste cego às referências | `engenheiro-software` |
| A-2 | Alto | Teclado: foco sob a barra, anel de foco invisível, menu do celular não fecha; nada disso é checado | `engenheiro-software` |
| M-1 | Médio | "39 de 39 PROVADO" não se repete: comparação byte a byte reprova A1, B1 e B3 ao acaso | `engenheiro-software` |
| M-2 | Médio | Direitos: o bloco "Por que é pago?" segue de perto o argumento e a ordem do Dinzo, e há outros paralelos | `engenheiro-software` |
| M-3 | Médio | Vidro: 4 trechos ainda contradizem a decisão do usuário, a começar pelo efeito A1 | `engenheiro-software` |
| M-4 | Médio | O ponto "dia 22, maré baixa" fica solto da curva: 9 px na cena inicial, 28 px na terceira | `engenheiro-software` |
| M-5 | Médio | Checagens cegas: 4 mutantes meus passaram na prova da página e 2 passaram nos casos de texto | `engenheiro-software` |
| M-6 | Médio | Logo acima de 900 px, a seção de preços quebra: 43 px de rolagem lateral em 905 px e garantia com 57 px de largura | `engenheiro-software` |
| b-1 | Baixo | Acabamento: espaço morto em Perguntas e no bloco final; a segunda metade da página fica genérica | `designer-sites` |
| b-2 | Baixo | Quadro de provas: "sem animação" em efeito animado; "49,9 e 16,8 ms" fixos no texto gerado | `engenheiro-software` |
| b-3 | Baixo | Sobras: `polimento.md` sem caminho no agente; `checklist-lancamento` ainda aponta só para `designer-paineis` | `engenheiro-software` |
| b-4 | Baixo | Sem sinônimos: "website", "homepage", "página inicial" e "lp de vendas" não são reconhecidos | `engenheiro-software` |
| b-5 | Baixo | Referência da NNG: "a ação" no topo não está no artigo, e o estudo é de 2018, sem data no agente | `engenheiro-software` |
| b-6 | Baixo | 4 efeitos sem "Técnica": F2, F4, F7 e F8 | `engenheiro-software` |
| b-7 | Baixo | Fluxo da página: "Testar o Solo" e "Testar o Casa" levam às perguntas; `aria-label` em `<p>`; pausa muda nome e estado | `engenheiro-software` |

### A-1 · Roteador (`hooks/roteador.js` real, 98 pedidos, antes em 9974b28 × agora)

Os casos pedidos passam no nível de agentes: "landing page" vai ao `designer-sites`; "site" isolado e "dashboard" não
indicam agente. Fora deles, o resultado é este:

| Pedido | Antes | Agora | Problema |
|---|---|---|---|
| "efeito vidro no site", "visual premium para o site" | `designer-paineis` | `designer-paineis` | site no agente errado; no vidro, aplica a regra de produto |
| "html e css do site", "crie o frontend do meu site em react" | `designer-paineis` | `designer-paineis` | idem |
| "crie uma página web de contato" | `designer-paineis` | `designer-paineis` | "pagina web" ficou no pacote `interface` |
| "confira o preço no site do produto", "abra o novo site do governo" | nenhum | `designer-sites` + engenheiro + revisor | falso positivo novo ("site do produto", "novo site") |
| "o site de vendas caiu", "erro no novo site da empresa" | nenhum | `designer-sites` + engenheiro + revisor | falso positivo novo ("site de vendas", "novo site") |
| "melhore a ux do site", "a interface do meu site está confusa", "redesign do site", "site com animação", "site responsivo com tailwind", "formulário de contato do site", "componente do meu site", "animacao no site" | `designer-paineis` + engenheiro + revisor | nenhum | **perda do pacote `interface`**: "site" somava 1 ponto lá e agora fica noutro pacote |
| "crie um site com dashboard de vendas", "desenhe o site do painel de BI" | nenhum; BI | `designer-sites` | painel dentro de site cai só no designer de sites; decidir se é o certo |

**Referências, que o caso do autor não olha:**
- "o site da receita federal saiu do ar hoje" entrega `metodo.md` (para `designer-paineis`) e `sites-premium/INDICE.md`
  (para `designer-sites`).
- O mesmo vale para "preciso de um site", "site para minha clínica", "melhore o visual do meu site" e "publique o site".
- Em "dashboard de vendas do meu site", a biblioteca de sites vai junto com o pedido de painel.
- "landing" sozinho puxa a biblioteca, até em "o avião fez um landing de emergência".

**Causas:**
- A pontuação é por pacote, e a palavra "site" saiu de `interface` sem expressões que a substituam ("ux do site",
  "interface do site").
- Expressões de 2 pontos como "novo site", "site do produto" e "site de vendas" não dizem que o pedido é de criação.
- Sem agente indicado, o `alvo` em `referenciasDoPedido` é o primeiro da lista, e em `metodo.md` esse é o `designer-paineis`.
- O caso `"site" sozinho não puxa o designer de sites` lê só a linha "Agentes indicados".

**Correção pedida:**
- Tirar as expressões que não indicam criação.
- Levar "pagina web" e as combinações com site para o pacote certo.
- Sem pacote de design indicado, não entregar referência de design a designer nenhum, ou só quando houver verbo de criação.
- Acrescentar os casos da tabela, com as referências, à bateria.

### A-2 · Teclado na página de prova (Tab e Shift+Tab reais, pelo protocolo do Edge)

O fluxo principal funciona: pular para o conteúdo, navegação, herói, Pausar com Espaço, rádio do preço com seta, pergunta
com Enter, rodapé. A ordem de Tab está certa. Os defeitos são:

1. **Foco sob a barra fixa, ao voltar com Shift+Tab (1440 px, barra termina em 65 px).** "Preciso cadastrar tudo à mão?"
   fica em 0–56 px, inteira atrás da barra. "O Preamar pode mexer…", "Testar o Casa" e "Testar o Solo" ficam com o centro
   coberto. Isso fere a WCAG 2.4.11 e a própria receita R16. Só os `h2` têm `scroll-margin-top`; falta
   `html { scroll-padding-top }`.
2. **Anel de foco invisível no bloco final.** A razão entre anel e fundo é **1,33** no claro e **1,23** no escuro; a
   receita F1 pede 3:1. `.fim` não redefine `--acento-forte`, como `.mar-calmo` faz.
3. **Menu do celular (390 px).** Depois de seguir um link, o menu continua aberto e cobre o título da seção. Esc também
   não fecha. Print em que aparece: menu de 58–296 px sobre o título "Um mês inteiro…", em 88–123 px.

**Por que é Alto, mesmo em página fictícia:**
- O `provar.js` só testa o foco no "pular". O mutante "foco invisível em toda a página" passou. O botão de pausa com
  `display:none` também passou, porque o teste clica por JS.
- O quadro de provas diz que teclado está "na página de prova".
- O Método (passo 6) e o Critério de pronto de `fonte/agentes/design/designer-sites.md` não têm teclado. Ele só aparece em
  Responsabilidades e em `metodo-de-montagem.md`.
- Sem essa checagem, cada site real repete os mesmos defeitos.

**Correção pedida:**
- Corrigir os 3 defeitos.
- Pôr teclado no passo 6 e no critério de pronto.
- Criar checagem com Tab e Shift+Tab, foco fora da barra, razão do anel e pausa visível, cada uma vista falhando em mutante.

### M-1 · 39 de 39 não se repete

Na minha rodada, A1 (vidro), B1 e B3 saíram **não provados**. Regenerado, o quadro marca os 3 como [ESTIMATIVA].

**Causa, provada numa sonda:** em movimento reduzido, 2 fotos seguidas do mesmo gradiente estático diferem em até 2 ou 3
níveis de 255. Isso aconteceu em 2 ou 3 de 6 tentativas. A comparação é `f1.equals(f2)`, byte a byte. B4 e A4, sem
gradiente grande, deram 6 de 6 iguais.

Não é defeito do efeito; é a medida. A situação de cada efeito muda ao acaso a cada rodada, e o `testar-sites.js` passa
nos dois casos.

**Correção pedida:** tolerância de 3 níveis por canal, mantendo `rodando === 0`. O que precisa continuar sendo pego já foi
testado: sem o ramo de movimento reduzido, os 6 efeitos que testei reprovam pela contagem de animações.

### M-2 · Direitos

**O que está limpo:**
- Comparei com o HTML público de finmate, usecalen e dinzo, nas capturas. Sequências de 5 ou mais palavras em comum: só 2,
  ambas banais ("até o fim do mês" e "R$ 19,90 por mês").
- Nenhuma imagem de terceiro; página sem recurso externo.
- Paletas sem cor em comum além do branco, fontes diferentes. Na comparação com a captura do Calen, a identidade é outra.
- O registro em `fontes.json` e `CREDITOS.md` está certo.
- As medidas [MEDIDO] que conferi batem com as capturas: largura, H1, H2, altura de página, espaçamento e desfoque de 4 px.

**O que a contagem de palavras não vê:**
- O bloco "Por que é pago?" segue o mesmo argumento, na mesma ordem, do "Por que o Dinzo é pago?": app grátis ganha de
  outro jeito, venda de dados, crédito e anúncio, e a assinatura sustenta. É paráfrase próxima, não só padrão.
- "Perguntas de quem ainda está em dúvida" tem a mesma forma de "Perguntas de quem está chegando" (Dinzo).
- "Veja a maré baixa… antes de ela chegar" com "quanto sobra" lembra o título do Calen, que também tem calendário de
  saldo previsto. A metáfora da maré é própria, mas o conjunto pede cuidado.

A regra do lote é "nenhum texto", e o teste só procura nomes.

**Correção pedida:** reescrever esse bloco com outro argumento ou outra objeção. Trocar o título das perguntas. Não copiar
o produto para fugir da semelhança: manter a ideia da maré. Não é parecer jurídico; se houver dúvida na publicação,
perguntar ao `advogado-contratos`.

### M-3 · Vidro

A tabela de `apple/materiais.md` e a seção "Cartão de vidro em landing page" **batem com a decisão do usuário**: landing
com cartão, pouca transparência e fundo calmo; produto só com navegação e controles, citando a HIG. A página usa 82% sobre
fundo calmo. A regra da Apple foi conferida na fonte. Mas estes trechos ainda dizem outra coisa:

1. `efeitos/superficie-e-fundos.md`, A1: "Desfoque e translucidez sobre **fundo variado**". É o oposto da decisão, e é o
   que o agente lê ao escolher o efeito.
2. `materiais.md`: "Não serve em landing: sobre foto ou vídeo **sem o véu**" dá a entender que com o véu serve, e a regra
   diz "sem foto".
3. `materiais.md`: `.vidro` "barra ou cartão FLUTUANTE" a 55%, sem dizer que não é para cartão de landing. E "Superfície
   tonal" com branco a 3–10% é o contrário de pouca transparência, mesmo com a ressalva.
4. `materiais.md`: "se o vidro não separa controle de conteúdo, tire" está sem ressalva para landing, e o piso de
   qualidade aponta para lá.

Menor: a bancada de A1 mostra o cartão sobre gradiente colorido, não sobre fundo calmo. O cartão `b-a` da página traz uma
lista com valores, perto do "tabela" que a regra recusa.

### M-4 · A curva, que é a ideia da página

O ponto vermelho do dia 22 está numa posição fixa. Com a cena inicial, fica 9 px abaixo da curva (1440 px). Em "Antecipar o
freela", são 28 px, com o rótulo "maré baixa" longe do mínimo. O ponto do dia 5 também não fica no topo da curva. A página
vive dessa curva: o ponto deveria estar nela e acompanhar cada cena. Nenhum script vê isso, porque as capturas param na
cena inicial.

### M-5 · O que as checagens não veem (mutantes meus)

Placar total: **pegou 9 de 15**.

| Mutante | Resultado |
|---|---|
| Página: h1 claro demais (controle) | pegou |
| Página: foco invisível; pausa com `display:none` | escapou (ver A-2) |
| Página: vidro sem desfoque a 45%, defeito citado em `materiais.md` | escapou |
| Página: nome longo na cena 3 | escapou (a prova só olha a cena 0) |
| Bancada: sem o ramo de movimento reduzido, em B2, A5, A6, E3, F8 e A3 | 6 de 6 pegos |
| Lote: "site" de volta em `interface`; tirar `designer-sites` de `metodo.md` | 2 de 2 pegos |
| Lote: cartão de landing a 30%; regra trocada para "foto, vídeo ou gradiente em movimento" | escaparam (o teste só procura as palavras "fundo calmo") |

Um 7º mutante meu (tirar a WCAG 2.2.2 só de `fonte/`) foi descartado por ser inválido: não regenerei `agents/`.

### M-6 · Largura logo acima do limite de 900 px

O autor só mediu 390 e 1440 px. Testei os dois lados do limite do layout de celular:

| Largura | Rolagem lateral | Coluna da garantia |
|---|---|---|
| 768 px | 0 | 728 px, normal |
| 905 px | **43 px** | **57 px de largura e 354 px de altura** (17 px para o texto) |
| 960 px | 0 | 112 px e 325 px de altura |
| 1024 px | 0 | 176 px, 6 linhas |
| 1100 px | 0 | 252 px |
| 1920 px | 0 | 440 px, normal |

**Causa:** `.planos` usa `repeat(2, minmax(0, 380px)) minmax(0, 1fr)`, com `.garantia` e 40 px de recuo. Os 2 planos crescem
até 380 px e sobra quase nada para a 3ª coluna. O limite de 900 px só empilha abaixo disso.

**Correção pedida:** levar a garantia para baixo dos planos até ~1200 px. Incluir na prova uma largura logo depois do limite
(901–910 px), além de 768 e 1920, que o agente já exige.

## O que está bom

**Agente `designer-sites`:** padrão completo.
- As 5 fontes foram abertas e a prática existe:
  - Stripe: `transform` e `opacity`, "under 500 milliseconds" na maioria dos casos, reduced motion, metáfora.
  - NNG: 57% e 74%, em rastreio ocular.
  - web.dev: 2,5 s, 200 ms e 0,1, no percentil 75.
  - HIG: "Don't use Liquid Glass in the content layer".
  - WCAG 2.2.2: mais de 5 s, em paralelo.
- A separação do `designer-paineis` está clara nos dois lados.
- Os 10 evals são coerentes com o agente e com a decisão do vidro. Só o caso 4 foi rodado, e à mão; o histórico diz isso.

**Biblioteca:**
- Amostrei as receitas R2, R7, R11, R16 e R24, mais R3, R12 e R22, e os efeitos A2, C1, D1, E1 e F5. Dá para aplicar só com o texto.
- É repertório: nenhuma ordem obrigatória, sequências como ponto de partida.
- Medidas não provadas estão como [ESTIMATIVA], pela frase de cada receita e do catálogo.

**Nada da empresa do usuário** nos arquivos do lote: as ocorrências em `scripts/testar-hooks.js` são casos antigos, e não são do lote.
**`windowsHide`** nas 2 chamadas novas, `spawn` do Edge e `spawnSync` do teste, e o `validar.js` passa.

**Pacote `interface`:** só perdeu as 3 palavras previstas. O que se perdeu é o efeito delas (A-1).

## Olho crítico: parece premium?

**Parece próprio, não genérico, até a metade.**
- A dobra em 1440 px é boa: serifa de almanaque, tábua com dados coerentes, curva atravessando a tela.
- O calendário e o bloco escuro com vidro quase opaco também funcionam. Todos os valores conferem entre si: saldo, parcelas,
  preços anuais, e novembro de 2026 começando no domingo.
- O teste do recorte passa nessa parte.
- Da seção de preços para baixo, vira página de SaaS comum, com espaço morto (b-1).
- Abaixo do premium: M-4 e o que está em A-2.

Abri os 8 PNGs do autor, inclusive os 2 que ele não abriu (movimento reduzido e sem JS, ambos corretos). Abri também os
meus, em 320, 768, 1024 e 1920 px. Em 1100 px só medi. A rolagem lateral foi 0 nessas larguras; a exceção está em M-6.

## Para o usuário provar (depois das correções)

1. Abra `docs/provas/0.8.0-sites/site-preamar.html` em tela cheia e diga se a dobra parece premium e própria.
2. No celular ou em janela estreita, abra o Menu e toque num link: o menu deve fechar e o título deve aparecer inteiro.
3. Com o teclado, vá até o fim com Tab e volte com Shift+Tab: o foco deve ficar sempre visível, inclusive no botão vermelho final.
4. Troque de cena no herói: o ponto vermelho deve acompanhar a curva.
5. Peça "crie um site premium para a minha clínica", "efeito vidro no meu site" e "o site de vendas caiu": os 2 primeiros vão ao
   `designer-sites`, o 3º não.

## Limites desta revisão

- Sem aparelho real, sem leitor de tela, e custo de pintura não medido (o autor já declara isso).
- Os evals não foram rodados com o agente.
- Nivora e Code and Chill continuam sem estudo.

Placar: autor=engenheiro-software cod=sem-codigo veredito=não B=0 A=2 M=6 b=7 ids=A-1,A-2,M-1,M-2,M-3,M-4,M-5,M-6,b-1,b-2,b-3,b-4,b-5,b-6,b-7

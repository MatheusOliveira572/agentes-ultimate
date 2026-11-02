<!-- Texto próprio do agentes-ultimate, a partir do estudo visual de 2026-11-01 (docs/referencias-visuais-2026-11.md): só padrão e proporção, nada copiado dos sites estudados. -->
<!-- ref: tema=site-metodo-de-montagem; palavras=montar um site, site inteiro, site completo, ordem dos blocos, landing page, uma pagina de vendas, pagina de vendas do meu, pagina de vendas para, pagina de vendas do curso, site premium, teste do recorte; agentes=designer-sites, estrategista-marketing, engenheiro-software -->
<!-- teste-ref: sim=monte o site inteiro do produto com a ordem dos blocos | crie a landing page completa do aplicativo; nao=faça a provisão para devedores duvidosos -->
# Como montar um site inteiro

Repertório, não molde: parta da direção própria do projeto. Nenhuma sequência abaixo é obrigatória.

Isto não substitui `../metodo.md` nem `../tela-nova/INDICE.md`: é o complemento específico de site. As
sequências são **pontos de partida**; a regra é **sair do previsível quando o projeto pedir**.

### Passo 1. Entender
Uma frase para cada item: quem visita, o que acredita ao chegar, que objeção o trava, qual ação se quer, que prova real
existe. Liste o material verdadeiro: telas, números, depoimentos, fotos, autorizações.

### Passo 2. Definir uma identidade própria
1. **A ideia única:** o que ficaria na memória de quem saiu do site? Pode ser um personagem, um ritmo, uma atmosfera, um objeto,
   uma forma de mostrar números, uma estrutura incomum. Tem de vir do produto: se servir para o concorrente, ainda não é.
2. **Três direções diferentes de verdade** (mundo visual, tipo, composição); o usuário escolhe.
3. **Sistema mínimo:** 1 fonte com personalidade ou par com contraste; neutros levemente coloridos; 1 acento, usado com pouca
   frequência; 3 raios; 3 sombras; 1 curva de entrada e 1 de resposta.
4. **Teste do recorte:** tire o logo. A página ainda parece só deste produto? Compare com as 3 referências da área: se a
   composição for igual, troque algo que importa, não só a cor.
5. **Regra de direitos:** nada de combinar paleta + fonte + layout de um site de referência, nem de seguir o argumento e a ordem de um bloco dele com outras palavras: o argumento nasce do produto.

### Passo 3. Escolher e ordenar blocos
Comece pelo que precisa ser dito, depois escolha as receitas. Pontos de partida:

| Tipo | Sequência de partida | Por onde sair do previsível |
|---|---|---|
| SaaS ou app por assinatura | R1 ou R2 → R5 → R6 → R7 → R8 → R10 → R11 → R13 → R14 → R15 | começar pela demonstração sem título grande; mostrar preço já no herói |
| Produto por canal (mensageiro, voz) | R3 → R4 → R9 → R21 → R10 → R12 → R11 → R14 → R15 | deixar a pessoa experimentar a conversa ali mesmo |
| Serviço B2B ou consultoria | herói de tese → R4 → casos → método (R6) → R13 → pessoas → contato | um caso inteiro como página principal |
| Produto físico ou loja | foto em grande → uso → detalhes → R10 → comprar → R14 | uma história contada por rolagem |
| Portfólio ou institucional | peça principal → trabalhos → como pensa → contato | a navegação é o próprio trabalho |
| Página de evento ou captação | promessa + data + ação → programação → pessoas → R4 → ação | contagem real, ou programação como herói |
| Documentação ou produto técnico | exemplo funcionando → instalar → casos → R14 | o código roda na dobra |

**Tamanho:** o estudo foi de 8 a 14 blocos. Pare quando não houver novo argumento: a mais curta cobriu o essencial em 5,9 mil px.

**Uma ideia forte por bloco; um movimento dominante por tela.**

### Passo 4. Compor com material real
Texto real desde o primeiro rascunho (com `redator`). Dados de exemplo plausíveis e marcados. Nada de imagem sem origem
registrada.

### Passo 5. Construir
Tokens primeiro; celular junto, não depois; efeitos por último, depois de a página funcionar sem eles (`efeitos/INDICE.md`).

### Passo 6. Conferir antes de entregar
- [ ] Em 5 s, sem rolar: o que é, para quem, o que fazer. Mostre a alguém, ou leia só a dobra.
- [ ] Ideia própria presente; teste do recorte passa.
- [ ] Toda afirmação, número e depoimento com fonte; nada enganoso (preço, contador, escassez).
- [ ] Contraste calculado para todos os pares, nos piores pontos de fundo e sobre botão com acento.
- [ ] Capturas em 390, 768, 1440 e 1920 px: nada cortado; sem rolagem horizontal; **navegação e botões fixos não cobrem título**.
- [ ] Teclado do início ao fim; foco nunca sob barra; "pular para o conteúdo".
- [ ] `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`, JS desligado: tudo legível e completo.
- [ ] Pause em tudo que mexe sozinho por mais de 5 s (WCAG 2.2.2); nada pisca mais de 3 vezes por segundo (WCAG 2.3.1).
- [ ] Alvos de toque ≥ 44 px, inclusive a ação do cabeçalho; corpo ≥ 16 px no celular; legendas ≥ 12 px.
- [ ] Carga e estabilidade medidas (`<plugin>/conhecimento/engenharia/desempenho-web.md`); imagens com dimensão; fontes sem salto.
- [ ] Título, descrição, imagem de compartilhamento e aviso de privacidade reais; rastreadores só com consentimento (`especialista-lgpd`).
- [ ] Revisão com `../revisao-tela.md`.

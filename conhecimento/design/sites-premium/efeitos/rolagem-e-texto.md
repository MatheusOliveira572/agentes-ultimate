<!-- Texto próprio do agentes-ultimate, a partir do estudo de efeitos de 2026-11-01 (docs/referencias-efeitos-2026-11.md): técnica descrita em palavras, nada copiado. -->
<!-- ref: tema=efeito-rolagem; palavras=entrada ao rolar, parallax, scrollytelling, linha que se desenha, cartoes empilhados, numero que sobe, contador animado, titulo que entra, texto que troca, view transitions; agentes=designer-sites, engenheiro-software -->
<!-- teste-ref: sim=coloque parallax e entrada ao rolar na página | quero um número que sobe e uma linha que se desenha; nao=calcule o custo médio ponderado do estoque -->
# Rolagem, texto e números

Repertório, não lista de compras. Origem: [VISTO] nas referências estudadas, [MERCADO] padrão público. Tempos e medidas são [ESTIMATIVA: ponto de partida nosso], salvo [MEDIDO]; o que a bancada provou está em `provas.md`. Regras comuns: `INDICE.md`.

## C. Rolagem

### C1. Entrada ao rolar [VISTO, MEDIDO]
- **O que é:** o bloco aparece subindo levemente.
- **Técnica:** `IntersectionObserver` adiciona classe; classe faz `opacity` e `translateY`. Cada item uma vez, e então parar de observar. Alternativa só em CSS: `animation-timeline: view()`, mas **não é Baseline** (MDN): use com `@supports`.
- **Medidas:** deslocamento 12–32 px; 0,5–0,7 s; escalonar em 40–80 ms, até 4–6 itens.
- **Onde:** títulos e grupos principais. **Exagera:** em cada parágrafo; rolagem rápida vira espera.
- **Desempenho:** barato.
- **Celular:** deslocamento menor; sem atraso longo.
- **Reduzido:** aparece direto, ou esmaece em 0,2 s.
- **Cuidado:** captura de tela, impressão e busca do navegador têm de ver o texto; dispare o fim ao chegar perto.

### C2. Parallax [VISTO em parte; MERCADO]
- **O que é:** camadas rolam em velocidades diferentes.
- **Técnica:** `transform` por `animation-timeline: scroll()` com `@supports`, ou `requestAnimationFrame` lendo a posição uma vez por quadro.
- **Medidas:** diferença de 10–30%, deslocamento total até 60–120 px.
- **Onde:** imagem de impacto ou mockup. **Exagera:** em texto; deslocamento grande causa enjoo.
- **Desempenho:** nunca ler layout no evento de rolagem sem controle.
- **Celular:** desligado ou mínimo.
- **Reduzido:** nenhum.

### C3. Seção presa com passos (scrollytelling) [MERCADO]
- **O que é:** o visual fica preso e muda conforme o texto rola.
- **Técnica:** `position: sticky` + `IntersectionObserver` por passo.
- **Medidas:** cada passo com 60–100 vh; 3–5 passos.
- **Onde:** um processo explicável. **Exagera:** mais de um por página; rolagem sequestrada.
- **Celular:** vira sequência normal (imagem + texto).
- **Reduzido:** sequência normal.
- **Regra:** nunca alterar a velocidade natural da rolagem.

### C4. Linha que se desenha [VISTO]
- **O que é:** traço aparece seguindo o caminho.
- **Técnica:** `stroke-dasharray` e `stroke-dashoffset` em SVG, com `pathLength="1"`.
- **Medidas:** 0,8–1,4 s uma vez; ou ligado à rolagem.
- **Onde:** passos, gráfico, sublinhado à mão em palavra-chave [VISTO]. **Exagera:** gráfico com dados que demoram para aparecer.
- **Reduzido:** traço completo.

### C5. Transição entre páginas ou seções [MERCADO]
- **O que é:** a peça muda de lugar ou a tela esmaece, com continuidade.
- **Técnica:** View Transitions API, com a navegação normal funcionando sem ela.
- **Medidas:** 0,2–0,4 s; peça compartilhada com o mesmo nome.
- **Onde:** catálogo → detalhe. **Exagera:** cortina ou limpeza de tela a cada troca.
- **Reduzido:** sem deslocamento; suporte conferido na hora de construir.

### C6. Cartões empilhados e revelação por máscara [MERCADO]
- **O que é:** cartões presos que se empilham, ou imagem que se abre por recorte.
- **Técnica:** `position: sticky` com `top` crescente; `clip-path` animado na entrada.
- **Medidas:** 3–6 cartões, 16–32 px de diferença; recorte em 0,6–1 s.
- **Celular:** altura menor que a tela, ou o conteúdo some.
- **Reduzido:** lista comum.

## D. Texto e números

### D1. Número que sobe [MERCADO; VISTO em saldo que entra]
- **O que é:** o valor conta até o final ao entrar na tela.
- **Técnica:** `requestAnimationFrame` com desaceleração, formatação por `Intl.NumberFormat`; largura fixada por `tabular-nums`.
- **Medidas:** 0,8–1,5 s; uma vez; começar perto do final (70–90%) em número grande.
- **Onde:** prova de impacto. **Exagera:** número financeiro em painel (parece instável); muitos juntos.
- **Celular:** igual.
- **Reduzido:** final direto. Leitor de tela lê o final; marque a parte animada com `aria-hidden`.
- **Sem JS:** o HTML já traz o número final.

### D2. Título que entra por palavra ou linha [MERCADO]
- **O que é:** partes sobem de trás de uma máscara.
- **Técnica:** dividir em spans por linha (com `overflow: hidden`) depois de a fonte carregar; manter o texto inteiro acessível.
- **Medidas:** 0,5–0,8 s; 30–60 ms entre partes.
- **Onde:** o título do herói, uma vez. **Exagera:** todos os títulos; palavras em atraso escondem a mensagem na dobra.
- **Reduzido:** título inteiro direto.

### D3. Palavra em destaque [VISTO]
- **O que é:** uma palavra em cor de acento, ou gradiente, ou sublinhada.
- **Técnica:** `span`; se em gradiente, `background-clip: text`, com cor sólida de reserva.
- **Medidas:** 1–3 palavras por título; contraste próprio medido.
- **Onde:** herói. **Exagera:** em todo título; gradiente em palavra virou clichê.
- **Reduzido:** igual.

### D4. Texto que troca ou se digita [MERCADO; VISTO em conversa]
- **O que é:** palavra rotativa ou digitação.
- **Técnica:** alterna em `translateY`/`opacity`; largura reservada para a palavra mais longa.
- **Medidas:** 2–3 s por palavra; 3–5 palavras; digitação 25–50 ms por caractere.
- **Onde:** um lugar, uma vez. **Exagera:** a frase não se lê parada.
- **Reduzido:** primeira palavra fixa; frase inteira legível. Pausa se durar mais de 5 s; `aria-live` desligado.

### D5. Título ligado à rolagem [MERCADO]
- **O que é:** o texto preenche a cor conforme se rola.
- **Técnica:** `background-size` com `background-clip: text`, ou spans. Use `animation-timeline` com reserva.
- **Medidas:** contraste mínimo já no estado inicial.
- **Exagera:** parágrafo que só se lê rolando.
- **Reduzido:** texto completo.

### D6. Gráfico que se desenha [VISTO]
- **O que é:** barras crescem, anel se fecha.
- **Técnica:** `scaleX` ou `scaleY` com origem na base; `stroke-dashoffset`.
- **Medidas:** 0,4–1 s, uma vez, sem esperar a leitura. Em painel, ver a decisão do projeto, quando houver.
- **Reduzido:** valor final.

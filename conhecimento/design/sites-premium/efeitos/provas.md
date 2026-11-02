<!-- Texto próprio do agentes-ultimate. Gerado por docs/provas/0.8.0-sites/provar.js a partir de resultado.json. -->
<!-- ref: tema=efeitos-provados; palavras=prova dos efeitos, efeito provado, quadros do efeito, efeito pesa; agentes=designer-sites, engenheiro-software -->
<!-- teste-ref: sim=este efeito pesa, qual a prova dos efeitos | mostre o efeito provado e os quadros do efeito; nao=calcule o custo médio ponderado do estoque -->
# Efeitos: o que foi provado, com que valor

39 de 39 efeitos passaram na bancada (rodadas seguidas: 38/39, 39/39, 39/39) (`docs/provas/0.8.0-sites/bancada-efeitos.html`; folha de contato em `png/bancada-efeitos.png`).
**Condição:** Edg/156.0.4314.58, sem interface, 390 px, CPU freada 4×; quadros por requestAnimationFrame em 1,5 s. Sem aparelho real.

**PROVADO quer dizer:** nas 2 últimas rodadas seguidas, com o valor da coluna, em código próprio, o efeito apareceu ou mexeu, ficou parado e legível com
`prefers-reduced-motion`, teve pausa quando o catálogo exige, 0 erro de JS e p95 do quadro até 34 ms na condição acima.
**Controles:** carga de 12 ms por quadro (medida sem freio) na linha principal: só passa de 34 ms se a CPU estiver freada: 100.1 ms, pegou; desfoque de 40 px animado na tela inteira (só informativo: mostra se a medida enxerga custo de pintura): 49.9 ms, a medida subiu; marquee sem o ramo de movimento reduzido: pegou; marquee sem a animação (o "mexeu" tem de dar falso): pegou.
**Não prova:** aparelho real, GPU, bateria, nem o restante da faixa do catálogo, que continua [ESTIMATIVA: ponto de partida
nosso]. Quadro por `requestAnimationFrame` sobe com carga na linha principal; com pintura cara, o controle de desfoque não sobe sempre (nesta rodada: 49.9 ms), então **custo de pintura e de compositor não está medido**: vidro, aurora e sombra precisam de aparelho real. Teclado e leitor de tela: só o
que está na página de prova (`site-preamar.html`), não em cada efeito. Os avançados do grupo G não foram construídos.

| Efeito | Nome | Situação | Valor usado | p95 do quadro | Reduzido testado | Propriedades animadas |
|---|---|---|---|---|---|---|
| A1 | Vidro | PROVADO | cartão a 82%, desfoque 10 px, saturação 140%, borda 10%, luz 1 px | 16.8 ms | sim | sem animação (efeito parado) |
| A2 | Brilho que segue o mouse | PROVADO | raio 320 px, 10%, some em 0,25 s | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| A3 | Borda animada | PROVADO | borda 2 px, 5 s por volta, uma peça | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| A4 | Brilho na ação | PROVADO | sombra 0 6 px 20 px a 0,38; luz interna 1 px a 0,2 | 16.8 ms | sim | sem animação (efeito parado) |
| A5 | Faixa de brilho | PROVADO | passa em 1,2 s, pausa de 6 s, 22% | 16.8 ms | sim | transform |
| A6 | Pulso e anel | PROVADO | 2 s, escala até 2,5, anel a 50% | 16.8 ms | sim | opacity, transform |
| A7 | Inclinação 3D | PROVADO | até 6°, perspectiva 1000 px, volta em 0,4 s | 16.7 ms | sim | transform |
| B1 | Gradiente radial | PROVADO | raios 320–460 px, 25–45%, somem em 75–80% | 16.8 ms | sim | sem animação (efeito parado) |
| B2 | Aurora | PROVADO | 2 manchas, 20 e 28 s por ciclo, deslocamento 15% da largura | 16.8 ms | sim | transform |
| B3 | Malha de gradiente | PROVADO | 4 radiais da mesma família | 16.8 ms | sim | sem animação (efeito parado) |
| B4 | Granulado | PROVADO | 5%, tela 180 px, SVG como imagem | 16.8 ms | sim | sem animação (efeito parado) |
| B5 | Grade de fundo | PROVADO | passo 32 px, linha 1 px a 8%, máscara radial | 16.8 ms | sim | sem animação (efeito parado) |
| B6 | Curva entre seções | PROVADO | raio 32 px | 16.8 ms | sim | sem animação (efeito parado) |
| B7 | Cena animada | PROVADO | 15 s pelo caminho, área pequena | 16.8 ms | sim | offsetDistance |
| C1 | Entrada ao rolar | PROVADO | 24 px, 0,6 s, uma vez | 16.8 ms | sim | opacity, transform |
| C2 | Parallax | PROVADO | 20% da rolagem, até 100 px | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| C3 | Seção presa | PROVADO | 3 passos de 150 px | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| C4 | Linha que se desenha | PROVADO | 1,1 s, uma vez | 16.8 ms | sim | strokeDashoffset |
| C5 | Transição de vista | PROVADO (perto do limite: o quadro oscila entre rodadas) | 0,3 s, peça com o mesmo nome | 33.3 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| C6 | Cartões empilhados | PROVADO | 3 cartões, 20 px de diferença | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| D1 | Número que sobe | PROVADO | 1,2 s, começa em 85%, uma vez | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| D2 | Título por linha | PROVADO | 0,65 s, 50 ms entre linhas | 16.8 ms | sim | transform |
| D3 | Palavra em destaque | PROVADO | uma palavra na cor do acento, sem gradiente | 16.8 ms | sim | sem animação (efeito parado) |
| D4 | Texto que troca | PROVADO | 2,5 s por palavra, 3 palavras, largura reservada | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| D5 | Título ligado à rolagem | PROVADO | texto a 2 tons, contraste já no início; animation-timeline com reserva | 16.8 ms | sim | backgroundPositionX, backgroundPositionY |
| D6 | Gráfico que se desenha | PROVADO | 0,7 s, uma vez | 16.8 ms | sim | transform |
| E1 | Marquee | PROVADO | 30 s por volta, conteúdo duplicado, com pausa | 16.8 ms | sim | transform |
| E2 | Órbita e feixes | PROVADO | anel 60 s, feixe 2 s, com pausa | 16.8 ms | sim | opacity, transform |
| E3 | Flutuação | PROVADO | 8 px, 4 s | 16.8 ms | sim | transform |
| E4 | Cena em ciclo | PROVADO | 2 s por estado, transição 0,35 s, 3 estados, com pausa | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| E5 | Confete | PROVADO | 24 peças, 1,2 s, só depois de um gesto | 16.8 ms | sim | opacity, transform |
| F1 | Botão | PROVADO | −1 px em 0,16 s; apertar .98 em 0,08 s | 16.8 ms | sim | background-color, backgroundColor, transform |
| F2 | Botão magnético | PROVADO | até 8 px, volta em 0,4 s | 16.8 ms | sim | transform |
| F3 | Cursor próprio | PROVADO | 24 px, suavizado, cursor do sistema mantido | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |
| F4 | Cartão ao passar o mouse | PROVADO | −3 px, 0,2 s | 16.8 ms | sim | box-shadow, boxShadow, transform |
| F5 | Seletor deslizante | PROVADO | 0,25 s, rádio real | 16.8 ms | sim | transform |
| F6 | Acordeão | PROVADO | 0,25 s, linhas de 0fr a 1fr | 16.8 ms | sim | grid-template-rows, gridTemplateRows, transform |
| F7 | Confirmação e aviso | PROVADO | marca 0,4 s, aviso 6 s, entra em 0,3 s | 16.8 ms | sim | opacity, strokeDashoffset, transform |
| F8 | Esqueleto de carga | PROVADO | brilho 1,6 s, aparece após 250 ms | 16.8 ms | sim | por JS (requestAnimationFrame) ou transição já encerrada na medida |

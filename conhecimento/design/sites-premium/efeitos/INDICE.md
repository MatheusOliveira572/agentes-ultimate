<!-- Texto próprio do agentes-ultimate, a partir do estudo de efeitos de 2026-11-01 (docs/referencias-efeitos-2026-11.md): técnica descrita em palavras, nada copiado. -->
<!-- ref: tema=efeitos-de-site; palavras=efeito de site, efeitos de site, animacao de site, efeito na landing, efeitos visuais, efeito premium; agentes=designer-sites, engenheiro-software -->
<!-- teste-ref: sim=quais efeitos de site usar na página do produto | quero um efeito premium, efeitos visuais na página; nao=calcule o custo médio ponderado do estoque -->
# Efeitos de site: regras e índice

Repertório, não lista de compras: um movimento dominante por tela, a serviço da ideia do projeto; vá além quando fizer
sentido. Valores de movimento em geral: `../../movimento/INDICE.md`.

| Grupo | Arquivo |
|---|---|
| A. Superfície e luz · B. Fundos | `superficie-e-fundos.md` |
| C. Rolagem · D. Texto e números | `rolagem-e-texto.md` |
| E. Repetição · F. Micro-interações · G. Avançados | `repeticao-e-micro.md` |
| H. Vitrine Apple (Liquid Glass + 3D + revelação, costurados; padrão em landing) | `vitrine-apple.md` |
| O que foi provado, com que valor e em que condição | `provas.md` |

## Regras comuns
- **Só `transform` e `opacity` quando puder.** Animar `width`, `top`, `box-shadow`, `filter` ou `backdrop-filter` custa mais.
- **Loop parado fora da tela:** `IntersectionObserver` pausa; `document.hidden` também; `animation-play-state` em CSS.
- `will-change` só durante o efeito, nunca em massa.
- **Movimento reduzido:** todo efeito tem alternativa. Regra base: sem deslocamento, escala, loop nem paralaxe; se a mudança
  importa, um esmaecimento de até 0,2 s.
- **Mexe sozinho por mais de 5 s, junto de outro conteúdo:** precisa de meio de pausar, parar ou esconder (WCAG 2.2.2).
- **Nunca mais de 3 flashes por segundo** (WCAG 2.3.1).
- **Animação vinda de interação** deve poder ser desligada (WCAG 2.3.3, AAA): respeite a preferência do sistema.
- **Conteúdo existe sem o efeito:** sem JS, o texto aparece. Nunca `opacity: 0` em CSS sem a classe que o JS põe.
- **Fim do movimento = estado legível e completo.** Captura em qualquer instante não deve ter texto invisível.
- **Teto:** até 3 tipos de efeito por página, 1 dominante. Em painel de decisão, só resposta e transição.

Tempos de referência: resposta 0,1–0,2 s; transição 0,2–0,4 s; entrada 0,5–0,7 s ([MEDIDO] nos sites); fundo 8–40 s por ciclo.
Curvas: desaceleração longa, `cubic-bezier(.16,1,.3,1)` ou `(.22,1,.36,1)` ([MEDIDO]) para entrar; `ease-out` curto para responder.

## Onde exagera
Sinais de excesso: mais de 1 coisa chamando a atenção na mesma tela; efeito sem relação com a ideia; qualquer espera para ler;
fundo que disputa com o texto; violeta com brilho sobre preto, ou gradiente em palavra, só porque está na moda.

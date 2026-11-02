<!-- Texto próprio do agentes-ultimate, escrito a partir da HIG pública da Apple (https://developer.apple.com/design/human-interface-guidelines, páginas abertas em 2026-11-01). Cobre a mesma função do apple-design-skill (dickwu, sem licença): nada copiado dele nem da Apple; cada regra cita a página da HIG. -->
<!-- ref: tema=apple-hig; palavras=apple, estilo apple, hig, human interface guidelines, ios, iphone, ipad, mac, visual premium, app premium, redesenhe, redesenho, app, aplicativo, liquid glass, efeito vidro, site institucional, site bonito, bonito; agentes=designer-paineis, designer-documentos, designer-sites, engenheiro-software -->
<!-- teste-ref: sim=revise o app no estilo Apple seguindo a HIG | redesenhe a tela do aplicativo com visual premium de iphone; nao=faça o rateio das despesas por centro de custo -->
# Apple (HIG): método de revisão e índice dos temas

Base: `https://developer.apple.com/design/human-interface-guidelines/<tema>`. Abra a página do tema quando a regra decidir
algo importante; cite como `HIG › <tema> › <seção>`.

## 1. Situar (antes de julgar)
- **Plataforma e framework:** celular ou desktop; SwiftUI, UIKit, AppKit, React Native, Flutter, Electron, Tauri, web.
- **Categoria e público** do app.
- **O artefato:** captura, maquete, código ou descrição. Diga o que dá e o que não dá para conferir nele; contraste se
  calcula pelos valores de cor, nunca "no olho" de um JPEG.
- **A tese da tela:** numa frase, a única função dela e o que a caracteriza. Sem resposta: vira nota de acabamento.
- **O objetivo do pedido:** auditoria completa, uma dúvida específica ou direção de melhoria.
- **Alcance:** app web ou só Android recebe os princípios e os fundamentos (acessibilidade, cor, tipo, layout, escrita),
  não as convenções de plataforma da Apple. Diga quais partes valem. Plataforma indefinida que muda o veredito: pergunte.

## 2. Carregar (3 a 6 arquivos por pedido)
Sempre: `acessibilidade-tipo-e-toque.md` e `cor-e-modo-escuro.md`. Depois, pelo que está na tela:
| Na tela | Arquivo |
|---|---|
| abas, barra lateral, navegação, voltar | `componentes.md` §navegação |
| botões, menus, ações, seletores, alternadores, listas, busca, ajustes | `componentes.md` |
| vidro, desfoque, barras translúcidas | `materiais.md` |
| movimento, transição, carregando, retorno, erro | `movimento-e-retorno.md` |
| primeiro uso, texto, rótulos, mensagens | `escrita-e-primeiro-uso.md` |
| gráficos e dados | `graficos.md` |
| marca, identidade, princípios | `fundamentos.md` |
| grade, margens, tamanhos de tela | `fundamentos.md` §layout |
| código de app Apple a auditar | `../../plataformas/apple-auditoria.md` |

## 3. Cinco lentes, nesta ordem
1. **Acessibilidade** (falha = **Crítico**): números em `acessibilidade-tipo-e-toque.md`.
2. **Convenções da plataforma** (falha costuma ser **Alto**): `componentes.md`, `fundamentos.md` §layout.
3. **Desenho visual e acabamento** (Alto ou Médio): `cor-e-modo-escuro.md`, `materiais.md`, `fundamentos.md` §acabamento.
4. **Interação** (costuma ser Médio): `movimento-e-retorno.md`.
5. **Conteúdo e escrita** (costuma ser Médio): `escrita-e-primeiro-uso.md`.
Cite só o que você abriu. Sem referência que cubra um ponto, diga que é julgamento seu.

## 4. Relatório
```
## Revisão de design: <nome>
### Resumo        2–3 frases. Nota geral: Excelente / Bom / Precisa melhorar / Problemas críticos.
                  A tese da tela e a coisa pela qual ela será lembrada (ou que falta uma).
### Crítico        o que tem de corrigir (acessibilidade, convenção quebrada que confunde):
                  O quê (com números) · Por quê (HIG › tema › seção) · Correção (no framework do projeto)
### Melhorias     o que eleva a qualidade
### Acabamento    detalhes (alinhamento, peso de ícone, texto)
### O que funciona   obrigatório: o que manter
### Plataforma    o que muda por plataforma (iPhone, iPad, Mac; web)
```

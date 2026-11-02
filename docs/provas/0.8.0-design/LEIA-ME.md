# Prova visual da 0.8.0 (design): agentes de verdade, dados fictícios

> **Prova mais nova (pv92, 2026-11-02):** `e2e/LEIA-ME.md`: antes e depois do app, vidro na landing e no produto, transparência reduzida, contraste no pior ponto. O texto abaixo é da tentativa de 2026-11-01.

Duas execuções reais de `claude -p` com o plugin desta pasta (`--plugin-dir`), `designer-paineis` e `engenheiro-software`
chamados pelo orquestrador a partir do pedido. PNGs gerados no Edge sem interface (perfil próprio, nada na tela do
usuário), temas claro e escuro, 1440 e 390 px: 8 imagens em `png/`, 0 erro de JavaScript e 0 rolagem lateral.

## 1. "redesenhe meu app com visual premium" → `app-premium.html`
| Agente | Referências que abriu (em `conhecimento/`) |
|---|---|
| `designer-paineis` | `design/metodo.md`, `design/detalhes-interface.md`, `design/apple/INDICE.md`, `design/modos/operar.md`, `design/apple/cor-e-modo-escuro.md`, `design/apple/acessibilidade-tipo-e-toque.md`, `design/apple/graficos.md`, `design/movimento/INDICE.md`, `design/piso-de-qualidade.md` |
| `engenheiro-software` | `design/piso-de-qualidade.md` |

## 2. "um card com efeito vidro estilo Apple" → `card-vidro.html`
| Agente | Referências que abriu |
|---|---|
| `designer-paineis` | `design/apple/materiais.md`, `design/apple/cor-e-modo-escuro.md`, `design/piso-de-qualidade.md`, `design/tipografia/INDICE.md`, `design/acessibilidade/INDICE.md` |
| `engenheiro-software` | `design/apple/materiais.md`, `design/construir-do-desenho.md`, `design/piso-de-qualidade.md` |

## O que não saiu limpo
- **A escrita em `docs/` foi recusada nas duas execuções** (classificador do modo automático sem veredito). O HTML do app
  saiu do conteúdo da chamada de escrita registrada na transcrição; o do cartão, da pasta temporária em que o engenheiro
  trabalhou. O conteúdo é o dos agentes.
- **A execução do cartão parou no limite de gasto** antes do engenheiro fechar as próprias checagens e o relatório. A
  página não passou por revisor.
- **Ajuste à mão, fora dos agentes:** no cartão, as manchas de fundo não passavam por trás dele no tema claro, e o vidro
  não aparecia. Mudei só a posição de duas manchas (linhas 51 e 170).
- Número de referências acima de 3 por pedido: o `designer-paineis` abriu 9 no pedido do app (o teto do roteador é 3
  sugeridas; ele ainda não tem a seção "Referências sob demanda", que é do lote 7, e seguiu os índices).
- Contraste no pior fundo do cartão não foi medido de novo depois do ajuste das manchas.

<!-- Adaptado de serafimcloud/21st/README.md (Quality Guidelines) @b96d84d, © 2024 21st.dev, MIT. Alterações: tradução, corte, regras de entrada de código de terceiro no projeto; alterado por agentes-ultimate. Licença em terceiros/serafimcloud-21st/. -->
<!-- ref: tema=componentes-21st; palavras=componente pronto, componentes prontos, 21st, shadcn, biblioteca de componentes react, registro de componentes, componente da comunidade, app, site, visual premium, redesenhe; agentes=engenheiro-software, designer-paineis; requer=21st -->
<!-- teste-ref: sim=use um componente pronto do 21st com shadcn no app react | procure no registro de componentes da comunidade um cartão de preço pronto; nao=calcule o adicional noturno da folha -->
# Componentes prontos (registro 21st.dev, com shadcn/ui)

Só vale quando o usuário ligou a integração (`"integracoes": ["21st"]` no config) e o projeto é React + Tailwind com
shadcn. O que muda e o risco estão na skill `integracoes`.

## O que um bom componente tem (diretrizes de qualidade do 21st)
1. **Qualidade visual:** acabado e útil de verdade, nas práticas atuais de UI/UX.
2. **Estrutura:** lógica do componente separada do conteúdo de demonstração (padrão shadcn/ui); o arquivo do componente só
   com a parte reutilizável; a demonstração mostra o componente **por props**, nunca com conteúdo fixo dentro.
3. **Tema:** variáveis de CSS do tema do shadcn (`hsl(var(--background))` etc.), **claro e escuro** prontos.
4. **Acessibilidade e TypeScript:** tipos completos; primitivos acessíveis (Radix) por baixo.
5. **Prévia obrigatória:** cada componente tem pelo menos uma demonstração com imagem de prévia (`preview.png`).

## Ao trazer um componente para o projeto
- Antes: `node "<plugin>/scripts/checar-ferramenta.js" npx`, o `components.json` do shadcn presente, e o gerenciador
  (`<plugin>/scripts/gerenciador-pacotes.js`). Comando com endereço do componente (`npx shadcn@<versão> add "https://21st.dev/r/..."`),
  versão fixa, nunca `@latest`.
- **Código de terceiro entra no projeto:** passa pelo `revisor` e pelo `auditor-seguranca` (dependências que ele puxa,
  chamadas de rede, `dangerouslySetInnerHTML`).
- Depois: troque cores e espaços fixos pelos tokens do projeto (`cor/INDICE.md`), confira os estados
  (`variantes.md`) e o pior caso (`pior-caso.md`); a marca do projeto manda sobre o visual do componente.

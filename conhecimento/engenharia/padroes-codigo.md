<!-- Adaptado de affaan-m/ECC/rules/common/coding-style.md, rules/common/patterns.md e skills/coding-standards/SKILL.md @b38be6a, © 2026 Affaan Mustafa, MIT. Alterações: tradução, junção, corte; a convenção do projeto vence; alterado por agentes-ultimate. Licença em terceiros/affaan-m-ECC/. -->
<!-- ref: tema=padroes-codigo; palavras=padrao de codigo, padroes de codigo, boas praticas de codigo, convencao de nomes, nomes de variaveis, estilo de codigo, organizacao de arquivos, numeros magicos, code smell, codigo limpo; agentes=engenheiro-software -->
<!-- teste-ref: sim=defina os padrões de código e a convenção de nomes do projeto novo | revise as boas práticas de código: números mágicos, funções longas e organização de arquivos; nao=faça o resumo executivo do relatório de ESG -->
# Padrões de código (quando o projeto ainda não tem os seus)

**A convenção do projeto vence** (README, CONTRIBUTING, linter configurado, código vizinho). Isto aqui vale para o que ela
não diz.

## Princípios
- **Legível primeiro:** o código é lido muito mais do que escrito; nome claro antes de comentário.
- **O mais simples que funciona** (KISS); nada de otimização antes da medida.
- **Não repetir** (DRY) quando a repetição é real, não especulativa; três usos antes de abstrair.
- **Não vai precisar** (YAGNI): nem recurso nem abstração antes da necessidade.
- **Sem efeito escondido:** prefira devolver uma cópia alterada a mudar o objeto recebido (imutabilidade), salvo onde a
  linguagem ou o projeto fazem diferente por desempenho medido.

## Nomes
Dizem o que a coisa guarda ou faz, sem comentário. Booleano lê como afirmação (`estaAtivo`, `temAnexo`, `isActive`).
Constantes e tipos distinguíveis dos valores comuns na forma que a linguagem usa. Sem abreviação (salvo as universais:
`id`, `url`, `api`).

## Arquivos e funções
- Muitos arquivos pequenos e coesos > poucos grandes: 200–400 linhas é o típico; ~800 é o teto suave (teste, gerado e
  código de terceiro podem passar, com motivo). Organize por funcionalidade/domínio, não por tipo.
- Função com até ~50 linhas e uma responsabilidade; aninhamento de no máximo 4 níveis (prefira retorno antecipado).

## Erros e entradas
- Trate o erro explicitamente em cada nível; **nunca engula** (`catch` vazio). Na tela, mensagem amigável; no servidor,
  o contexto detalhado no log.
- Valide na borda, com esquema quando houver (Zod, Pydantic...); falhe cedo e com mensagem clara; não confie em dado de
  fora (resposta de API, entrada do usuário, conteúdo de arquivo).

## Cheiros a evitar
Aninhamento fundo; **número mágico** (limite, atraso, prazo: vire constante com nome ou configuração); função longa;
valor fixo no código que deveria ser configuração; comentário que repete o código (o "por quê" fica).

## Comentários
Comente o porquê, a decisão, o efeito não óbvio; documente a API pública (JSDoc, docstring). Densidade igual à do arquivo.

## Padrões úteis
- **Repositório:** acesso a dados atrás de uma interface (buscar todos, por id, criar, atualizar, apagar); a regra de
  negócio depende da interface, não do banco.
- **Envelope de resposta** de API num formato só (ver `api.md`).
- **Esqueleto pronto:** antes de começar do zero, procure um projeto-base mantido e testado; avalie segurança, extensão
  e aderência, e passe dependência nova pelo `auditor-seguranca`.

## Antes de dar por pronto
Legível e com bons nomes; funções pequenas; arquivos focados; sem aninhamento fundo; erros tratados; sem valor fixo
solto; sem mutação escondida.

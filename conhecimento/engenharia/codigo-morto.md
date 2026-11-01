<!-- Adaptado de affaan-m/ECC/agents/refactor-cleaner.md @b38be6a, © 2026 Affaan Mustafa, MIT. Alterações: tradução, corte; ferramentas só se já instaladas; log das exclusões; alterado por agentes-ultimate. Licença em terceiros/affaan-m-ECC/. -->
<!-- ref: tema=codigo-morto; palavras=codigo morto, codigo nao usado, funcao sem uso, export sem uso, dependencia sem uso, limpar dependencias, arquivos orfaos, duplicado, codigo duplicado; agentes=engenheiro-software -->
<!-- teste-ref: sim=remova o código morto e as dependências sem uso do projeto | tem muito código duplicado e funções sem uso, faça a limpeza com segurança; nao=como está o fluxo de caixa da semana -->
# Código morto e duplicado: tirar com segurança

## Quando não fazer
No meio de funcionalidade em andamento, logo antes de publicar, sem cobertura de teste razoável, ou em código que você
não entende.

## Método
1. **Analisar.** Ferramentas de detecção do ecossistema, se o projeto já tiver (ex.: `knip`, `depcheck`, `ts-prune` em
   JS/TS; `vulture` em Python). Antes de usar uma: `node "<plugin>/scripts/checar-ferramenta.js" <nome>`; o plugin não
   instala. Classifique o risco:
   - **seguro:** export ou dependência sem uso;
   - **cuidado:** pode ser carregado por nome (import dinâmico, reflexão, rota por convenção, plugin);
   - **arriscado:** API pública, usada fora do repositório.
2. **Confirmar cada item:** busca por todas as referências, inclusive por texto (import dinâmico, nome montado em string,
   configuração); faz parte da API pública?; o histórico do git explica por que existe?
3. **Tirar com segurança:** só os "seguros" primeiro; uma categoria por vez (dependências → exports → arquivos →
   duplicados); testes depois de cada lote; um commit por lote.
4. **Juntar duplicados:** escolha a melhor implementação (mais completa, mais testada), atualize todos os usos, apague as
   outras, rode os testes.
5. **Log das exclusões:** no relatório, a lista do que saiu (arquivo/símbolo, por que estava morto, como foi confirmado)
   e o commit, para desfazer se alguém depender.

## Antes de tirar
- [ ] a ferramenta e a busca confirmam que não há uso (inclusive dinâmico);
- [ ] não é API pública;
- [ ] os testes passam depois.

## Depois de cada lote
Build passa; testes passam; commit com mensagem que diz o que saiu. Na dúvida, não tire: deixe em "Pendências".

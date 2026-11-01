<!-- Adaptado de affaan-m/ECC/agents/architect.md @b38be6a, © 2026 Affaan Mustafa, MIT. Alterações: tradução, corte do exemplo de pilha do autor; reversibilidade e "o mais simples" do protocolo; alterado por agentes-ultimate. Licença em terceiros/affaan-m-ECC/. -->
<!-- ref: tema=arquitetura; palavras=arquitetura, desenho da solucao, desenhe a arquitetura, decisao de arquitetura, escalabilidade, componentes do sistema, microsservicos, monolito, adr; agentes=engenheiro-software -->
<!-- teste-ref: sim=desenhe a arquitetura do sistema de pedidos com as decisões registradas | precisamos decidir entre monolito e microsserviços para a nova plataforma; nao=crie a descrição da vaga de analista de RH -->
# Arquitetura: desenho, trocas e decisões registradas

## Processo
1. **Estado atual:** arquitetura existente, padrões e convenções do repositório, dívida técnica, limites de escala.
2. **Requisitos:** funcionais; não funcionais (desempenho, segurança, escala, disponibilidade); pontos de integração;
   fluxo dos dados.
3. **Proposta:** diagrama de alto nível, responsabilidade de cada componente, modelo de dados, contratos de API
   (`api.md`), padrões de integração.
4. **Trocas, por decisão:** prós, contras, alternativas consideradas, escolha e motivo, **reversibilidade**. Um registro
   por decisão (ADR: contexto, decisão, alternativa descartada, consequências).

## Princípios
- **Módulos com responsabilidade única,** coesão alta e acoplamento baixo, interfaces claras.
- **Escala só com a necessidade medida:** sem estado onde der, consultas eficientes, cache onde a medida mostrar.
  Começar pelo mais simples que atende (protocolo comum); mudar quando um limite real aparecer, não antes.
- **Manutenção:** organização clara, padrões consistentes, fácil de testar e de entender.
- **Segurança:** defesa em camadas, menor privilégio, validação na borda, seguro por padrão, trilha de auditoria. Revisão
  pelo `auditor-seguranca` quando houver login, dado pessoal ou entrada de fora.
- **Desempenho:** algoritmo certo, poucas idas à rede, consultas otimizadas, carregamento sob demanda.

## Padrões de referência (escolha pelo problema, não pela moda)
- Tela: composição de componentes, separar dado de apresentação, lógica com estado reutilizável, estado global só onde
  precisa, divisão de código por rota.
- Servidor: repositório para acesso a dados, camada de serviço para regra de negócio, middleware, eventos para o que é
  assíncrono, leitura e escrita separadas (CQRS) só com volume que justifique.
- Dados: normalizado por padrão; desnormalizado para leitura medida como lenta; trilha de eventos quando auditoria e
  reprocessamento importam; consistência eventual só em sistema distribuído.

## Lista do desenho
- Funcional: histórias, contratos de API, modelos de dados, fluxos de tela.
- Não funcional: metas de latência e vazão, escala, segurança, disponibilidade.
- Técnico: diagrama, responsabilidades, fluxo de dados, integrações, estratégia de erro, estratégia de teste.
- Operação: implantação, monitoramento e alerta (`observabilidade.md`), backup e recuperação, **plano de volta**.

## Antipadrões
Bola de lama (sem estrutura); martelo de ouro (a mesma solução para tudo); otimização precoce; "não inventado aqui"
(recusar o que já existe); paralisia de análise; mágica (comportamento sem documentação); acoplamento forte; objeto deus.

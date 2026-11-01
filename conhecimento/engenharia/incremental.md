<!-- Adaptado de addyosmani/agent-skills/skills/incremental-implementation/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte e ajuste ao protocolo; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=fatias-incrementais; palavras=funcionalidade nova, implementar a funcionalidade, varios arquivos, fatia, fatias, incremental, feature flag, implementar a tarefa do plano; agentes=engenheiro-software, dev-powerbi -->
<!-- teste-ref: sim=implementar a funcionalidade nova de exportar pedidos, que mexe em vários arquivos do sistema | vamos construir em fatias a tarefa 3 do plano, com feature flag; nao=qual a melhor época para tirar férias -->
# Construir em fatias finas e verificáveis

Uma fatia por vez: implementar → testar → verificar → commit → próxima. Cada fatia deixa o sistema funcionando. Vale
para mudança em mais de um arquivo, funcionalidade nova a partir do plano, refatoração, ou sempre que der vontade de
escrever mais de ~100 linhas antes de testar. Mudança de uma função num arquivo só não precisa disso.

## Como fatiar
- **Vertical (preferida):** um caminho completo pela pilha (banco + API + tela) que o usuário já consegue usar.
  Fatia 1: criar o item; fatia 2: listar; fatia 3: editar.
- **Contrato primeiro:** quando duas partes andam em paralelo. Fatia 0: o contrato (tipos, interface, OpenAPI); 1a: o
  servidor contra o contrato, com testes; 1b: a tela contra dados simulados no formato do contrato; 2: integrar.
- **Risco primeiro:** a parte mais incerta antes (ex.: provar que a conexão em tempo real funciona). Se falhar, você
  descobre antes de investir nas outras.

## Regras
0. **O mais simples que funciona.** Depois de escrever: dá para fazer com menos linhas? A abstração paga o que custa?
   Estou construindo para um requisito hipotético? Três linhas parecidas valem mais que uma abstração precoce.
   Primeiro a versão ingênua e obviamente certa; otimizar só depois de provada pelos testes.
1. **Só o que a tarefa pede.** Não "arrumar" código vizinho, reorganizar imports de arquivo que você não muda, apagar
   comentário que você não entende, acrescentar recurso "útil" fora da especificação, modernizar sintaxe de arquivo que
   você só leu. Viu algo a melhorar fora do escopo: anote em "Pendências" do relatório, não corrija.
2. **Uma coisa por fatia.** Componente novo, refatoração de outro e mudança de configuração são 3 commits.
3. **Sempre compilando.** Ao fim de cada fatia, o build e os testes existentes passam.
4. **Recurso incompleto atrás de chave** (feature flag), desligada por padrão, para poder juntar ao tronco sem expor.
5. **Padrão seguro:** comportamento novo começa desligado ou conservador (opt-in).
6. **Fácil de desfazer:** acrescentar é fácil de reverter; migração de banco traz a volta; não apague e substitua no
   mesmo commit.

## Lista de cada fatia (com os comandos do próprio repositório)
- [ ] faz uma coisa, completa;
- [ ] testes existentes passam; build passa; checagem de tipos e linter passam, quando a pilha tem;
- [ ] a funcionalidade nova faz o que deve; commit com mensagem que diz o quê e por quê.
Rodou e passou: não rode de novo o mesmo comando sem mudança de código (não traz informação nova).

## Desculpas comuns
| Desculpa | Realidade |
|---|---|
| "Testo tudo no fim" | O defeito da fatia 1 deixa as fatias 2–5 erradas. Teste cada fatia. |
| "É mais rápido de uma vez" | Até quebrar e ninguém achar qual das 500 linhas foi. |
| "Pequeno demais para um commit" | Commit pequeno é de graça; o grande esconde defeito e dificulta voltar. |
| "A refatoração é pequena, vai junto" | Misturada com a funcionalidade, as duas ficam difíceis de revisar. Separe. |

## Sinais de alerta
Mais de 100 linhas sem rodar teste; mudanças sem relação na mesma fatia; "deixa eu só acrescentar isto"; pular o teste
para ir mais rápido; build quebrado entre fatias; muita mudança sem commit; abstração antes do 3º uso; arquivo
utilitário novo para uso único; o mesmo comando duas vezes seguidas sem mudança no meio.

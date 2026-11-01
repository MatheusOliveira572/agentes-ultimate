# Segurança · contexto do projeto, mapa do app e modo de trabalhar

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026). Leia este arquivo antes de qualquer
outro roteiro de `referencias/`: os roteiros pressupõem o contexto e o modo de trabalhar daqui.

## Contexto do projeto (preencha uma vez e repita no topo de cada roteiro)
```
CONTEXTO DO PROJETO
- O que o app faz: [ex.: painel de orçamento da diretoria; portal de pedidos]
- Quem usa: [público / só o meu time / empresas clientes]
- Construído com: [Claude Code / outro]
- Tecnologias: [ex.: Next.js + Supabase + Stripe + API de IA; ou Power BI + SharePoint]
- Hospedagem: [Vercel / Netlify / servidor próprio / serviço do Power BI / outro]
- Login: [provedor (Supabase Auth, Entra ID, Clerk…) / próprio / da plataforma]
- Papéis de usuário: [ex.: usuário, administrador]
- Dados sensíveis: [e-mails, endereços, pagamentos, saúde, salários, arquivos…]
- Situação: [ainda não lançado / no ar com ___ usuários]
- O que me preocupa: [opcional]
```

## Roteiro 00 · mapa do app (uma vez, no início; não muda o código)
Papel: engenheiro sênior de segurança de aplicações. Antes de mudar qualquer coisa, entenda toda a superfície de
ataque do app lendo o código inteiro. **Não altere código do app nesta etapa.** Crie `SECURITY_MAP.md` com:
1. Tecnologias: linguagens, frameworks e versões, gerenciador de pacotes, onde é hospedado e publicado.
2. Dados: os bancos e como são alcançados (só pelo servidor, ou direto do navegador por SDK como Supabase/Firebase);
   cada tabela ou coleção e o quanto o dado dela é sensível.
3. Login: provedor ou método, onde fica a sessão, onde as checagens acontecem e os papéis que existem.
4. Pontos de entrada: tabela com **toda** página, rota de API, ação de servidor, função serverless, webhook e tarefa
   agendada: caminho · método · para quê · exige login? · papéis permitidos · entradas aceitas.
5. Serviços de terceiros: cada um, para que serve, que chave usa e se a chave é usada no navegador ou no servidor.
6. Variáveis de ambiente: **só os nomes, nunca os valores**, onde cada uma é usada, e se é pública ou secreta.
7. Funções de risco: upload, pagamento, e-mail ou SMS, chamadas a IA, qualquer busca de URL, ferramentas de
   administração, importação e exportação.
8. Perguntas: o que o código não respondeu e o usuário precisa responder.
Depois, as 5 maiores preocupações de segurança, em ordem, em linguagem simples, cada uma com o item do checklist
(`itens.md`) que trata dela. Ainda sem correções.

## Modo de trabalhar (vale para todos os roteiros)
- Audite primeiro e mostre o que achou antes de mudanças grandes.
- Corrija direto o que for Crítico e Alto. Pergunte antes de qualquer mudança que o usuário perceba (deslogar todo
  mundo, bloquear uma função, mudar um fluxo).
- Corrija a causa com a menor mudança segura. Não remova funções, não enfraqueça outra proteção, não deixe comentário
  "TODO: proteger depois".
- Pacote novo: diga o nome e o porquê, e confirme no registro oficial (npmjs.com, pypi.org) que existe e é o conhecido,
  não um nome parecido.
- Nunca imprima o valor de um segredo: cite pelo nome da variável. Nunca peça ao usuário que cole um segredo no chat.
- O que fica fora do código (painel do provedor, configuração da hospedagem): dê o passo a passo exato, clique a clique.

## Terminar com (vale para todos os roteiros)
1. Tabela de achados: problema · arquivo:linha · gravidade · status (Corrigido / Depende do usuário / Não se aplica).
2. Arquivos alterados.
3. Como o usuário confere sozinho em menos de 5 minutos.

## Dicas de uso
- Um roteiro por conversa (ou por agente), com o contexto do projeto no topo: sessões focadas rendem mais.
- Teste depois de cada roteiro: entre, faça os fluxos principais. Correção de segurança às vezes quebra uma função.
- Leia a tabela de achados antes de aceitar as mudanças. Se algo não fizer sentido, peça "mostre o código que prova".
- Revisor de IA pode deixar passar problema real e inventar um falso. Quem trata pagamento, saúde, dado de criança ou
  muitos usuários deve contratar também um teste de invasão profissional antes de lançar.

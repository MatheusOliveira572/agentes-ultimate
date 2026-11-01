# Segurança · extras que costumam ser esquecidos

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026, verificações bônus). Antes, leia
`seguranca-contexto.md`. O B7 do original (SPF, DKIM e DMARC do domínio de e-mail) ficou fora: é da TI da empresa;
entra só quando o app mandar e-mail com domínio próprio.

## B1 · proteger as funções de IA (S-web-12)
Se o app chama um modelo de IA, o usuário pode tentar sequestrá-lo com injeção de prompt ("ignore as suas instruções
e..."), extrair o prompt de sistema, fazê-lo disparar ações que não devia, ou só estourar a sua conta. Texto dentro de
documento enviado ou de página da web carrega os mesmos ataques.

Papel: engenheiro de segurança de aplicações com IA. Revise toda função do app que chama um modelo.
1. Liste cada chamada: modelo, onde fica a chave (só no servidor), que conteúdo do usuário e que documentos e dados
   entram no prompt, e para que a saída é usada.
2. Injeção de prompt: suponha que todo texto, arquivo, e-mail ou página que vai ao modelo pode ter instrução hostil.
   Garanta que o modelo não revela segredo (nada de chave nem dado de outro usuário no prompt), não alcança dado que o
   usuário atual não pode ver e não dispara ferramenta ou ação além da permissão desse usuário. Ação destrutiva ou cara
   exige confirmação explícita do usuário.
3. Saída do modelo é não confiável: limpe antes de virar HTML ou Markdown (roteiro 07) e valide antes de usar em
   consulta, URL, código ou comando.
4. Abuso de custo: login obrigatório, limite por usuário e cota diária, máximo de tokens de entrada e de saída, e teto
   mensal de gasto no provedor.
5. Privacidade: não mande ao modelo mais dado pessoal que o necessário; registre prompts com cuidado, ou não registre.
Corrija e liste o que mudou.

## B2 · bloquear SSRF nas funções que buscam URL (S-web-11)
Toda função que busca uma URL que o usuário informa (prévia de link, "importar da URL", webhooks que o app chama,
imagem por URL) pode ser apontada para a sua rede interna ou para o serviço de metadados da nuvem, que pode expor
credenciais.

Papel: engenheiro sênior de segurança. Ache todo lugar em que o servidor busca uma URL que o usuário influencia (prévias,
importações, busca de imagem, webhooks de saída, geração de PDF ou captura, ferramentas de IA que navegam). Em cada um:
só `http`/`https`; resolva o nome e bloqueie faixas privadas, de loopback, link-local e internas (127.0.0.0/8, 10.0.0.0/8,
172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, inclusive o IP de metadados 169.254.169.254, ::1, fc00::/7) na primeira
requisição **e** em cada redirecionamento; lista de domínios permitidos quando der; tempo limite curto e tamanho máximo
de resposta; nunca devolva detalhe de erro interno. Use uma biblioteca mantida de proteção contra SSRF, se houver para a
tecnologia. Acrescente testes com endereços internos.

## B4 · trancar as suas próprias contas (S-5)
O caminho mais fácil para dentro do app costuma ser você: o seu git, a hospedagem, o registro do domínio, o painel do
banco, o provedor de pagamento ou o e-mail. Uma senha roubada ali passa por cima de todas as outras checagens.

Papel: consultor de segurança. Ajude a proteger as contas que controlam o app. Pelo código e pela configuração, liste
cada serviço de que o projeto depende (repositório, hospedagem e publicação, DNS e domínio, banco, login, pagamento,
e-mail, provedores de IA, análise de uso, rastreio de erro, lojas de apps; num painel interno: o espaço de trabalho do
Power BI, o SharePoint, o gateway e a conta de serviço). Para cada um, um checklist para o usuário marcar: MFA ligado
(aplicativo autenticador ou chave de acesso, não SMS quando der); membros revisados, sem quem não precisa mais;
papéis com o mínimo de privilégio; aplicativos e integrações conectados revisados; chaves de API e tokens de publicação
ativos revisados; alertas de login e de segurança ligados; bloqueio de transferência do domínio ligado.

## B5 · teto de gasto e alarmes de abuso (S-10)
Para app feito com IA, o "ataque" mais provável é a conta surpresa: chave de IA vazada, um laço martelando uma API paga,
fraude de SMS, pico de tráfego numa hospedagem cobrada por uso.

Papel: consultor de custo de nuvem e prevenção de abuso. Liste todo serviço que o app usa cobrado por uso (hospedagem,
funções serverless, banco, armazenamento, banda, IA, e-mail, SMS, mapas, busca). Para cada, diga exatamente como pôr
(1) um alerta de cobrança, (2) um teto de gasto ou cota, se o provedor oferece, e (3) limite de uso por chave. Para SMS,
restrinja os países de destino. Acrescente no app cota por usuário nas funções mais caras e um resumo diário de uso no log.

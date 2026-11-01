# Segurança · extras que costumam ser esquecidos

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026, verificações bônus). Antes, leia
`seguranca-contexto.md`. O B7 do original (SPF, DKIM e DMARC do domínio de e-mail) ficou fora: é da TI da empresa;
entra só quando o app mandar e-mail com domínio próprio.

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

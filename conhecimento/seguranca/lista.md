<!-- Adaptado de addyosmani/agent-skills/references/security-checklist.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte; publicação fica no checklist-lancamento; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=lista-de-seguranca; palavras=lista de seguranca, endurecer a aplicacao, modelagem de ameacas, stride, cabecalhos de seguranca, cors, hash de senha, cookie de sessao, top 10 para llm; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=faça a modelagem de ameaças com STRIDE e confira os cabeçalhos de segurança e o CORS | revise o hash de senha, o cookie de sessão e endureça a aplicação; nao=prepare a pauta da reunião semanal -->
# Lista de segurança (construção e revisão)

A lista de antes de publicar é a skill `/checklist-lancamento`; esta é a de quem constrói.

- **Ameaças primeiro:** fronteiras de confiança (requisição, upload, webhook, API de terceiro, saída de IA); ativos (credencial, dado pessoal,
  pagamento, ação de administrador, dinheiro); STRIDE por fronteira; casos de abuso ao lado dos casos de uso ("como eu abusaria disto?").
- **Antes do commit:** nenhum segredo (a trava do plugin confere); `.gitignore` com `.env`, `*.pem`, `*.key`; `.env.example` só com marcador.
- **Login:** senha com bcrypt (≥ 12 rodadas), scrypt ou argon2; cookie `httpOnly`, `secure`, `sameSite`; expiração de sessão; limite no login (≤ 10
  tentativas em 15 min); token de redefinição com prazo (≤ 1 h) e uso único; MFA em operação sensível.
- **Autorização:** todo endpoint protegido confere login; todo acesso a recurso confere dono ou papel (IDOR); administrador confere papel;
  chave de API com o mínimo; JWT com assinatura, validade e emissor conferidos.
- **Entrada:** validar na borda, por esquema; consulta parametrizada; saída codificada no contexto (HTML, atributo, URL); arquivo enviado com
  tipo, tamanho e nome conferidos, fora da pasta pública.
- **Cabeçalhos:** CSP, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, proteção contra enquadramento. **CORS** com lista
  de origens, nunca `*` com credenciais.
- **Dados:** cifrados em trânsito e, se sensíveis, em repouso; o mínimo necessário; nada sensível em log nem em URL.
- **Dependências:** auditoria sem achado alto ou acima; lockfile no git; pacote novo conferido (nome, dono, idade).
- **IA:** saída do modelo é entrada não confiável; prompt de sistema não é segredo nem controle de acesso; ferramenta com o mínimo de permissão;
  ação sensível com confirmação humana; limite de gasto.
- **Erros:** mensagem genérica ao usuário, com código de referência; detalhe só no log.

Por classe de falha: `vulnerabilidades/`. Antes de registrar achado: `metodo/contraprova.md`.

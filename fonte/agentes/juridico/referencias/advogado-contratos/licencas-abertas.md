<!-- Texto próprio do agentes-ultimate, a partir dos textos das licenças guardados em terceiros/ (MIT; Apache License 2.0, §4) e de https://www.apache.org/licenses/LICENSE-2.0 e https://opensource.org/license/isc-license-txt. Não é parecer: o advogado confere o caso concreto. -->
<!-- ref: tema=licencas-abertas; palavras=licenca de software, licenca mit, licenca apache, copiar codigo de terceiro, usar codigo aberto, open source, gpl, copyleft, notice, repositorio sem licenca; agentes=advogado-contratos -->
<!-- teste-ref: sim=podemos copiar este código de terceiro com licença MIT para o produto? | o repositório não tem licença e outro é GPL, o que dá para usar em open source?; nao=monte o gráfico de vendas do painel -->
# Usar código ou texto de terceiro: o que cada licença pede

| Licença | Pode copiar e alterar? | Obrigação ao redistribuir |
|---|---|---|
| **MIT** | sim | manter o aviso de copyright e o texto da licença em todas as cópias ou partes substanciais |
| **ISC** | sim | manter o aviso de copyright e o de permissão |
| **Apache-2.0** | sim | §4: entregar cópia da licença; **marcar em cada arquivo alterado que ele foi alterado**; manter avisos de copyright, patente, marca e atribuição; se houver `NOTICE`, levar os avisos dele. Traz licença de patente, que cai se a pessoa processar por patente (§3); não dá direito sobre marca (§6) |
| **GPL / AGPL** | com copyleft | a obra derivada distribuída segue a mesma licença, com o código-fonte; a AGPL alcança o uso em rede: vai para decisão antes de entrar |
| **Sem licença** | **não** | por padrão, todos os direitos reservados, mesmo público no GitHub. Só a ideia, escrita com as próprias palavras, ou pedir licença ao autor |
| **Dados e texto de fornecedor** (ex.: HIG da Apple, documentação) | conforme os termos do site | citar a fonte e escrever com as próprias palavras; marca e logotipo não entram |

## Método
1. **Confira a licença no arquivo e na API do repositório, no commit que vai usar** (a licença pode mudar entre versões; repositório copiado pode não ter herdado a do original: vá ao original).
2. Registre em `fontes/fontes.json` e em `CREDITOS.md`; `LICENSE` e `NOTICE` em `terceiros/<projeto>/`; 1ª linha de crédito em cada arquivo.
3. Dependências que o código puxa têm licença própria: confira antes (`auditor-seguranca`).
4. Licença mudou para restritiva: o que já foi copiado segue a licença do commit usado; nada novo entra; decisão do usuário.
**[HIPÓTESE]** Este resumo é método, não parecer para um caso específico nem análise de lei brasileira de direito autoral (Lei 9.610/1998, https://www.planalto.gov.br/ccivil_03/leis/l9610.htm): para uso comercial relevante, o advogado confere.

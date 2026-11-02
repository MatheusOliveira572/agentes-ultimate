<!-- Texto próprio do agentes-ultimate, a partir da HIG pública da Apple (páginas motion, feedback, loading, abertas em 2026-11-01). Nada copiado; cada regra cita a página. Valores de duração e curva ficam com movimento/INDICE.md (Emil Kowalski). -->
<!-- ref: tema=apple-movimento; palavras=movimento apple, animacao ios, transicao, retorno ao usuario, feedback, carregando, indicador de progresso, alerta, reduzir movimento, haptico; agentes=designer-interface, designer-paineis, engenheiro-software -->
<!-- teste-ref: sim=revise as animações e o feedback do app ios no padrão apple | o carregamento e os alertas do app estão confusos, ajuste o retorno ao usuário; nao=faça a ata da assembleia de acionistas -->
# Lente 4: movimento, retorno e carregamento

## Movimento (HIG › Motion)
- **Com propósito:** apoia a experiência sem ofuscá-la; nada de movimento por movimento (distrai e pode enjoar).
- Breve, cancelável e raro nas interações frequentes; nunca o único portador de sentido; com Reduzir Movimento, troque por
  esmaecer ou corte. (HIG › Motion; HIG › Accessibility)
- Símbolos animados (SF Symbols 5+) onde fizer sentido para dar retorno. (› Providing feedback)
- Em jogo, quadros constantes de 30 a 60 fps. (› Leveraging platform capabilities)
- visionOS: esmaecer para reposicionar objeto; um quadro de referência parado; **evite oscilação contínua perto de
  0,2 Hz**. (› visionOS)
- Curvas e durações: `../movimento/INDICE.md` (o Emil manda nos valores).

## Retorno (HIG › Feedback)
- Acessível por mais de um canal (visual, som, háptico).
- **Estado perto do item que ele descreve**, integrado à interface, em vez de alerta.
- **Alerta só para o crítico e de preferência acionável** (ele interrompe); nunca ao abrir o app; nunca para ação comum
  que dá para desfazer; o botão padrão não é "OK" salvo se for só informativo.
- Ação destrutiva e irreversível: aviso com Cancelar; o resto, desfazer.

## Carregando (HIG › Loading)
- Algo aparece na hora; a pessoa continua trabalhando; progresso **determinado** quando dá para saber.
- Conteúdo grande baixado em segundo plano para não atrasar a abertura.
- No relógio, evite indicador indeterminado (parece que é preciso esperar olhando).

## Entrada de dados (lente 4)
Puxe do sistema o que ele já sabe; ofereça escolha em vez de digitação; valide enquanto a pessoa preenche; **nunca
preencha senha previamente**. Modal com saída óbvia e uma tarefa curta.

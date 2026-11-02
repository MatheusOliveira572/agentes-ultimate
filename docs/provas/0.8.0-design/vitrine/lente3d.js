// Clara 35: a lente em WebGL (three.js 0.170.0, fixado por import map com SRI em index.html).
// Geometria procedural: barril anodizado (perfil de revolução), anel de foco serrilhado de verdade (relevo na malha),
// gravações em textura gerada, 7 vidros sólidos de revolução (superfícies curvas, espessura, borda pintada de preto) com
// MeshPhysicalMaterial (transmissão, índice de refração por vidro, iridescência sutil = revestimento antirreflexo),
// diafragma de 11 lâminas, sensor. Luz: ambiente de estúdio (RoomEnvironment → PMREM) + luz-chave de cima à esquerda
// com sombra suave + luz de recorte. Tone mapping Neutral (Khronos). O fundo do herói é a paisagem da página pintada em canvas,
// já desfocada (profundidade de campo de f/1,4), e rola junto com a página.
// A rolagem não é presa: o progresso da seção vira alvo de uma mola (a mola da casa, ver MOLA) e a lente segue a mola.
// Script clássico (não módulo) para abrir por file:// sem bloqueio; o three.js entra por import() dinâmico.
// Começa depois do load: criar o contexto WebGL e compilar os materiais não pode atrasar a primeira pintura do texto (LCP).
function iniciarLente() {
  'use strict';
  const raiz = document.documentElement;
  const qs = new URLSearchParams(location.search);
  const reduz = matchMedia('(prefers-reduced-motion: reduce)');
  const escuro = matchMedia('(prefers-color-scheme: dark)');
  const palco = document.querySelector('.palco'); const canvas = document.getElementById('gl');
  if (!palco || !canvas) return;
  // Sem WebGL, com movimento reduzido ou pedido explícito: ficam as imagens renderizadas deste mesmo objeto.
  const temGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2')); } catch { return false; } })();
  const modoRender = qs.get('render');                // gerar as imagens de reserva (heroi | aberta), usado pelo verificador
  if (!modoRender && (!temGL || reduz.matches || qs.has('semgl'))) { raiz.classList.add('sem-gl'); return; }

  // A mola da casa (a mesma curva das transições em CSS, ver --mola em vitrine.css): massa 1, rigidez 170, amortecimento 24.
  // ζ = 24 / (2·√170) = 0,92 → sobe sem pular, ~0,6% de passagem, assenta em ~0,55 s.
  const MOLA = { k: 170, c: 24 };
  function mola(estado, alvo, dt) {             // integração semi-implícita, em subpassos de até 1/120 s
    let t = dt; while (t > 0) { const h = Math.min(t, 1 / 120); const a = MOLA.k * (alvo - estado.x) - MOLA.c * estado.v; estado.v += a * h; estado.x += estado.v * h; t -= h; }
    return estado;
  }
  const suave = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;

  (async () => {
    const THREE = await import('three');
    const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!modoRender });
    renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.08;   // Neutral (Khronos): cor de base preservada, realce suave; o fundo visto pelo vidro não escurece
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;   // a sombra de contato é uma placa macia (sem passe de sombra a cada quadro)
    const dprMax = +(qs.get('dpr') || 2);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprMax));
    renderer.transmissionResolutionScale = 0.75;   // a amostra da transmissão em 3/4 da resolução: mais barata, ainda nítida no vidro

    const cena = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    // Ambiente: a sala do RoomEnvironment escurecida + 3 softboxes de estúdio (reflexos longos e nítidos no vidro e no metal).
    const estudio = new RoomEnvironment(renderer);
    estudio.traverse((o) => { if (o.isMesh && o.material?.isMeshStandardMaterial) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.3); } });   // só a sala e as caixas; as luzes de área ficam
    const softbox = (w, h, x, y, z, ry, forca) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(forca, forca, forca), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); m.rotateZ(ry); estudio.add(m); };
    softbox(3.2, 0.9, -4.2, 4.6, 4.2, 0.15, 14);   // chave: alta, à esquerda, à frente (a mesma luz da página)
    softbox(0.6, 5.0, 5.2, 0.6, -2.4, 0, 8);       // recorte: tira vertical atrás à direita
    softbox(4.0, 0.4, 0.0, -4.4, 2.6, 0, 3.5);     // rebatedor baixo
    softbox(0.9, 4.2, -5.2, 0.6, -3.4, 0, 10);     // tira à esquerda-atrás: o brilho longo nas faces dos vidros na vista aberta
    softbox(2.2, 1.2, 5.0, 2.6, 3.2, 0, 9);        // à direita-frente: o brilho no vidro frontal no herói
    cena.environment = pmrem.fromScene(estudio, 0.02).texture;
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60); camera.position.set(0, 0, 8);

    // ---------- Luzes: uma luz (cima à esquerda, à frente), um recorte por trás à direita ----------
    const chave = new THREE.DirectionalLight(0xfff4e8, 2.2); chave.position.set(-4, 5, 6); chave.castShadow = true;
    chave.shadow.mapSize.set(1024, 1024); chave.shadow.radius = 6; chave.shadow.bias = -0.0004;
    Object.assign(chave.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
    cena.add(chave);
    const recorte = new THREE.DirectionalLight(0xdfe8ff, 1.4); recorte.position.set(5, 2, -5); cena.add(recorte);

    // ---------- Texturas geradas ----------
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    function texCanvas(w, h, desenhar, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; desenhar(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c); t.anisotropy = maxAniso; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; }
    const FONTE = '-apple-system, "SF Pro Display", "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif';
    // anel frontal: gravação em volta (texto branco levemente gasto) e o ponto âmbar da marca
    const texFace = texCanvas(2048, 2048, (g, w) => {
      g.fillStyle = '#141518'; g.fillRect(0, 0, w, w);
      const c = w / 2; g.save(); g.translate(c, c);
      const txt = 'CLARA 35  ·  1:1,4  ·  35 mm  ·  ⌀ 49  ·  7 ELEMENTOS'; g.font = `600 58px ${FONTE}`; g.fillStyle = '#e9e9ec'; g.textBaseline = 'middle';
      let ang = -Math.PI * 0.86; const raio = c * 0.905;
      for (const ch of txt) { const lw = g.measureText(ch).width + 7; g.save(); g.rotate(ang + lw / 2 / raio); g.translate(0, -raio); g.fillText(ch, -lw / 2 + 3.5, 0); g.restore(); ang += lw / raio; }
      g.fillStyle = '#e8873a'; g.beginPath(); g.arc(0, -raio, 0, 0, 0); g.arc(Math.cos(-0.18 * Math.PI) * raio, Math.sin(-0.18 * Math.PI) * raio, 13, 0, Math.PI * 2); g.fill();
      g.restore();
    });
    // escala de distância (no anel liso atrás do foco) e de abertura: texto em faixa que dá a volta no cilindro
    function texFaixa(itens, cor, destaque) { return texCanvas(4096, 192, (g, w, h) => {
      g.fillStyle = '#16171a'; g.fillRect(0, 0, w, h); g.font = `600 92px ${FONTE}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      itens.forEach((s, i) => { const x = (i + 0.5) / itens.length * w * 0.5 + w * 0.25; g.fillStyle = s === destaque ? '#e8873a' : cor; g.fillText(s, x, h / 2);
        g.fillRect(x - 3, 8, 6, 26); });
    }); }
    const texDist = texFaixa(['∞', '5', '3', '2', '1,5', '1', '0,7', '0,5', 'm'], '#d9d9de');
    const texAbert = texFaixa(['16', '11', '8', '5,6', '4', '2,8', '2', '1,4'], '#c9c9cf', '1,4');
    // ruído fino para o anodizado (rugosidade com grão, sem faixas no reflexo)
    const texGrao = texCanvas(512, 512, (g, w, h) => { const im = g.createImageData(w, h); for (let i = 0; i < im.data.length; i += 4) { const v = 150 + Math.random() * 60; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }, false);
    texGrao.wrapS = texGrao.wrapT = THREE.RepeatWrapping; texGrao.repeat.set(6, 2);

    // ---------- Materiais ----------
    const anodizado = new THREE.MeshPhysicalMaterial({ color: 0x1f2024, metalness: 0.62, roughness: 0.34, roughnessMap: texGrao, clearcoat: 0.45, clearcoatRoughness: 0.22, envMapIntensity: 1.1 });
    const serrilha = new THREE.MeshPhysicalMaterial({ color: 0x141518, metalness: 0.7, roughness: 0.3, clearcoat: 0.3, clearcoatRoughness: 0.3 });
    const cromado = new THREE.MeshPhysicalMaterial({ color: 0xd9dbe0, metalness: 1, roughness: 0.12, envMapIntensity: 1.3 });
    const fosco = new THREE.MeshStandardMaterial({ color: 0x060607, roughness: 0.95, metalness: 0 });
    const tinta = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.6, metalness: 0.1 });      // borda pintada dos vidros
    const faceMat = new THREE.MeshPhysicalMaterial({ map: texFace, metalness: 0.5, roughness: 0.38, clearcoat: 0.4, clearcoatRoughness: 0.25 });
    const faixaMat = (tex) => new THREE.MeshPhysicalMaterial({ map: tex, metalness: 0.5, roughness: 0.36, clearcoat: 0.4, clearcoatRoughness: 0.25 });
    const ambar = new THREE.MeshStandardMaterial({ color: 0xe0823a, roughness: 0.45, metalness: 0.1 });
    // vidros: crown (n ≈ 1,52), flint e lantânio (até 1,85); revestimento = iridescência fina (verde/âmbar no reflexo)
    function vidroMat(ior, tom) { return new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.015, transmission: 1, ior, thickness: 0.18,
      specularIntensity: 1, envMapIntensity: 1.5, dispersion: 0.35, iridescence: 0.5, iridescenceIOR: 1.33, iridescenceThicknessRange: [220, 420],
      attenuationColor: new THREE.Color(tom), attenuationDistance: 2.4, side: THREE.FrontSide }); }

    // ---------- Barril (eixo da lente = Z; frente em z = 0, trás em z = -1,6) ----------
    const lente = new THREE.Group(); const corpo = new THREE.Group(); lente.add(corpo);
    const revolver = (pontos, mat, seg = 160) => { const g = new THREE.LatheGeometry(pontos.map(([r, z]) => new THREE.Vector2(r, z)), seg); g.rotateX(Math.PI / 2); return new THREE.Mesh(g, mat); };
    // perfil do corpo (r, z): borda frontal chanfrada, rosca de filtro, corpo, cintura, baioneta
    corpo.add(revolver([[0.80, -0.004], [0.985, -0.004], [1.0, -0.02], [1.0, -0.15], [0.985, -0.165], [0.985, -0.175]], anodizado));
    corpo.add(revolver([[0.97, -0.64], [0.985, -0.66], [0.995, -0.665], [0.995, -0.88], [0.985, -0.885], [0.975, -0.9]], anodizado));
    corpo.add(revolver([[0.975, -1.12], [0.97, -1.14], [0.93, -1.2], [0.92, -1.44], [0.9, -1.45]], anodizado));
    corpo.add(revolver([[0.9, -1.45], [0.86, -1.46], [0.86, -1.62], [0.78, -1.63]], cromado, 120));
    // faixas gravadas: distância (z -0,67 a -0,87) e abertura (z -0,9 a -1,12)
    const faixa = (r, z0, z1, mat) => { const g = new THREE.CylinderGeometry(r, r, z0 - z1, 180, 1, true); g.rotateX(Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.z = (z0 + z1) / 2; m.rotation.z = Math.PI; return m; };
    corpo.add(faixa(0.996, -0.672, -0.878, faixaMat(texDist)));
    corpo.add(faixa(0.982, -0.905, -1.115, faixaMat(texAbert)));
    // anel de foco serrilhado: relevo de verdade na malha (240 sulcos), sob a luz cada aresta brilha
    { const N = 240 * 4, g = new THREE.CylinderGeometry(1.03, 1.03, 0.44, N, 6, true); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); const a = Math.atan2(z, x); const borda = Math.min(1, (0.22 - Math.abs(y)) / 0.03);
        const r = 1.012 + 0.016 * Math.pow(Math.abs(Math.cos(a * 120)), 0.6) * Math.max(0, borda); const k = r / Math.hypot(x, z); p.setX(i, x * k); p.setZ(i, z * k); }
      g.computeVertexNormals(); g.rotateX(Math.PI / 2); const m = new THREE.Mesh(g, serrilha); m.position.z = -0.405; corpo.add(m);
      corpo.add(revolver([[0.985, -0.178], [1.012, -0.185], [1.012, -0.625], [0.985, -0.632]], anodizado)); }
    // filete âmbar fino (a marca), rente à borda frontal
    { const g = new THREE.TorusGeometry(1.001, 0.0045, 8, 220); const m = new THREE.Mesh(g, ambar); m.position.z = -0.12; corpo.add(m); }
    // face frontal com gravação e tubo interno fosco com defletores
    { const g = new THREE.RingGeometry(0.80, 0.985, 160, 1); const m = new THREE.Mesh(g, faceMat); m.position.z = -0.006; corpo.add(m);
      const t = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 96, 1, true); t.rotateX(Math.PI / 2); const tm = new THREE.Mesh(t, new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 1, side: THREE.BackSide })); tm.position.z = -0.81; corpo.add(tm);
      for (const z of [-0.28, -0.55, -1.12, -1.4]) { const d = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.8, 96), new THREE.MeshStandardMaterial({ color: 0x070708, roughness: 1, side: THREE.DoubleSide })); d.position.z = z; corpo.add(d); }
      const fundo = new THREE.Mesh(new THREE.CircleGeometry(0.8, 96), new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 1 })); fundo.position.z = -1.6; corpo.add(fundo); }
    corpo.traverse((o) => { if (o.isMesh) o.castShadow = true; });

    // ---------- Vidros (perfil de revolução: superfície da frente, borda, superfície de trás) ----------
    function elemento(R, t, sF, sB) {   // sF > 0 convexa para a frente; sB > 0 convexa para trás; negativo = côncava
      const pts = []; const n = 24;
      for (let i = 0; i <= n; i++) { const r = R * i / n; pts.push(new THREE.Vector2(r, t / 2 + sF * (1 - (r / R) ** 2))); }
      for (let i = n; i >= 0; i--) { const r = R * i / n; pts.push(new THREE.Vector2(r, -t / 2 - sB * (1 - (r / R) ** 2))); }
      pts.reverse(); const g = new THREE.LatheGeometry(pts, 128); g.rotateX(Math.PI / 2); return g;
    }
    // [n, grupo, R, espessura na borda, flecha frente, flecha trás, ior, tom, z montado, z aberto]
    const VIDROS = [
      [1, 1, 0.78, 0.06, 0.13, 0.02, 1.69, '#eef8f4', -0.13, 1.55],
      [2, 2, 0.68, 0.05, 0.09, -0.07, 1.60, '#f3f6fb', -0.40, 0.80],
      [3, 3, 0.60, 0.05, 0.07, 0.06, 1.72, '#f6f8f2', -0.62, 0.06],
      [4, 3, 0.60, 0.04, -0.06, -0.05, 1.85, '#f8f4ea', -0.745, -0.08],
      [5, 4, 0.54, 0.05, 0.07, 0.06, 1.80, '#f3f6fb', -1.02, -1.40],
      [6, 5, 0.49, 0.05, 0.05, 0.00, 1.69, '#eef8f4', -1.22, -2.10],
      [7, 5, 0.49, 0.03, 0.00, -0.04, 1.52, '#ffffff', -1.31, -2.24],
    ];
    if (qs.get('mutar') === 'vidro') VIDROS.splice(4, 1);
    const vidros = VIDROS.map(([n, grupo, R, t, sF, sB, ior, tom, z0, z1]) => {
      const g = new THREE.Group(); g.userData = { n, grupo, z0, z1, R };
      const m = new THREE.Mesh(elemento(R, t, sF, sB), vidroMat(ior, tom)); g.add(m);
      const borda = new THREE.CylinderGeometry(R + 0.003, R + 0.003, t, 128, 1, true); borda.rotateX(Math.PI / 2); g.add(new THREE.Mesh(borda, tinta));
      g.position.z = z0; lente.add(g); return g;
    });
    // diafragma: 11 lâminas curvas (abertura em polígono de lados curvos, aberta em f/1,4)
    const LAMINAS = 11;
    const diafragma = new THREE.Group(); diafragma.userData = { z0: -0.88, z1: -0.68 };
    { const forma = new THREE.Shape(); forma.absarc(0, 0, 0.66, 0, Math.PI * 2, false);
      const furo = new THREE.Path(); const r = 0.5; for (let k = 0; k <= LAMINAS; k++) { const a = (k / LAMINAS) * Math.PI * 2, b = ((k + 1) / LAMINAS) * Math.PI * 2;
        const p = [r * Math.cos(a), r * Math.sin(a)], q = [r * Math.cos(b), r * Math.sin(b)], m = (a + b) / 2;
        if (k === 0) furo.moveTo(p[0], p[1]); if (k < LAMINAS) furo.quadraticCurveTo(r * 1.06 * Math.cos(m), r * 1.06 * Math.sin(m), q[0], q[1]); }
      forma.holes.push(furo);
      const g = new THREE.ExtrudeGeometry(forma, { depth: 0.012, bevelEnabled: false, curveSegments: 48 });
      diafragma.add(new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: 0x101113, metalness: 0.6, roughness: 0.42, clearcoat: 0.3 })));
      for (let k = 0; k < LAMINAS; k++) { const a = (k / LAMINAS) * Math.PI * 2; const l = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.003, 0.016), new THREE.MeshStandardMaterial({ color: 0x2a2c31, metalness: 0.6, roughness: 0.4 }));
        l.position.set(0.58 * Math.cos(a + 0.2), 0.58 * Math.sin(a + 0.2), 0.008); l.rotation.z = a + 0.2 + 1.2; diafragma.add(l); }
      diafragma.position.z = diafragma.userData.z0; diafragma.traverse((o) => { if (o.isMesh) o.castShadow = true; }); lente.add(diafragma); }
    // sensor (só na vista aberta): placa cerâmica + superfície com difração (iridescência forte)
    const sensor = new THREE.Group(); sensor.userData = { z1: -3.0 };
    { const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.48, 0.05), new THREE.MeshPhysicalMaterial({ color: 0x2d2a26, roughness: 0.55, metalness: 0.1, transparent: true }));
      const chip = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.31, 0.012), new THREE.MeshPhysicalMaterial({ color: 0x1a1d24, metalness: 0.4, roughness: 0.18, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [300, 900], transparent: true }));
      chip.position.z = 0.031; sensor.add(base, chip); sensor.position.z = -3.0; sensor.visible = false; lente.add(sensor); }
    // eixo óptico: a luz reta até o sensor (âmbar, sem tone mapping)
    const eixo = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 5.2, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xe8873a, transparent: true, opacity: 0, toneMapped: false }));
    eixo.rotation.x = Math.PI / 2; eixo.position.z = -0.7; lente.add(eixo);

    const giro = new THREE.Group(); giro.add(lente); cena.add(giro);          // giro = pose (rolagem); inclinação do ponteiro por dentro
    // sombra de contato na vista aberta: placa horizontal com queda radial (macia, como a de estúdio), alinhada ao eixo
    const texSombra = texCanvas(512, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.45, 'rgba(0,0,0,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.setTransform(1, 0, 0, h / w, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, w, w); }, false);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texSombra, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    chao.rotation.x = -Math.PI / 2; cena.add(chao);

    // ---------- Fundo do herói: a paisagem da página, pintada em canvas e já desfocada (f/1,4) ----------
    const fundo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ toneMapped: false, depthWrite: false })); fundo.renderOrder = -1; fundo.position.z = -8; cena.add(fundo);
    const varredura = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ toneMapped: false, depthWrite: false })); varredura.renderOrder = -2; varredura.position.z = -8.2; cena.add(varredura);
    function pintarVarredura(W, H) { const k = cores(); const f = k.fundoRgb.split(/\s+/).map(Number); const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
      const tom = (m, a = 1) => `rgba(${f.map((x) => Math.round(escuro.matches ? x + (255 - x) * (m - 1) * 0.5 : x * m)).join(',')},${a})`;
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, tom(1)); gr.addColorStop(0.47, tom(1)); gr.addColorStop(0.53, tom(escuro.matches ? 1.07 : 0.955)); gr.addColorStop(1, tom(escuro.matches ? 1.02 : 0.985));
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const im = g.getImageData(0, 0, W, H), d = im.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 3; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(im, 0, 0);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
    const cores = () => { const s = getComputedStyle(raiz); const v = (n) => s.getPropertyValue(n).trim(); return { fundo: v('--fundo'), fundoRgb: v('--fundo-rgb'),
      ceu: [v('--ceu-1'), v('--ceu-2'), v('--ceu-3')], sol: v('--sol'), halo: v('--halo'), serra: [v('--serra-1'), v('--serra-2')], mar: [v('--mar-1'), v('--mar-2')], brilho: v('--brilho') }; };
    const SERRA1 = 'M0 548 C120 520 210 470 330 488 C430 503 500 455 610 462 C720 469 790 520 900 512 C1010 504 1080 470 1190 482 C1300 494 1380 535 1480 528 C1540 524 1580 515 1600 512 L1600 612 L0 612 Z';
    const SERRA2 = 'M0 586 C90 570 180 548 280 560 C380 572 450 590 560 584 C700 576 760 556 860 566 C960 576 1010 596 1100 600 C1200 604 1260 592 1360 588 C1460 584 1540 594 1600 590 L1600 614 L0 614 Z';
    function pintarPaisagem(W, H, empilhado) {
      const k = cores(); const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
      const esc = Math.max(W / 1600, H / 900); const ox = (W - 1600 * esc) / 2, oy = H - 900 * esc; // xMidYMax slice, como no SVG
      const cena2 = document.createElement('canvas'); cena2.width = W; cena2.height = H; const s = cena2.getContext('2d');
      s.setTransform(esc, 0, 0, esc, ox, oy);
      let gr = s.createLinearGradient(0, 0, 0, 610); gr.addColorStop(0, k.ceu[0]); gr.addColorStop(0.62, k.ceu[1]); gr.addColorStop(1, k.ceu[2]); s.fillStyle = gr; s.fillRect(-2000, -2000, 5600, 2610);
      const noite = escuro.matches; const sx = 1150, sy = noite ? 150 : 575, sr = noite ? 30 : 62;
      gr = s.createRadialGradient(sx, sy, 0, sx, sy, noite ? 320 : 420); gr.addColorStop(0, k.halo); gr.addColorStop(1, 'transparent'); s.globalAlpha = noite ? 0.5 : 0.95; s.fillStyle = gr; s.fillRect(sx - 450, sy - 450, 900, 900); s.globalAlpha = 1;
      s.fillStyle = k.sol; s.beginPath(); s.arc(sx, sy, sr, 0, Math.PI * 2); s.fill();
      s.fillStyle = k.serra[0]; s.fill(new Path2D(SERRA1)); s.fillStyle = k.serra[1]; s.fill(new Path2D(SERRA2));
      gr = s.createLinearGradient(0, 606, 0, 900); gr.addColorStop(0, k.mar[0]); gr.addColorStop(1, k.mar[1]); s.fillStyle = gr; s.fillRect(-2000, 606, 5600, 1400);
      gr = s.createLinearGradient(1050, 0, 1250, 0); const br = k.brilho; gr.addColorStop(0, 'transparent'); gr.addColorStop(0.5, br); gr.addColorStop(1, 'transparent'); s.globalAlpha = noite ? 0.25 : 0.4; s.fillStyle = gr; s.fillRect(1050, 606, 200, 294); s.globalAlpha = 1;
      let semente = 35; const acaso = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646;
      s.fillStyle = br; for (let i = 0; i < 190; i++) { const t = acaso(), y = 610 + 288 * t ** 1.7, perto = (y - 606) / 294; const col = acaso() < 0.45;
        const x = col ? 1150 + (acaso() - 0.5) * (60 + perto * 260) : acaso() * 1600; const w = (col ? 14 : 22) + perto * (col ? 70 : 140) * acaso(); const h = 0.9 + perto * 2.4;
        s.globalAlpha = col ? 0.35 + 0.55 * acaso() : 0.10 + 0.22 * acaso(); s.beginPath(); s.roundRect(x - w / 2, y, w, h, h / 2); s.fill(); }
      s.globalAlpha = 1;
      // profundidade de campo: o fundo está fora de foco (a lente está em foco)
      g.filter = `blur(${Math.round(5 * esc * (W / innerWidth))}px)`; g.drawImage(cena2, 0, 0); g.filter = 'none';
      // névoa atrás do texto (contraste no pior ponto) e base que se funde ao fundo da página
      const f = k.fundoRgb.split(/\s+/).join(',');
      gr = empilhado ? g.createRadialGradient(W * 0.4, H * 0.24, 0, W * 0.4, H * 0.24, Math.max(W, H) * 0.62) : g.createRadialGradient(W * 0.21, H * 0.6, 0, W * 0.21, H * 0.6, W * 0.5);
      gr.addColorStop(0, `rgba(${f},.72)`); gr.addColorStop(0.55, `rgba(${f},.38)`); gr.addColorStop(1, `rgba(${f},0)`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      gr = g.createLinearGradient(0, H * 0.7, 0, H); gr.addColorStop(0, `rgba(${f},0)`); gr.addColorStop(1, `rgba(${f},1)`); g.fillStyle = gr; g.fillRect(0, H * 0.7, W, H * 0.3);
      // grão contra faixas no degradê
      const im = g.getImageData(0, 0, W, H), d = im.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 5; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(im, 0, 0);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    }

    // ---------- Poses (por formato) ----------
    // Pose pelo espaço livre: a lente montada ocupa o vão ao lado (computador) ou abaixo (empilhado) do texto do herói, e a vista
    // aberta o vão à direita da lista. Tamanho em px na escala 1 (medido nas capturas): montada ≈ 0,60 × altura; aberta ≈ 1,07 × altura.
    const P = () => { const emp = modoRender ? qs.get('formato') === 'empilhado' : innerWidth <= 980;
      const p = emp ? { x0: 0, y0: -0.27, s0: 0.62, yaw0: -0.42, pit0: 0.16, x1: -0.02, y1: 0.2, s1: 0.5, yaw1: -1.12, pit1: 0.1, cam1: 9.2 }
                    : { x0: 0.235, y0: -0.03, s0: 1.0, yaw0: 0.52, pit0: 0.16, x1: 0.17, y1: 0.02, s1: 0.72, yaw1: -1.08, pit1: 0.09, cam1: 8.9 };
      if (modoRender) return p;
      const W = innerWidth, H = innerHeight, N0 = 0.60 * H, N1 = 1.07 * H;
      const caixa = (s) => { const r = document.querySelector(s)?.getBoundingClientRect(); return r ? { right: r.right, bottom: r.bottom + scrollY } : { right: 0, bottom: 0 }; };
      const partes = ['.titulo-heroi', '.sub', '.acoes'].map(caixa);
      if (!emp) { const x = Math.max(...partes.map((r) => r.right)) + 48, livre = W - x - 32, D = Math.min(0.62 * H, livre * 0.92);
        p.s0 = D / N0; p.x0 = (x + livre / 2 - W / 2) / W;
        const xl = Math.max(caixa('.pecas h2').right, caixa('.lista-pecas').right) + 40, livre1 = W - xl - 32;
        p.s1 = Math.min(0.74, livre1 * 0.94 / N1); p.x1 = (xl + livre1 / 2 - W / 2) / W - 0.03 * p.s1; }
      else { const topo = Math.max(...partes.map((r) => r.bottom)) + 28, livre = H - topo - 24, D = Math.max(110, Math.min(livre, W * 0.8));
        p.s0 = D / N0; p.y0 = -((topo + livre / 2) - H / 2) / H; p.s1 = Math.min(0.5, W * 0.88 / N1); }
      return p; };
    const centrar = (p) => (modoRender === 'heroi' ? Object.assign(p, { x0: 0, y0: 0, s0: 1 }) : p);
    let pose = centrar(P()), vw = 1, vh = 1;
    function medir() {
      const r = palco.getBoundingClientRect(); const w = modoRender ? canvas.width / renderer.getPixelRatio() : r.width, h = modoRender ? canvas.height / renderer.getPixelRatio() : r.height;
      if (!modoRender) renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix(); pose = centrar(P());
      vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; vw = vh * camera.aspect;
      const dist = camera.position.z - fundo.position.z, fh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
      fundo.scale.set(fh * camera.aspect, fh, 1);
      if (!modoRender || modoRender === 'heroi-fundo') { const W = Math.round(w * Math.min(devicePixelRatio, 1.5)), H = Math.round(h * Math.min(devicePixelRatio, 1.5));
        const novo = pintarPaisagem(W, H, innerWidth <= 980); fundo.material.map?.dispose(); fundo.material.map = novo; fundo.material.needsUpdate = true; }
      { const nv = pintarVarredura(Math.round(w), Math.round(h)); varredura.material.map?.dispose(); varredura.material.map = nv; varredura.material.needsUpdate = true; }
      renderer.setClearColor(new THREE.Color(cores().fundo), 1);
    }

    // ---------- Estado e quadro ----------
    const secao = document.querySelector('.abertura');
    const prog = { x: 0, v: 0 }, incl = { x: 0, v: 0 }, incl2 = { x: 0, v: 0 }, intro = { x: modoRender ? 0 : 1, v: 0 };
    let alvoIncl = 0, alvoIncl2 = 0, ultimo = performance.now(), pendente = false;
    const alvoProg = () => { const r = secao.getBoundingClientRect(); return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))); };
    const tags = [...document.querySelectorAll('.tags .tag')];
    function aplicar(p, rolagemPx) {
      const a = suave(0.0, 0.40, p);                 // giro: herói → de lado
      const e = suave(0.16, 0.48, p);                // explosão dos vidros
      const b = suave(0.10, 0.40, p);                // o barril sai por trás
      const s = mix(pose.s0, pose.s1, a);
      camera.position.z = mix(8, pose.cam1, a); medir2();
      giro.position.set(mix(pose.x0, pose.x1, a) * vw, mix(pose.y0, pose.y1, a) * vh, 0);
      giro.rotation.set(mix(pose.pit0, pose.pit1, a) + incl.x - 0.12 * intro.x, mix(pose.yaw0, pose.yaw1, a) + incl2.x + 0.7 * intro.x, 0);
      giro.scale.setScalar(s * (1 - 0.08 * intro.x));
      lente.position.z = mix(0, 0.62, e);           // centra a pilha aberta no giro
      for (const v of vidros) v.position.z = mix(v.userData.z0, v.userData.z1, e);
      diafragma.position.z = mix(diafragma.userData.z0, diafragma.userData.z1, e);
      corpo.visible = b < 0.98;
      corpo.position.z = -7.5 * b * b;            // o barril desliza para trás pelo eixo (como uma luva) e sai do quadro: nada de fantasma
      sensor.visible = e > 0.6; sensor.traverse((o) => { if (o.isMesh) o.material.opacity = suave(0.6, 0.95, e); });
      eixo.material.opacity = suave(0.7, 1, e) * 0.9;
      chao.material.opacity = 0.5 * suave(0.35, 0.6, p); chao.position.set(giro.position.x, giro.position.y - 0.95 * s, 0); chao.scale.set(5.6 * s, 1.5 * s, 1); chao.rotation.z = -mix(pose.yaw0, pose.yaw1, a) * 0 + 0;
      { const d = camera.position.z - fundo.position.z, fh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d; fundo.scale.set(fh * camera.aspect * 1.02, fh * 1.02, 1); varredura.scale.set(fh * camera.aspect * 1.06, fh * 1.06, 1); }
      fundo.position.y = (rolagemPx / innerHeight) * (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - fundo.position.z));
      fundo.visible = rolagemPx < innerHeight * 1.1;
      // etiquetas em HTML (texto nítido), presas ao topo de cada grupo
      const ve = new THREE.Vector3(); const grupos = { 1: [vidros[0]], 2: [vidros[1]], 3: [vidros[2], vidros[3]], 4: [vidros[4]], 5: [vidros[5], vidros[6]] };
      tags.forEach((tg) => { const gs = grupos[tg.dataset.grupo]; ve.set(0, 0, 0); for (const g of gs) ve.add(g.getWorldPosition(new THREE.Vector3())); ve.divideScalar(gs.length);
        const R = gs[0].userData.R * s; ve.y += R + 0.22 * s; ve.project(camera);
        tg.style.transform = `translate(${((ve.x + 1) / 2 * 100).toFixed(2)}cqw, ${((1 - ve.y) / 2 * 100).toFixed(2)}cqh) translate(-50%, -100%)`; tg.style.opacity = suave(0.82, 1, e).toFixed(3); });
    }
    function medir2() { vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; vw = vh * camera.aspect; camera.updateProjectionMatrix(); }
    function quadro(agora) {
      pendente = false; const dt = Math.min(0.064, (agora - ultimo) / 1000); ultimo = agora;
      mola(prog, alvoProg(), dt); mola(incl, alvoIncl, dt); mola(incl2, alvoIncl2, dt); mola(intro, 0, dt);
      // resolução adaptativa: em movimento, 1,25×; parado, um quadro nítido em até 2× (o olho só vê detalhe no que está parado)
      const movendo = Math.abs(prog.v) + Math.abs(incl.v) + Math.abs(incl2.v) + Math.abs(intro.v) > 0.02;
      const dpr = Math.min(devicePixelRatio || 1, movendo ? 1.25 : dprMax); if (renderer.getPixelRatio() !== dpr) { renderer.setPixelRatio(dpr); renderer.setSize(palco.clientWidth, palco.clientHeight, false); }
      aplicar(prog.x, scrollY); renderer.render(cena, camera);
      if (!primeiro) { primeiro = true; raiz.classList.add('gl-ativo'); }
      if (Math.abs(prog.x - alvoProg()) > 1e-4 || Math.abs(prog.v) > 1e-4 || Math.abs(incl.v) + Math.abs(incl2.v) > 1e-4 || Math.abs(incl.x - alvoIncl) + Math.abs(incl2.x - alvoIncl2) > 1e-4 || Math.abs(intro.x) + Math.abs(intro.v) > 1e-4) pedir();
    }
    let primeiro = false;
    const pedir = () => { if (!pendente) { pendente = true; requestAnimationFrame(quadro); } };

    if (modoRender) {           // imagem de reserva: renderiza uma pose fixa e entrega o PNG
      const [W, H] = (qs.get('tam') || '1200x1200').split('x').map(Number); renderer.setPixelRatio(1); renderer.setSize(W, H, false);
      const transparente = qs.get('fundo') === 'transparente';
      if (transparente) { renderer.setClearColor(0x000000, 0); fundo.visible = false; }
      medir(); if (transparente) { renderer.setClearColor(0x000000, 0); }
      const p = modoRender === 'aberta' ? 1 : 0; prog.x = p; aplicar(p, modoRender === 'aberta' ? 99999 : 0);
      if (transparente) { fundo.visible = false; varredura.visible = false; } tags.forEach((t) => (t.style.opacity = 0));
      renderer.render(cena, camera);
      window.__render = canvas.toDataURL(qs.get('img') === 'png' ? 'image/png' : 'image/webp', 0.9); return;   // WebP com alfa: imagem de reserva leve
    }
    medir(); ultimo = performance.now(); pedir();
    document.fonts?.ready.then(() => { medir(); pedir(); });   // a pose depende da largura real do texto
    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', () => { medir(); pedir(); });
    escuro.addEventListener('change', () => { medir(); pedir(); });
    const fino = matchMedia('(hover: hover) and (pointer: fine)');
    addEventListener('pointermove', (ev) => { if (!fino.matches || ev.pointerType !== 'mouse') return;
      alvoIncl2 = ((ev.clientX / innerWidth) - 0.5) * 0.14; alvoIncl = ((ev.clientY / innerHeight) - 0.5) * 0.1; pedir(); }, { passive: true });
    // ganchos para a prova (filmstrip determinístico: avança a mola em passos fixos e desenha)
    window.__vitrine = { avancar(ms) { const t0 = ultimo; for (let t = 0; t < ms; t += 16) { mola(prog, alvoProg(), 0.016); mola(intro, 0, 0.016); } ultimo = t0; aplicar(prog.x, scrollY); renderer.render(cena, camera); return prog.x; },
      parar() { pendente = true; }, girar(rad) { incl2.x = rad; incl2.v = 0; aplicar(prog.x, scrollY); renderer.render(cena, camera); },
      caixa() { const b = new THREE.Box3().setFromObject(lente); const c = [...Array(8)].map((_, i) => new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).project(camera)); const r = palco.getBoundingClientRect();
        const xs = c.map((p) => (p.x + 1) / 2 * r.width), ys = c.map((p) => (1 - p.y) / 2 * r.height); return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }; }, progresso: () => ({ atual: prog.x, alvo: alvoProg() }),
      contagem: { vidros: vidros.length, grupos: new Set(vidros.map((v) => v.userData.grupo)).size, laminas: LAMINAS, numeros: vidros.map((v) => v.userData.n) } };
  })().catch((e) => { raiz.classList.add('sem-gl'); (window.__errosJs || []).push('lente3d: ' + e.message); });
}
if (document.readyState === 'complete') setTimeout(iniciarLente, 0); else addEventListener('load', () => setTimeout(iniciarLente, 0), { once: true });

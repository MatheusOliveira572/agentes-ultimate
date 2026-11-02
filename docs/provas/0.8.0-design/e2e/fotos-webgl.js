// "Fotos" do caso B renderizadas por shader próprio (WebGL 1), sem foto, modelo nem arte de terceiros (hd103).
// Cada cena é calculada por pixel: céu com dispersão do sol e nuvens por ruído fractal; mar com ondas, reflexo de Fresnel
// (F0 0,02) e brilho do sol; praia com areia, faixa molhada e espuma; morros em camadas com perspectiva aérea; cena
// subaquática com raios e cáusticas; píer à noite com luminárias e reflexo; fogueira na areia. Pós: exposição, mapeamento de
// tons ACES (aproximação de Narkowicz), vinheta e grão. Uso: Fotos.render(nome, semente, larguraPx, alturaPx) → canvas 2D.
// Sem WebGL, devolve null (a página cai na pintura em canvas, declarada como ilustração).
(function () {
  'use strict';
  const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uExpo, uTipo, uSemente, uNuvem, uNoite, uCamH, uPitch, uCalma;
uniform vec3 uSol, uSolCor, uCeuZ, uCeuH, uAgua, uAreia, uM0, uM1, uM2;
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float ruido(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 4; i++) { s += a * ruido(p); p = m * p; a *= 0.5; } return s; }
float fbm3(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 3; i++) { s += a * ruido(p); p = m * p; a *= 0.5; } return s; }
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

vec3 ceu(vec3 rd){
  float y = max(rd.y, 0.0);
  vec3 c = mix(uCeuH, uCeuZ, pow(y, 0.5));
  float s = max(dot(rd, uSol), 0.0);
  c += uSolCor * (pow(s, 6.0) * 0.18 + pow(s, 48.0) * 0.45 + pow(s, 900.0) * 1.5);
  c += uSolCor * smoothstep(0.99955, 0.99975, s) * 9.0;                         // disco do sol
  if (rd.y > 0.005 && uNuvem > 0.0) {
    vec2 q = rd.xz / (rd.y + 0.06) * 0.9 + vec2(uSemente * 3.1, uSemente * 1.7);
    float d = fbm(q * 1.4 + vec2(0.0, fbm3(q * 0.7) * 1.5));
    d = smoothstep(0.62 - uNuvem * 0.28, 1.0, d);
    float lu = 0.55 + 0.9 * pow(s, 3.0);
    vec3 cn = mix(uCeuH * 0.95 + vec3(0.05), uSolCor * 0.7 + uCeuH * 0.6, 0.5 + 0.5 * pow(s, 2.0)) * lu;
    cn = mix(cn, cn * 0.62, smoothstep(0.55, 1.0, d));                         // base mais escura das nuvens densas
    c = mix(c, cn, d * smoothstep(0.0, 0.2, rd.y) * uNuvem);
  }
  if (uNoite > 0.5) {
    vec2 g = rd.xy / (rd.z + 1.0) * 160.0; vec2 ce = floor(g); float st = h21(ce);
    vec2 pos = vec2(h21(ce + 1.7), h21(ce + 5.3)) * 0.8 + 0.1; float raio = 0.035 + 0.05 * h21(ce + 9.1);
    c += vec3(0.8, 0.85, 1.0) * step(0.965, st) * smoothstep(raio, 0.0, length(fract(g) - pos)) * (0.5 + 1.2 * h21(ce + 3.1)) * smoothstep(0.02, 0.35, rd.y);
  }
  return c;
}
// morros: três camadas por azimute (longe, meio, perto), com textura de mata e névoa
float perfil(float az, float k, float base, float amp){ return base + amp * fbm(vec2(az * k + uSemente * 5.3, k * 1.7)); }
vec4 morros(vec3 rd){
  float az = atan(rd.x, rd.z); vec4 r = vec4(0.0);
  if (uTipo < 1.5 || uTipo > 3.5) return r;
  float e2 = perfil(az, 2.2, 0.015, 0.11), e1 = perfil(az, 4.0, uTipo > 2.5 ? -0.01 : -0.03, uTipo > 2.5 ? 0.09 : 0.16), e0 = perfil(az, 6.5, -0.12, uTipo > 2.5 ? 0.0 : 0.17);
  float tx = fbm(vec2(az * 90.0, rd.y * 70.0)), tg = fbm(vec2(az * 22.0, rd.y * 18.0));
  float lado = 0.5 + 0.5 * sin(az * 9.0 + tg * 5.0 + uSemente);                       // encostas viradas para o sol
  vec3 haze = uCeuH;
  if (rd.y < e2) { vec3 c2 = uM2 * (0.85 + 0.3 * tg); c2 = mix(c2, haze, 0.35 + 0.45 * smoothstep(0.0, 0.07, e2 - rd.y)); r = vec4(c2, 1.0); }
  if (rd.y < e1) { vec3 c1 = uM1 * (0.55 + 0.55 * tx) * (0.7 + 0.6 * tg) * (0.75 + 0.5 * lado); c1 += uSolCor * 0.06 * smoothstep(0.012, 0.0, e1 - rd.y);
    c1 = mix(c1, haze, 0.12 + 0.4 * smoothstep(0.02, 0.12, e1 - rd.y)); r = vec4(c1, 1.0); }
  if (uTipo < 2.5 && rd.y < e0) { vec3 c0 = uM0 * (0.45 + 0.75 * tx) * (0.65 + 0.7 * tg) * (0.7 + 0.6 * lado);
    c0 = mix(c0, haze, 0.10 * smoothstep(0.03, 0.0, e0 - rd.y)); r = vec4(c0, 1.0); }
  return r;
}
vec3 ceuEMorros(vec3 rd){ vec3 c = ceu(rd); vec4 m = morros(rd); return mix(c, m.rgb, m.a); }

vec3 agua(vec3 ro, vec3 rd){
  float t = -ro.y / rd.y; vec3 p = ro + rd * t;
  vec2 w = p.xz * vec2(0.55, 1.1) + uSemente * 9.0; float e = 0.06;
  float h0 = fbm(w), hx = fbm(w + vec2(e, 0.0)), hz = fbm(w + vec2(0.0, e));
  float forca = (1.0 - uCalma) * 2.6 + 0.25;
  vec3 n = normalize(vec3((h0 - hx) / e * forca * 0.12, 1.0, (h0 - hz) / e * forca * 0.12));
  n = normalize(mix(n, vec3(0.0, 1.0, 0.0), clamp(t / 260.0, 0.0, 0.85)));
  vec3 r = reflect(rd, n); r.y = abs(r.y) + 0.002;
  float f = 0.02 + 0.98 * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
  vec3 c = mix(uAgua * (0.8 + 0.4 * h0), ceuEMorros(r), f);
  c += uSolCor * pow(max(dot(r, uSol), 0.0), 260.0) * 6.0;                      // caminho de brilho do sol
  return mix(c, uCeuH, 1.0 - exp(-t * 0.0035));
}
vec3 areia(vec3 p, vec3 rd, float zs){
  float g = fbm(p.xz * 3.0) * 0.5 + fbm(p.xz * 24.0) * 0.5;
  vec3 c = uAreia * (0.78 + 0.32 * g) * (0.45 + 0.75 * clamp(uSol.y * 2.0 + 0.35, 0.0, 1.0));
  c += uAreia * 0.04 * sin(p.z * 22.0 + g * 6.0);                                // marcas do vento
  float molhada = smoothstep(zs - 1.6, zs - 0.2, p.z);
  vec3 r = reflect(rd, vec3(0.0, 1.0, 0.0));
  c = mix(c, c * 0.55 + ceu(r) * 0.35, molhada);
  float espuma = smoothstep(zs - 0.25, zs, p.z) * smoothstep(zs + 0.35, zs, p.z) * (0.55 + 0.6 * fbm(p.xz * vec2(9.0, 3.0)));
  return mix(c, vec3(0.92, 0.95, 0.96) * (0.7 + 0.5 * clamp(uSol.y * 2.0 + 0.3, 0.0, 1.0)), clamp(espuma, 0.0, 1.0));
}
vec3 subaquatico(vec3 ro, vec3 rd){
  vec3 c = mix(vec3(0.004, 0.035, 0.07), vec3(0.06, 0.32, 0.42), smoothstep(-0.7, 0.75, rd.y));
  float raio = fbm3(vec2(rd.x / (rd.y + 1.35) * 7.0 + uSemente * 4.0, 0.5));
  c += vec3(0.18, 0.36, 0.38) * pow(raio, 3.5) * 2.2 * smoothstep(-0.25, 0.9, rd.y);
  c += vec3(0.5, 0.7, 0.7) * pow(max(dot(rd, normalize(vec3(0.15, 1.0, 0.35))), 0.0), 18.0) * 0.6;
  if (rd.y > 0.25) { vec2 sp = rd.xz / rd.y * 3.0 + uSemente; float ond = pow(abs(sin(fbm(sp * 2.0) * 9.0)), 5.0); c += vec3(0.4, 0.62, 0.62) * ond * smoothstep(0.25, 0.7, rd.y) * 0.7; }
  if (rd.y < -0.02) {
    float t = (-2.6 - ro.y) / rd.y; vec3 p = ro + rd * t;
    float ca = pow(abs(sin(fbm(p.xz * 1.6 + uSemente) * 11.0)), 6.0) + pow(abs(sin(fbm(p.xz * 2.3 + 4.0) * 9.0)), 8.0);
    vec3 fundo = vec3(0.5, 0.45, 0.32) * (0.22 + 0.5 * ca) * (0.6 + 0.6 * fbm(p.xz * 6.0));
    c = mix(c, fundo, exp(-t * 0.09));
  }
  vec2 g = rd.xy / rd.z * 60.0; float bolha = step(0.993, h21(floor(g) + uSemente)) * smoothstep(0.45, 0.0, length(fract(g) - 0.5));
  return c + vec3(0.35, 0.5, 0.55) * bolha * 0.5;
}
// luminárias do píer: a cada 6 m dos dois lados, a 2,6 m de altura
vec3 piso(vec3 ro, vec3 rd){
  vec3 c = vec3(0.0);
  if (rd.y < 0.0) {
    float t = (0.0 - ro.y + 1.0) / rd.y * -1.0; t = (1.0 - ro.y) / rd.y; vec3 p = ro + rd * t;
    if (abs(p.x) < 1.35 && p.z > 0.0 && p.z < 70.0) {
      float tabua = smoothstep(0.0, 0.03, fract(p.x * 4.0)) * smoothstep(1.0, 0.97, fract(p.x * 4.0));
      vec3 madeira = vec3(0.16, 0.11, 0.075) * (0.45 + 0.7 * fbm(vec2(p.x * 4.0, p.z * 0.6))) * (0.55 + 0.45 * fbm(vec2(p.x * 40.0, p.z * 3.0))) * (0.25 + 0.75 * tabua);
      vec3 luz = vec3(0.0);
      for (int k = 0; k < 10; k++) { float z = 3.0 + float(k) * 6.0; for (int lado = 0; lado < 2; lado++) {
        vec3 l = vec3(lado == 0 ? -1.25 : 1.25, 2.6, z); float d2 = dot(l - p, l - p); luz += vec3(1.0, 0.7, 0.36) * 1.6 / (1.0 + d2 * 2.2); } }
      return madeira * (0.04 + luz);
    }
    float tw = -ro.y / rd.y; vec3 pw = ro + rd * tw;
    vec2 w = pw.xz * vec2(0.6, 1.2) + uSemente * 9.0; float e = 0.06; float h0 = fbm3(w), hx = fbm3(w + vec2(e, 0.0)), hz = fbm3(w + vec2(0.0, e));
    vec3 n = normalize(vec3((h0 - hx) / e * 0.35, 1.0, (h0 - hz) / e * 0.35)); vec3 r = reflect(rd, n);
    c = uAgua + ceu(vec3(r.x, abs(r.y), r.z)) * 0.25;
    for (int k = 0; k < 10; k++) { float z = 3.0 + float(k) * 6.0; for (int lado = 0; lado < 2; lado++) {
      vec3 l = normalize(vec3(lado == 0 ? -1.25 : 1.25, 2.6 - 2.0 * 2.6, z) - vec3(ro.x, -ro.y, ro.z) * 0.0 - ro);
      vec3 lm = normalize(vec3(lado == 0 ? -1.25 : 1.25, -2.6, z) - ro);
      vec2 dd = vec2(atan(r.x, r.z) - atan(lm.x, lm.z), (-r.y) - lm.y);
      c += vec3(1.0, 0.68, 0.32) * exp(-(dd.x * dd.x) / 0.00002 - (dd.y * dd.y) / 0.004) * 1.4 / (1.0 + z * 0.04);
    } }
    return mix(c, uCeuH, 1.0 - exp(-tw * 0.01));
  }
  return c;
}
vec3 lampadas(vec3 ro, vec3 rd){
  vec3 c = vec3(0.0);
  for (int k = 0; k < 10; k++) { float z = 3.0 + float(k) * 6.0; for (int lado = 0; lado < 2; lado++) {
    vec3 l = vec3(lado == 0 ? -1.25 : 1.25, 2.6, z) - ro; float dl = length(l); vec3 ld = l / dl;
    float a = max(dot(rd, ld), 0.0);
    c += vec3(1.0, 0.78, 0.45) * (pow(a, 400000.0 / (dl + 1.0)) * 5.0 + pow(a, 9000.0) * 0.18) / (1.0 + dl * 0.35);
    // poste: traço escuro do chão até a luminária
    vec3 b = vec3(lado == 0 ? -1.25 : 1.25, 1.0, z) - ro; vec3 bd = normalize(b);
    float ax = atan(rd.x, rd.z) - atan(ld.x, ld.z);
    if (abs(ax) < 0.0022 / (dl * 0.12 + 0.2) && rd.y < ld.y && rd.y > bd.y) c = vec3(-1.0);
  } }
  return c;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 ro = vec3(0.0, uCamH, 0.0);
  vec3 rd = normalize(vec3(uv.x, uv.y + uPitch, 1.45));
  vec3 col;
  if (uTipo > 3.5 && uTipo < 4.5) col = subaquatico(ro, rd);
  else if (uTipo > 4.5 && uTipo < 5.5) {
    col = ceu(rd); if (rd.y < 0.0) col = piso(ro, rd);
    vec3 l = lampadas(ro, rd); if (l.x < 0.0) col *= 0.08; else col += l;
  } else {
    col = ceuEMorros(rd);
    if (rd.y < 0.0) {
      vec4 m = morros(rd);
      if (m.a > 0.0 && uTipo < 2.5) col = m.rgb;
      else if (uTipo > 0.5 && uTipo < 1.5 || uTipo > 5.5) {
        float t = -ro.y / rd.y; vec3 p = ro + rd * t; float zs = 6.5 + 1.4 * fbm3(vec2(p.x * 0.12, uSemente * 3.0));
        col = p.z < zs ? areia(p, rd, zs) : agua(ro, rd);
      } else if (uTipo < 2.5 && uTipo > 1.5) col = m.rgb;
      else col = agua(ro, rd);
    }
    if (uTipo > 5.5) {                                                            // fogueira a 5 m, na areia
      vec3 f = vec3(0.2, 0.0, 5.0); vec3 d = normalize(f - ro); vec2 uvF = d.xy * 1.45 / d.z - vec2(0.0, uPitch);
      vec2 q = (uv - uvF) / 0.11; q.y -= 0.05;
      float larg = 0.42 * pow(clamp(1.0 - q.y / 1.7, 0.0, 1.0), 1.4) * smoothstep(-0.15, 0.1, q.y);
      float ch = fbm(vec2(q.x * 2.4, q.y * 1.6 - uSemente * 4.0));
      float chama = smoothstep(larg + 0.05, larg - 0.18, abs(q.x + (ch - 0.5) * 0.35 * q.y)) * smoothstep(1.9, 0.5, q.y + ch * 0.6) * step(-0.12, q.y);
      vec3 fc = mix(vec3(1.0, 0.25, 0.04), vec3(1.0, 0.85, 0.45), smoothstep(0.2, 0.95, chama * (1.2 - q.y * 0.4)));
      col += fc * chama * 3.4 + vec3(1.0, 0.38, 0.1) * 0.3 * exp(-length(uv - uvF - vec2(0.0, 0.08)) * 8.0);
      if (rd.y < 0.0) { float t = -ro.y / rd.y; vec3 p = ro + rd * t; col += vec3(1.0, 0.42, 0.12) * uAreia * 1.6 / (1.0 + dot(p - f, p - f) * 3.0); }
      vec2 g = (uv - uvF) * vec2(70.0, 45.0); float fa = step(0.986, h21(floor(g) + uSemente)) * smoothstep(0.22, 0.0, length(fract(g) - 0.5)) * smoothstep(-0.1, 1.2, (uv - uvF).y * 6.0) * smoothstep(0.5, 0.0, length(uv - uvF) * 1.6);
      col += vec3(1.0, 0.6, 0.2) * fa * 1.6;
      vec2 t1 = vec2(q.x * 0.94 - q.y * 0.34, q.x * 0.34 + q.y * 0.94 + 0.08), t2 = vec2(q.x * 0.94 + q.y * 0.34, -q.x * 0.34 + q.y * 0.94 + 0.08);   // dois troncos cruzados
      float tr = min(length(vec2(max(abs(t1.x) - 0.55, 0.0), t1.y)), length(vec2(max(abs(t2.x) - 0.55, 0.0), t2.y)));
      col = mix(col, vec3(0.05, 0.025, 0.015) + fc * 0.25 * smoothstep(0.1, -0.05, q.y + 0.02), smoothstep(0.085, 0.06, tr));
    }
  }
  col = aces(col * uExpo);
  col = pow(col, vec3(1.0 / 2.2));
  col *= 1.0 - 0.28 * dot(uv * 0.85, uv * 0.85);                                   // vinheta de lente
  col += (h21(gl_FragCoord.xy + uSemente * 17.0) - 0.5) * 0.028;                   // grão (também tira faixas do degradê)
  gl_FragColor = vec4(col, 1.0);
}`;
  const lin = (hex, k = 1) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.pow(v / 255, 2.2) * k); };
  const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  const CENAS = {
    'Praia ao nascer do sol': { expo: 0.85, tipo: 1, sol: [0.15, 0.05, 1], solCor: lin('#ffd2a0', 3.0), z: lin('#6f8fbf'), h: lin('#f3c6a0'), agua: lin('#1a4456'), areia: lin('#d8c09c'), nuvem: 0.7, camH: 1.5, pitch: -0.06 },
    'Mergulho': { tipo: 4, sol: [0, 1, 0], solCor: lin('#ffffff'), z: lin('#000000'), h: lin('#0b3a4a'), agua: lin('#0b3a4a'), areia: lin('#bba57a'), nuvem: 0, camH: 0, pitch: 0.05 },
    'Trilha': { tipo: 2, sol: [-0.5, 0.45, 1], solCor: lin('#fff1d8', 2.2), z: lin('#7ea6cf'), h: lin('#dfe7e3'), agua: lin('#1a4456'), areia: lin('#999'), m0: lin('#1d3520'), m1: lin('#3b6440'), m2: lin('#86a38c'), nuvem: 0.5, camH: 2, pitch: 0.06 },
    'Pôr do sol': { tipo: 0, sol: [0.0, 0.022, 1], solCor: lin('#ffb066', 4.2), z: lin('#2a2150'), h: lin('#ef8a4c'), agua: lin('#140d22'), areia: lin('#999'), nuvem: 0.75, camH: 1.8, pitch: 0.02 },
    'Noite no píer': { expo: 1.2, tipo: 5, sol: [0, -1, 0], solCor: lin('#000000'), z: lin('#02040c'), h: lin('#1c2444'), agua: lin('#02050c'), areia: lin('#999'), nuvem: 0, noite: 1, camH: 1.7, pitch: -0.02 },
    'Areia branca': { expo: 0.72, tipo: 1, sol: [0.35, 0.8, 1], solCor: lin('#fff6e6', 2.4), z: lin('#2f7ec8'), h: lin('#cfe5f1'), agua: lin('#0b8890'), areia: lin('#efe3cf'), nuvem: 0.4, camH: 1.6, pitch: -0.08 },
    'Lagoa': { tipo: 3, sol: [0.5, 0.55, 1], solCor: lin('#fff2dc', 2.2), z: lin('#6aa2cd'), h: lin('#d4e2df'), agua: lin('#0c4a44'), areia: lin('#999'), m0: lin('#1d3520'), m1: lin('#2e5a37'), m2: lin('#7d9c86'), nuvem: 0.5, calma: 0.75, camH: 1.4, pitch: -0.03 },
    'Fogueira': { tipo: 6, sol: [0, -1, 0], solCor: lin('#000000'), z: lin('#03040a'), h: lin('#1a1424'), agua: lin('#03040a'), areia: lin('#a9845e'), nuvem: 0, noite: 1, camH: 1.3, pitch: -0.12 }
  };
  let gl = null, prog = null, canvasGL = null;
  function iniciar() {
    if (gl !== null) return !!prog;
    canvasGL = document.createElement('canvas');
    gl = canvasGL.getContext('webgl', { preserveDrawingBuffer: true, antialias: false }) || false;
    if (!gl) return false;
    const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; } return s; };
    const v = sh(gl.VERTEX_SHADER, VERT), f = sh(gl.FRAGMENT_SHADER, FRAG); if (!v || !f) return false;
    prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); prog = null; return false; }
    gl.useProgram(prog);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return true;
  }
  function render(nome, semente, w, h, destino) {
    if (!iniciar() || !CENAS[nome]) return null;
    const c = CENAS[nome]; const r = (k) => { const x = Math.sin(semente * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
    canvasGL.width = w; canvasGL.height = h; gl.viewport(0, 0, w, h);
    const u = (n) => gl.getUniformLocation(prog, n);
    const sol = norm([c.sol[0] + (r(1) - 0.5) * 0.35, c.sol[1], c.sol[2]]);
    gl.uniform2f(u('uRes'), w, h); gl.uniform1f(u('uTipo'), c.tipo); gl.uniform1f(u('uSemente'), r(2) * 10);
    gl.uniform1f(u('uNuvem'), c.nuvem * (0.75 + r(3) * 0.5)); gl.uniform1f(u('uNoite'), c.noite || 0); gl.uniform1f(u('uCamH'), c.camH * (0.85 + r(4) * 0.3));
    gl.uniform1f(u('uPitch'), c.pitch); gl.uniform1f(u('uExpo'), c.expo || 1.0); gl.uniform1f(u('uCalma'), c.calma || 0);
    gl.uniform3fv(u('uSol'), sol); gl.uniform3fv(u('uSolCor'), c.solCor); gl.uniform3fv(u('uCeuZ'), c.z); gl.uniform3fv(u('uCeuH'), c.h);
    gl.uniform3fv(u('uAgua'), c.agua); gl.uniform3fv(u('uAreia'), c.areia);
    gl.uniform3fv(u('uM0'), c.m0 || [0, 0, 0]); gl.uniform3fv(u('uM1'), c.m1 || [0, 0, 0]); gl.uniform3fv(u('uM2'), c.m2 || [0, 0, 0]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const out = destino || document.createElement('canvas'); out.width = w; out.height = h;
    out.getContext('2d').drawImage(canvasGL, 0, 0); return out;
  }
  window.Fotos = { render, disponivel: () => iniciar(), cenas: Object.keys(CENAS) };
})();

/** Imagens SVG geradas como data URI para alimentar `feImage` (mapas de deslocamento, máscaras). */

const toUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`

const open = (width: number, height: number) => `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>`

/** Disco branco opaco — serve de máscara e, desfocado, de mapa de altura (cúpula) para iluminação. */
function discUri(cx: number, cy: number, radius: number, width: number, height: number): string {
  return toUri(`${open(width, height)}<circle cx='${cx}' cy='${cy}' r='${radius}' fill='#fff'/></svg>`)
}

/**
 * Cúpula (hemisfério): branco com alpha z = sqrt(1 - t²), t = distância ao centro / raio.
 * Alpha 1 no centro e 0 na borda, com a borda do círculo nítida — serve direto de mapa de altura.
 */
function domeUri(cx: number, cy: number, radius: number, width: number, height: number): string {
  const stops = [0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 1]
    .map((stopOffset) => `<stop offset='${stopOffset}' stop-color='#fff' stop-opacity='${Math.sqrt(1 - stopOffset * stopOffset).toFixed(3)}'/>`)
    .join('')
  return toUri(
    `${open(width, height)}<defs><radialGradient id='d' cx='${cx}' cy='${cy}' r='${radius}' gradientUnits='userSpaceOnUse'>${stops}</radialGradient></defs>` +
      `<circle cx='${cx}' cy='${cy}' r='${radius}' fill='url(#d)'/></svg>`,
  )
}

/**
 * Mapa de refração de uma esfera: cinza 50% (= sem deslocamento) fora do círculo e, dentro dele,
 * R cresce da esquerda para a direita e G de cima para baixo. Com `feDisplacementMap` isso comprime a
 * imagem em direção ao centro, como uma bola de vidro.
 */
function sphereMapUri(cx: number, cy: number, radius: number, width: number, height: number): string {
  const x = cx - radius
  const y = cy - radius
  const diameter = radius * 2
  return toUri(
    `${open(width, height)}<defs>` +
      `<linearGradient id='gx' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>` +
      `<linearGradient id='gy' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>` +
      `<clipPath id='c'><circle cx='${cx}' cy='${cy}' r='${radius}'/></clipPath></defs>` +
      `<rect width='${width}' height='${height}' fill='#808080'/>` +
      `<g clip-path='url(#c)'>` +
      `<rect x='${x}' y='${y}' width='${diameter}' height='${diameter}' fill='#000'/>` +
      `<rect x='${x}' y='${y}' width='${diameter}' height='${diameter}' fill='url(#gx)'/>` +
      `<rect x='${x}' y='${y}' width='${diameter}' height='${diameter}' fill='url(#gy)' style='mix-blend-mode:screen'/>` +
      `</g></svg>`,
  )
}

/**
 * Lente (esfera de vidro): o mesmo mapa de `sphereMapUri`, mas com o miolo neutralizado por um disco cinza
 * cujo alpha vai de 1 no centro a 0 na borda: `1 - t^falloff`. Como `lerp(cinza, gradiente, m)` = 0.5 + 0.5·a·m,
 * o deslocamento fica radial e cresce com `t^falloff`: ~0 no miolo e máximo na borda, onde a luz se curva.
 */
function lensMapUri(cx: number, cy: number, radius: number, width: number, height: number, falloff: number): string {
  const x = cx - radius
  const y = cy - radius
  const diameter = radius * 2
  const stops = [0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 1]
    .map((stopOffset) => `<stop offset='${stopOffset}' stop-color='#808080' stop-opacity='${(1 - stopOffset ** falloff).toFixed(3)}'/>`)
    .join('')
  return toUri(
    `${open(width, height)}<defs>` +
      `<linearGradient id='gx' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>` +
      `<linearGradient id='gy' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>` +
      `<radialGradient id='n' cx='${cx}' cy='${cy}' r='${radius}' gradientUnits='userSpaceOnUse'>${stops}</radialGradient>` +
      `<clipPath id='c'><circle cx='${cx}' cy='${cy}' r='${radius}'/></clipPath></defs>` +
      `<rect width='${width}' height='${height}' fill='#808080'/>` +
      `<g clip-path='url(#c)'>` +
      `<rect x='${x}' y='${y}' width='${diameter}' height='${diameter}' fill='#000080'/>` +
      `<rect x='${x}' y='${y}' width='${diameter}' height='${diameter}' fill='url(#gx)' style='mix-blend-mode:screen'/>` +
      `<rect x='${x}' y='${y}' width='${diameter}' height='${diameter}' fill='url(#gy)' style='mix-blend-mode:screen'/>` +
      `<circle cx='${cx}' cy='${cy}' r='${radius}' fill='url(#n)'/>` +
      `</g></svg>`,
  )
}

/**
 * Vidro líquido retangular: R vai de 255 (esquerda) a 0 (direita), G de 255 (topo) a 0 (base), B fixo em 128.
 * Um retângulo arredondado cinza e desfocado (`inset`, `corner`, `soft`) neutraliza o miolo, deixando o
 * deslocamento só nas bordas. Com scale positivo as bordas "puxam" o conteúdo de dentro (lente que amplia).
 */
function liquidMapUri(width: number, height: number, inset: number, corner: number, soft: number): string {
  return toUri(
    `${open(width, height)}<defs>` +
      `<linearGradient id='Y' x1='0' x2='0' y1='4%' y2='96%'><stop offset='0%' stop-color='#0F0'/><stop offset='100%' stop-color='#000'/></linearGradient>` +
      `<linearGradient id='X' x1='3%' x2='97%' y1='0' y2='0'><stop offset='0%' stop-color='#F00'/><stop offset='100%' stop-color='#000'/></linearGradient></defs>` +
      `<rect width='${width}' height='${height}' fill='#808080'/>` +
      `<g filter='blur(2px)'>` +
      `<rect width='${width}' height='${height}' fill='#000080'/>` +
      `<rect width='${width}' height='${height}' fill='url(#Y)' style='mix-blend-mode:screen'/>` +
      `<rect width='${width}' height='${height}' fill='url(#X)' style='mix-blend-mode:screen'/>` +
      `<rect x='${inset}' y='${inset}' width='${width - inset * 2}' height='${height - inset * 2}' rx='${corner}' ry='${corner}' fill='#808080' filter='blur(${soft}px)'/>` +
      `</g></svg>`,
  )
}

/**
 * Brilho de vidro, só com gradientes (sem banding de iluminação): reflexo suave no canto superior esquerdo,
 * escurecimento interno na borda oposta e um aro fino de luz. Transparente fora do círculo — vai por cima com `over`.
 */
function glintUri(cx: number, cy: number, radius: number, width: number, height: number): string {
  return toUri(
    `${open(width, height)}<defs>` +
      `<radialGradient id='s' cx='${cx - radius * 0.36}' cy='${cy - radius * 0.42}' r='${radius * 0.55}' gradientUnits='userSpaceOnUse'><stop offset='0' stop-color='#fff' stop-opacity='0.85'/><stop offset='0.45' stop-color='#fff' stop-opacity='0.25'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></radialGradient>` +
      `<radialGradient id='v' cx='${cx}' cy='${cy}' r='${radius}' fx='${cx - radius * 0.3}' fy='${cy - radius * 0.3}' gradientUnits='userSpaceOnUse'><stop offset='0.7' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#000' stop-opacity='0.4'/></radialGradient>` +
      `<linearGradient id='l' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#fff' stop-opacity='0.9'/><stop offset='0.5' stop-color='#fff' stop-opacity='0.1'/><stop offset='1' stop-color='#fff' stop-opacity='0.5'/></linearGradient>` +
      `</defs>` +
      `<circle cx='${cx}' cy='${cy}' r='${radius}' fill='url(#v)'/>` +
      `<circle cx='${cx}' cy='${cy}' r='${radius}' fill='url(#s)'/>` +
      `<circle cx='${cx}' cy='${cy}' r='${radius - 1.5}' fill='none' stroke='url(#l)' stroke-width='3'/></svg>`,
  )
}

export { discUri, domeUri, glintUri, lensMapUri, liquidMapUri, sphereMapUri }

/** Overlay de ruído (grain) sobre o fundo da página — não captura cliques. */
function Grain() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        opacity: 0.22,
      }}
    >
      <filter
        id="grain-filter"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence type="fractalNoise" baseFrequency="1.25" numOctaves="2" seed="2" stitchTiles="stitch" result="turbulence" />
        <feColorMatrix type="saturate" values="0" in="turbulence" result="colormatrix" />
        <feComponentTransfer in="colormatrix" result="componentTransfer">
          <feFuncR type="linear" slope="3" />
          <feFuncG type="linear" slope="3" />
          <feFuncB type="linear" slope="3" />
        </feComponentTransfer>
        <feColorMatrix
          in="componentTransfer"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -16"
        />
      </filter>
      <rect width="100%" height="100%" fill="transparent" filter="url(#grain-filter)" />
    </svg>
  )
}

export default Grain

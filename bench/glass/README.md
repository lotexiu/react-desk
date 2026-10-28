# Banco de testes do vidro (SVG `backdrop-filter`)

Compara, isoladamente do app, o custo de cada forma de montar o efeito Liquid Glass.
Painéis com as medidas reais da tela de TV sobre um fundo detalhado (orbes + conteúdo rolando).

```
cd apps/react-desk/bench/glass
python3 -m http.server 5301 &
node run.mjs none,blur,canvas3,canvas1,vector1,vector2,vector3,prim1,prim3 anim   # fundo em movimento
node run.mjs none,blur,canvas3,vector1 static                                       # fundo parado
EXTRA="&only=2,3" node run.mjs vector1 anim      # só os painéis 2 e 3 refratam
EXTRA="&orbs=0"   node run.mjs vector1 anim      # sem os orbes (só o conteúdo rola)
EXTRA="&bl=0" SHOT=shot node run.mjs vector1 static   # sem desfoque + screenshot
```

Variantes: `none` · `blur` · `canvas3` (mapa em canvas + 3 deslocamentos, o que o app tinha) · `canvas1` ·
`vector1/2/3` (mapa SVG vetorial + 1/2/3 deslocamentos) · `prim1/3` (mapa só com primitivas de filtro) · `vectorOff` (aberração por `feOffset`).

Resultados e conclusões: `packages/typescript/docs/study/01-glass.md`.

import { PRESETS, makeDoc, node } from './presets'
import type { TPreviewSource } from './serialize'
import type { TFilterDoc } from './types'

type TExample = { title: string; text: string; source: TPreviewSource; make: () => TFilterDoc }

type TPrimitiveDocs = {
  summary: string
  /** Parágrafos que explicam o mecanismo — o "como funciona por dentro". */
  how: string[]
  /** Explicação por campo (chave do campo; para canais, a chave sem o prefixo `R_`). */
  help: Record<string, string>
  examples: TExample[]
  tips: string[]
}

type TBlock =
  | { type: 'p'; text: string }
  | { type: 'code'; code: string }
  | { type: 'note'; text: string }
  | { type: 'demo'; caption: string; source: TPreviewSource; make: () => TFilterDoc }

type TGuide = { slug: string; title: string; blocks: TBlock[] }

const preset = (slug: string) => () => PRESETS.find((candidate) => candidate.slug === slug)!.make()

const IN_HELP = 'De onde vem a imagem de entrada. "Resultado anterior" é o padrão; SourceGraphic é o elemento original; SourceAlpha é só a silhueta (alpha) dele; ou escolha o resultado de uma etapa anterior.'
const IN2_HELP = 'Segunda entrada, usada para combinar com `in`. Aqui não existe "resultado anterior" implícito útil: escolha explicitamente o que combinar.'

const REFERENCE: Record<string, TPrimitiveDocs> = {
  feTurbulence: {
    summary: 'Gera uma imagem de ruído procedural (Perlin). É a base de grão, nuvens, mármore, água e texturas.',
    how: [
      'Ao contrário das outras primitivas, feTurbulence não lê nenhuma entrada: ela cria pixels do zero a partir de funções de ruído. Cada pixel recebe valores nos quatro canais (R, G, B, A).',
      'baseFrequency controla o "zoom" do ruído: valores baixos (0.01) dão manchas grandes e suaves; valores altos (1+) dão grão fino. numOctaves soma camadas de ruído com o dobro da frequência cada — mais detalhe, mais custo de CPU.',
      'fractalNoise gera valores em torno de 50% de cinza (bom para texturas que se misturam); turbulence gera valores mais próximos de 0 com picos (bom para nuvens, fogo e como mapa de deslocamento).',
    ],
    help: {
      type: 'fractalNoise: ruído suave e uniforme. turbulence: ruído com "cristas" mais marcadas e valores mais escuros.',
      baseFrequency: 'Frequência no eixo X. Pequeno = manchas grandes; grande = grão fino. Costuma ficar entre 0.005 e 2.',
      baseFrequencyY: 'Frequência no eixo Y. Se for 0 ou igual à do X, o atributo vira um único número. Diferente do X, o ruído fica esticado (riscos, água, madeira).',
      numOctaves: 'Quantas camadas de ruído são somadas. 1–2 para grão; 4–6 para nuvens/papel. Cada oitava custa mais.',
      seed: 'Semente do gerador aleatório: muda o padrão sem mudar o "estilo".',
      stitchTiles: 'stitch ajusta a frequência para o ruído emendar sem costura quando usado como tile.',
    },
    examples: [
      {
        title: 'Ruído cru',
        text: 'Sem nenhuma outra etapa — o ruído colorido original, por cima do fundo.',
        source: 'rect',
        make: () => makeDoc([node('feTurbulence', { baseFrequency: 0.03, numOctaves: 4 })], { settings: { id: 'turbulence-demo' }, layer: { opacity: 0.8 } }),
      },
    ],
    tips: [
      'Ruído puro é colorido. Para grão em cinza, encadeie um feColorMatrix de saturate 0.',
      'É caro em áreas grandes e quando animado. Evite animar baseFrequency em tela cheia.',
    ],
  },
  feColorMatrix: {
    summary: 'Transforma as cores de cada pixel: dessatura, gira o matiz, converte luminância em transparência ou aplica uma matriz 5×4 arbitrária.',
    how: [
      'Cada pixel é um vetor [R, G, B, A, 1]. O modo matrix multiplica esse vetor por uma matriz 4×5: cada linha da matriz define como um canal de saída é montado a partir dos canais de entrada, e a 5ª coluna é um deslocamento fixo.',
      'Exemplo: a última linha "0 0 0 24 -16" faz A\' = 24·A − 16. Isso empurra o alpha para 0 ou 1 rapidamente — um "limiar" que transforma ruído suave em pontos nítidos (é o truque do grão).',
      'saturate, hueRotate e luminanceToAlpha são atalhos que montam a matriz por você.',
    ],
    help: {
      in: IN_HELP,
      type: 'saturate: 0 = cinza, 1 = original, >1 = mais vivo. hueRotate: gira o matiz em graus. luminanceToAlpha: o brilho vira transparência. matrix: matriz completa.',
      saturate: 'Fator de saturação. 0 deixa em escala de cinza.',
      hue: 'Rotação do matiz em graus (0–360).',
      matrix: '20 números separados por espaço: 4 linhas (R, G, B, A) × 5 colunas (R, G, B, A, deslocamento). A identidade é "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0".',
    },
    examples: [
      {
        title: 'Girar o matiz',
        text: 'hueRotate de 150° troca as cores sem alterar o brilho.',
        source: 'shapes',
        make: () => makeDoc([node('feColorMatrix', { in: 'SourceGraphic', type: 'hueRotate', hue: 150 })], { settings: { id: 'hue-demo' } }),
      },
      {
        title: 'Escala de cinza',
        text: 'saturate 0.',
        source: 'shapes',
        make: () => makeDoc([node('feColorMatrix', { in: 'SourceGraphic', type: 'saturate', saturate: 0 })], { settings: { id: 'gray-demo' } }),
      },
    ],
    tips: ['Por padrão os valores são calculados em sRGB (veja o guia "Cor e alpha").', 'Para inverter cores use feComponentTransfer com table "1 0".'],
  },
  feComponentTransfer: {
    summary: 'Aplica uma curva independente a cada canal (R, G, B, A): contraste, brilho, gamma, posterização e inversão.',
    how: [
      'Para cada canal você escolhe uma função que mapeia o valor de entrada (0–1) para a saída (0–1). Canais em "identity" não são alterados e nem aparecem no código gerado.',
      'linear: saída = slope·entrada + intercept (contraste e brilho). gamma: saída = amplitude·entrada^exponent + offset. table: interpola entre os valores da lista. discrete: degraus — dá o efeito de posterização.',
    ],
    help: {
      in: IN_HELP,
      type: 'Função aplicada a este canal. identity = não mexe.',
      slope: 'Inclinação: >1 aumenta o contraste, <1 reduz.',
      intercept: 'Deslocamento somado ao final (brilho).',
      amplitude: 'Multiplicador do gamma.',
      exponent: 'Expoente: <1 clareia os tons médios, >1 escurece.',
      offset: 'Deslocamento somado ao final.',
      tableValues: 'Lista de valores 0–1. "1 0" inverte. Com discrete, cada valor vira um degrau.',
    },
    examples: [
      {
        title: 'Inverter',
        text: 'Tabela "1 0" em R, G e B.',
        source: 'shapes',
        make: () =>
          makeDoc(
            [node('feComponentTransfer', { in: 'SourceGraphic', R_type: 'table', R_tableValues: '1 0', G_type: 'table', G_tableValues: '1 0', B_type: 'table', B_tableValues: '1 0' })],
            { settings: { id: 'invert-demo' } },
          ),
      },
      {
        title: 'Posterizar',
        text: 'discrete com 3 degraus em cada canal.',
        source: 'shapes',
        make: () =>
          makeDoc(
            [node('feComponentTransfer', { in: 'SourceGraphic', R_type: 'discrete', R_tableValues: '0 0.5 1', G_type: 'discrete', G_tableValues: '0 0.5 1', B_type: 'discrete', B_tableValues: '0 0.5 1' })],
            { settings: { id: 'poster-demo' } },
          ),
      },
    ],
    tips: ['Os 4 canais aparecem na interface, mas só os que não são identity viram elementos feFuncX.'],
  },
  feGaussianBlur: {
    summary: 'Desfoca a entrada com um filtro gaussiano.',
    how: [
      'Cada pixel vira a média ponderada dos vizinhos, com pesos em curva de sino. stdDeviation é o desvio padrão dessa curva, em unidades do usuário: o raio visível do desfoque é cerca de 3× esse valor.',
      'O desfoque espalha cor para fora da forma original — por isso a região do filtro precisa ser maior que o elemento, senão a borda é cortada (guia "Região do filtro").',
    ],
    help: {
      in: IN_HELP,
      stdDeviation: 'Intensidade do desfoque. Também aceita dois números ("x y") no SVG; aqui usamos um só.',
      edgeMode: 'O que usar nas bordas da região: none (transparente), duplicate (repete a borda) ou wrap (dá a volta).',
    },
    examples: [
      {
        title: 'Desfoque simples',
        text: 'stdDeviation 6 aplicado ao SourceGraphic.',
        source: 'shapes',
        make: () => makeDoc([node('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 6 })], { settings: { id: 'blur-demo' } }),
      },
    ],
    tips: ['Para sombras, feDropShadow já faz blur + offset + cor.', 'Desfoques grandes são caros; evite animar stdDeviation em áreas grandes.'],
  },
  feOffset: {
    summary: 'Desloca a entrada em dx/dy.',
    how: ['Move toda a imagem sem alterar o tamanho da região do filtro. Sozinho parece "arrastar" o elemento; combinado com blur e flood forma sombras.'],
    help: { in: IN_HELP, dx: 'Deslocamento horizontal em unidades do usuário.', dy: 'Deslocamento vertical em unidades do usuário.' },
    examples: [
      {
        title: 'Sombra manual',
        text: 'SourceAlpha → blur → offset (só a silhueta, ainda sem cor).',
        source: 'shapes',
        make: () =>
          makeDoc([node('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: 5 }), node('feOffset', { dx: 10, dy: 12 })], { settings: { id: 'offset-demo' } }),
      },
    ],
    tips: ['O resultado do offset substitui a imagem. Para manter o original por cima, combine depois com feBlend/feComposite.'],
  },
  feFlood: {
    summary: 'Preenche toda a região do filtro com uma cor sólida.',
    how: ['Não usa entrada. Sozinho cobre tudo com a cor; o uso típico é compor com outra etapa (feComposite "in" recorta a cor na forma de outra imagem).'],
    help: { 'flood-color': 'Cor do preenchimento.', 'flood-opacity': 'Opacidade de 0 a 1.' },
    examples: [
      {
        title: 'Colorir a silhueta',
        text: 'Flood rosa recortado pelo SourceAlpha com feComposite "in".',
        source: 'shapes',
        make: () =>
          makeDoc([node('feFlood', { 'flood-color': '#ff3366' }), node('feComposite', { in: '', in2: 'SourceAlpha', operator: 'in' })], { settings: { id: 'flood-demo' } }),
      },
    ],
    tips: ['Em feComposite "in", o resultado é a cor de `in` onde `in2` tem alpha.'],
  },
  feImage: {
    summary: 'Insere uma imagem (data URI, URL ou gerada pelo Laboratório) como etapa — é o jeito de levar mapas de deslocamento e máscaras para dentro do filtro.',
    how: [
      'Não lê nenhuma entrada: desenha a imagem na sub-região x / y / width / height (em unidades do usuário quando primitiveUnits é userSpaceOnUse). Com preserveAspectRatio="none" a imagem é esticada para preencher exatamente essa região, então as coordenadas dentro da imagem coincidem com as do desenho.',
      'No Laboratório as imagens são SVGs criados na hora e embutidos como data URI — por isso o href fica longo no código exportado. "sphere-map" é um mapa de refração (R cresce na horizontal, G na vertical, cinza 50% fora do círculo); "disc" é um círculo branco, útil como máscara e, desfocado, como mapa de altura.',
      'URLs externas (https://…) são pouco confiáveis dentro de filtros: dependem de CORS e do navegador, e podem simplesmente não carregar — o filtro roda como se a imagem fosse transparente e nada muda. O mais seguro é embutir a imagem como data URI; no modo "custom" use o seletor de arquivo abaixo do campo href.',
      'Mapas de normais (azul no centro, R/G variando) servem, com três ajustes: o fundo preto vira deslocamento máximo (pixel preto = −50%), então é preciso trocá-lo por cinza 50% — o preset "Mapa de normais (PNG) → lente" faz isso usando o canal azul como máscara; o G costuma estar invertido (Y para cima), então ele é espelhado com uma feColorMatrix; e o PNG em blocos pede um leve blur. Ajuste também x/y/width/height para a imagem cobrir só a esfera, sem esticar.',
      'Para feDisplacementMap, 50% de cinza (128) significa "não mover". Um mapa precisa ser opaco e cinza 50% fora da área do efeito: pixels transparentes valem 0 e empurrariam a imagem inteira para um lado. Use color-interpolation-filters = sRGB, senão o "neutro" deixa de ser 128.',
    ],
    help: {
      mode: 'sphere-map: mapa de refração linear de esfera. lens: o mesmo, mas com o miolo neutro e a borda forte (esfera de vidro). liquid: retângulo arredondado com borda forte (vidro líquido). glint: reflexo + aro de luz em gradiente, para pôr por cima. disc: círculo branco. dome: cúpula (alpha 1 no centro, 0 na borda) para mapa de altura. custom: você informa o href.',
      falloff: 'Só em "lens": quão concentrado é o deslocamento na borda. Deslocamento ∝ distância^potência; 1 = linear (esfera inteira), valores altos deixam o miolo limpo e entortam só a borda.',
      inset: 'Só em "liquid": distância da borda da imagem até o retângulo neutro do miolo.',
      corner: 'Só em "liquid": raio dos cantos do retângulo neutro.',
      soft: 'Só em "liquid": desfoque (px) do retângulo neutro — define a largura da faixa onde a borda entorta.',
      cx: 'Centro X do círculo, em coordenadas da imagem (que tem o tamanho da região).',
      cy: 'Centro Y do círculo.',
      r: 'Raio do círculo.',
      href: 'Data URI da imagem (SVG, PNG…) ou URL. Prefira data URI: use o seletor de arquivo abaixo do campo.',
      x: 'Início da região onde a imagem é desenhada.',
      y: 'Início da região (vertical).',
      width: 'Largura da região — normalmente a largura do desenho.',
      height: 'Altura da região.',
    },
    examples: [
      {
        title: 'Esfera de vidro',
        text: 'Mapa de refração + displacement sobre o fundo, com sombreamento e brilho. Veja o guia "Esfera de vidro" para o passo a passo.',
        source: 'background',
        make: preset('glass'),
      },
    ],
    tips: [
      'O suporte a feImage varia entre navegadores (principalmente ao referenciar elementos do próprio documento). Teste nos que importam para você.',
      'Troque cx, cy e r conforme o tamanho do seu desenho; a imagem tem o mesmo tamanho da região x/y/width/height.',
    ],
  },
  feBlend: {
    summary: 'Mistura duas imagens com um modo de blend (multiply, screen, overlay…), como camadas em um editor de imagem.',
    how: ['`in` é a camada de cima e `in2` a de baixo. O modo define como as cores se combinam: multiply escurece, screen clareia, overlay e soft-light aumentam o contraste, difference destaca diferenças.'],
    help: { in: IN_HELP, in2: IN2_HELP, mode: 'Modo de mistura aplicado de `in` sobre `in2`.' },
    examples: [
      {
        title: 'Glow com screen',
        text: 'O desfoque (in) é misturado sobre o original (in2) com screen.',
        source: 'shapes',
        make: () =>
          makeDoc([node('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 12 }), node('feBlend', { mode: 'screen', in2: 'SourceGraphic' })], { settings: { id: 'blend-demo' } }),
      },
    ],
    tips: ['Isto é diferente do mix-blend-mode do CSS, que mistura o resultado final com o que está atrás na página. feBlend mistura duas etapas dentro do filtro.'],
  },
  feComposite: {
    summary: 'Combina duas imagens por regras de transparência (over, in, out, atop, xor) ou por uma fórmula aritmética.',
    how: [
      'Os operadores de Porter-Duff decidem qual parte de cada imagem fica, olhando só o alpha: in mantém `in` apenas onde `in2` é opaco; out mantém onde `in2` é transparente; over empilha.',
      'arithmetic calcula resultado = k1·i1·i2 + k2·i1 + k3·i2 + k4 em cada canal — útil para somar, subtrair ou misturar imagens.',
    ],
    help: {
      in: IN_HELP,
      in2: IN2_HELP,
      operator: 'Regra de composição entre `in` e `in2`.',
      k1: 'Multiplica as duas imagens (i1·i2).',
      k2: 'Multiplica só `in` (i1).',
      k3: 'Multiplica só `in2` (i2).',
      k4: 'Constante somada ao resultado.',
    },
    examples: [
      {
        title: 'Só o contorno',
        text: 'Dilata a silhueta e remove o original com "out" — sobra um halo.',
        source: 'shapes',
        make: () =>
          makeDoc(
            [node('feMorphology', { in: 'SourceAlpha', operator: 'dilate', radius: 6 }), node('feComposite', { in2: 'SourceAlpha', operator: 'out' })],
            { settings: { id: 'composite-demo' } },
          ),
      },
    ],
    tips: ['Muitos efeitos usam SourceAlpha como máscara em um feComposite "in".'],
  },
  feMorphology: {
    summary: 'Engrossa (dilate) ou afina (erode) as formas.',
    how: ['Para cada pixel, olha uma janela de tamanho `radius` e pega o valor máximo (dilate) ou mínimo (erode) de cada canal. Em formas opacas isso cresce ou encolhe a silhueta.'],
    help: { in: IN_HELP, operator: 'dilate expande; erode contrai.', radius: 'Raio da janela em unidades do usuário.' },
    examples: [
      {
        title: 'Engrossar',
        text: 'Dilate de 4 sobre o SourceGraphic.',
        source: 'text',
        make: () => makeDoc([node('feMorphology', { in: 'SourceGraphic', operator: 'dilate', radius: 4 })], { settings: { id: 'morph-demo' } }),
      },
    ],
    tips: ['Em texto, dilate + composite "out" gera contornos.'],
  },
  feDisplacementMap: {
    summary: 'Distorce a imagem `in` usando as cores de `in2` como mapa de quanto cada pixel deve se mover.',
    how: [
      'Para cada pixel, o navegador lê o valor de um canal de `in2` (ex.: R para o eixo X, G para o Y) e desloca o pixel de `in` proporcionalmente a `scale`. Valor 0.5 = sem deslocamento; <0.5 move para um lado; >0.5 para o outro.',
      'Combinado com feTurbulence como mapa, dá ondulações de água, calor, vidro.',
    ],
    help: {
      in: IN_HELP,
      in2: 'O mapa: a imagem cujos canais definem o deslocamento (normalmente um feTurbulence).',
      scale: 'Distância máxima de deslocamento em unidades do usuário.',
      xChannelSelector: 'Canal do mapa que controla o deslocamento horizontal.',
      yChannelSelector: 'Canal do mapa que controla o deslocamento vertical.',
    },
    examples: [
      {
        title: 'Ondulação',
        text: 'Turbulência (mapa) + displacement sobre o SourceGraphic.',
        source: 'text',
        make: () =>
          makeDoc(
            [
              node('feTurbulence', { type: 'turbulence', baseFrequency: 0.015, baseFrequencyY: 0.06 }, 'noise'),
              node('feDisplacementMap', { in: 'SourceGraphic', in2: 'noise', scale: 24 }),
            ],
            { settings: { id: 'displace-demo' } },
          ),
      },
    ],
    tips: ['Ordem importa: `in` é a imagem distorcida, `in2` é o mapa. Trocar os dois produz resultados confusos.'],
  },
  feDropShadow: {
    summary: 'Atalho para sombra projetada: blur + offset + cor + composição com o original.',
    how: ['Equivale a feGaussianBlur(SourceAlpha) → feOffset → feFlood → feComposite → feMerge com o original. Funciona nos navegadores modernos.'],
    help: {
      in: IN_HELP,
      dx: 'Deslocamento horizontal da sombra.',
      dy: 'Deslocamento vertical da sombra.',
      stdDeviation: 'Desfoque da sombra.',
      'flood-color': 'Cor da sombra.',
      'flood-opacity': 'Opacidade da sombra.',
    },
    examples: [
      {
        title: 'Sombra suave',
        text: 'dx 8, dy 10, desvio 8.',
        source: 'shapes',
        make: () => makeDoc([node('feDropShadow', { in: 'SourceGraphic', dx: 8, dy: 10, stdDeviation: 8 })], { settings: { id: 'shadow-demo' } }),
      },
    ],
    tips: ['Para brilho colorido, use uma cor clara com dx/dy 0.'],
  },
  feDiffuseLighting: {
    summary: 'Ilumina uma "superfície" cujo relevo vem do alpha da entrada, produzindo sombreamento suave (papel, tecido, emboss).',
    how: [
      'O alpha da entrada é tratado como mapa de altura. O navegador calcula a normal da superfície em cada pixel e o quanto ela é iluminada por uma luz (aqui, distante, definida por azimute e elevação).',
      'O resultado é uma imagem opaca em tons da cor da luz — normalmente usada com feBlend/mix-blend-mode ou feComposite arithmetic para aplicar a textura.',
    ],
    help: {
      in: IN_HELP + ' O alpha dela é o relevo.',
      surfaceScale: 'Altura do relevo: maior = mais acentuado.',
      diffuseConstant: 'Brilho geral da luz difusa.',
      'lighting-color': 'Cor da luz.',
      azimuth: 'Direção horizontal da luz em graus.',
      elevation: 'Altura da luz em graus (0 = rasante, 90 = de cima).',
      light: 'distant: luz distante (só direção). point: lâmpada em um ponto (x, y, z) — a intensidade cai com a distância. spot: foco apontado para um ponto.',
      lx: 'Posição X da luz pontual/foco, em unidades do usuário (não relativa ao elemento, salvo primitiveUnits=objectBoundingBox).',
      ly: 'Posição Y da luz.',
      lz: 'Altura da luz acima da superfície. Menor = gradiente mais concentrado.',
      px: 'Ponto X para onde o foco aponta.',
      py: 'Ponto Y para onde o foco aponta.',
      pz: 'Ponto Z para onde o foco aponta (0 = a superfície).',
      spotExponent: 'Quão concentrado é o foco (maior = feixe mais fechado).',
      coneAngle: 'Ângulo máximo do cone em graus; fora dele não há luz. 0 = sem limite.',
    },
    examples: [
      {
        title: 'Papel',
        text: 'Ruído de baixa frequência como relevo.',
        source: 'rect',
        make: () =>
          makeDoc([node('feTurbulence', { baseFrequency: 0.04, numOctaves: 5, seed: 7 }), node('feDiffuseLighting', { surfaceScale: 2 })], { settings: { id: 'diffuse-demo' }, layer: { opacity: 0.8 } }),
      },
    ],
    tips: ['O relevo usa o alpha, e feTurbulence gera alpha variável — por isso a combinação funciona sem preparo.'],
  },
  feSpecularLighting: {
    summary: 'Como a iluminação difusa, mas gera apenas os brilhos especulares (reflexos).',
    how: ['Usa o mesmo mapa de altura do alpha, mas calcula o reflexo de uma luz: specularExponent controla o quão concentrado é o brilho (maior = ponto menor e mais forte).'],
    help: {
      in: IN_HELP + ' O alpha dela é o relevo.',
      surfaceScale: 'Altura do relevo.',
      specularConstant: 'Intensidade do brilho.',
      specularExponent: 'Concentração do brilho (1–128).',
      'lighting-color': 'Cor da luz.',
      azimuth: 'Direção horizontal da luz em graus.',
      elevation: 'Altura da luz em graus.',
      light: 'distant: luz distante (só direção). point: lâmpada em um ponto (x, y, z) — a intensidade cai com a distância. spot: foco apontado para um ponto.',
      lx: 'Posição X da luz pontual/foco, em unidades do usuário (não relativa ao elemento, salvo primitiveUnits=objectBoundingBox).',
      ly: 'Posição Y da luz.',
      lz: 'Altura da luz acima da superfície. Menor = gradiente mais concentrado.',
      px: 'Ponto X para onde o foco aponta.',
      py: 'Ponto Y para onde o foco aponta.',
      pz: 'Ponto Z para onde o foco aponta (0 = a superfície).',
      spotExponent: 'Quão concentrado é o foco (maior = feixe mais fechado).',
      coneAngle: 'Ângulo máximo do cone em graus; fora dele não há luz. 0 = sem limite.',
    },
    examples: [
      {
        title: 'Reflexos de superfície',
        text: 'Turbulência como relevo com brilho especular.',
        source: 'rect',
        make: () =>
          makeDoc([node('feTurbulence', { baseFrequency: 0.03, numOctaves: 3 }), node('feSpecularLighting', { specularExponent: 30 })], { settings: { id: 'specular-demo' }, layer: { opacity: 0.8 } }),
      },
    ],
    tips: ['O resultado é só brilho: costuma ser compostos com a imagem original via feComposite arithmetic ou feBlend screen.'],
  },
}

const GUIDES: TGuide[] = [
  {
    slug: 'o-que-e',
    title: 'O que é um filtro SVG',
    blocks: [
      { type: 'p', text: 'Um filtro SVG é uma lista de etapas (primitivas "fe…") que o navegador executa em sequência sobre a imagem de um elemento. Cada etapa recebe uma imagem, produz outra, e a última vira o resultado exibido.' },
      { type: 'code', code: '<svg>\n  <filter id="meu-filtro">\n    <feTurbulence baseFrequency="0.8" />\n    <feColorMatrix type="saturate" values="0" />\n  </filter>\n  <rect width="100%" height="100%" filter="url(#meu-filtro)" />\n</svg>' },
      { type: 'p', text: 'O <filter> só define a receita. Quem aplica é o atributo filter="url(#id)" (ou a propriedade CSS filter: url(#id)) em outro elemento. Sem esse vínculo, nada acontece.' },
      { type: 'demo', caption: 'Receita "Grão": 4 etapas encadeadas — ruído, cinza, contraste, limiar de alpha.', source: 'rect', make: () => makeDoc([node('feTurbulence', { baseFrequency: 1.25, numOctaves: 2, seed: 2 }), node('feColorMatrix', { type: 'saturate', saturate: 0 }), node('feComponentTransfer', { R_slope: 3, G_slope: 3, B_slope: 3 }), node('feColorMatrix', { type: 'matrix', matrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -16' })], { settings: { id: 'guide-grain' }, layer: { opacity: 0.4, blendMode: 'soft-light' } }) },
      { type: 'note', text: 'Experimente no Laboratório: desligue uma etapa (checkbox) e veja o que muda — é a forma mais rápida de entender o papel de cada uma.' },
    ],
  },
  {
    slug: 'encadeamento',
    title: 'Encadeando: in, in2 e result',
    blocks: [
      { type: 'p', text: 'Por padrão, cada etapa recebe como entrada o resultado da etapa anterior (e a primeira recebe SourceGraphic). Você pode mudar isso com in e in2, apontando para outra fonte.' },
      { type: 'p', text: 'As fontes possíveis são: SourceGraphic (o elemento original), SourceAlpha (só a silhueta dele) e qualquer etapa anterior que tenha um result="nome". O Laboratório cria o result automaticamente quando você referencia uma etapa.' },
      { type: 'code', code: '<feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />\n<feBlend in="blur" in2="SourceGraphic" mode="screen" />' },
      { type: 'demo', caption: 'Glow: o blur (in) é misturado sobre o original (in2). Sem in2 explícito não haveria como "voltar" ao original.', source: 'shapes', make: () => makeDoc([node('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 12 }), node('feBlend', { mode: 'screen', in2: 'SourceGraphic' })], { settings: { id: 'guide-glow' } }) },
      { type: 'note', text: 'Só é possível referenciar etapas que vêm antes. Se você reordenar e a referência ficar para frente, o Laboratório volta para "resultado anterior".' },
    ],
  },
  {
    slug: 'regiao',
    title: 'A região do filtro',
    blocks: [
      { type: 'p', text: 'O filtro só desenha dentro de uma caixa: x, y, width e height. Por padrão é -10% / -10% / 120% / 120% do elemento. Efeitos que se espalham para fora (blur, sombra) são cortados na borda dessa caixa.' },
      { type: 'p', text: 'filterUnits define se esses valores são relativos ao elemento (objectBoundingBox, o padrão) ou absolutos (userSpaceOnUse). primitiveUnits faz o mesmo para valores das etapas, como stdDeviation e dx.' },
      { type: 'demo', caption: 'Com região justa (0% / 100%) o desfoque é cortado nas bordas.', source: 'shapes', make: () => makeDoc([node('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 18 })], { settings: { id: 'guide-region', x: '0%', y: '0%', width: '100%', height: '100%' } }) },
      { type: 'note', text: 'Aqui o filtro é aplicado em um grupo que ocupa quase todo o preview, então o corte aparece nas bordas do grupo. Aumente a região no Laboratório (ex.: -20% / 140%) para ver o desfoque completo.' },
    ],
  },
  {
    slug: 'cor-e-alpha',
    title: 'Cor e alpha',
    blocks: [
      { type: 'p', text: 'Todo pixel tem quatro canais: R, G, B e A (alpha = opacidade), cada um de 0 a 1. As primitivas operam sobre esses valores — por isso feColorMatrix consegue mexer em transparência, e feDiffuseLighting usa o alpha como relevo.' },
      { type: 'p', text: 'color-interpolation-filters decide em qual espaço de cor a matemática é feita: linearRGB (padrão do SVG, mais fisicamente correto) ou sRGB (o que você normalmente vê em CSS). Com sRGB, misturas e blur tendem a ficar mais parecidos com o esperado em editores de imagem.' },
      { type: 'p', text: 'A matriz do feColorMatrix lê assim — cada linha produz um canal de saída:' },
      { type: 'code', code: "R' = r1·R + r2·G + r3·B + r4·A + r5\nG' = g1·R + g2·G + g3·B + g4·A + g5\nB' = b1·R + b2·G + b3·B + b4·A + b5\nA' = a1·R + a2·G + a3·B + a4·A + a5" },
      { type: 'demo', caption: 'Matriz que troca vermelho e azul: "0 0 1 0 0  0 1 0 0 0  1 0 0 0 0  0 0 0 1 0".', source: 'shapes', make: () => makeDoc([node('feColorMatrix', { in: 'SourceGraphic', type: 'matrix', matrix: '0 0 1 0 0  0 1 0 0 0  1 0 0 0 0  0 0 0 1 0' })], { settings: { id: 'guide-matrix' } }) },
    ],
  },
  {
    slug: 'vidro',
    title: 'Esfera de vidro (distorcer o fundo)',
    blocks: [
      { type: 'p', text: 'Um filtro só enxerga o elemento em que foi aplicado (SourceGraphic) — não existe forma de ler "o que está atrás" (BackgroundImage nunca foi implementado nos navegadores). Por isso, para distorcer um fundo, o filtro precisa ser aplicado ao próprio fundo, com um mapa que diz onde e quanto distorcer.' },
      { type: 'p', text: 'Receita: (1) feImage "lens" gera o mapa — cinza 50% fora da esfera, miolo neutro e deslocamento crescendo até a borda; (2) feDisplacementMap desloca o fundo; (3) para a aberração cromática, repete-se o deslocamento com escalas levemente diferentes, isola R, G e B com feColorMatrix e soma com feBlend screen; (4) feImage "glint" põe um reflexo e um aro de luz por cima.' },
      { type: 'p', text: 'Por que funciona: o deslocamento de cada pixel é scale × (valor do mapa − 0,5). No miolo o mapa vale 0,5 (sem deslocamento, o fundo aparece quase intacto) e na borda o vetor aponta radialmente, então a luz "se curva" ali — que é onde um vidro de verdade refrata mais. scale positivo comprime o fundo (bola de cristal); negativo amplia e pode inverter partes (não passe de ~raio ao dobrar).' },
      { type: 'demo', caption: 'O fundo é distorcido só dentro da esfera, com franjas coloridas na borda. Mude cx, cy e r nos feImage (mesmos valores nos dois) para mover a esfera.', source: 'background', make: preset('glass') },
      { type: 'demo', caption: 'Variante retangular ("vidro líquido"): mesmo princípio, mas o mapa é um retângulo arredondado desfocado.', source: 'background', make: preset('glass-liquid') },
      { type: 'note', text: 'Para refração mais forte, aumente os três scale juntos; para mais franja colorida, afaste-os entre si (ex.: 130 / 120 / 110). O fundo precisa ter conteúdo além da esfera: deslocamentos grandes amostram fora dela.' },
      { type: 'note', text: 'Mantenha color-interpolation-filters em sRGB: com linearRGB o "cinza neutro" do mapa deixa de ser 128 e o fundo inteiro desliza.' },
      { type: 'note', text: 'Alternativa: aplicar backdrop-filter: url(#id) em um elemento por cima do fundo — aí o filtro enxerga o que está atrás. Até onde sei, isso só funciona em navegadores Chromium; confirme antes de depender disso.' },
      { type: 'note', text: 'Limite conhecido: iluminação (feDiffuse/SpecularLighting) lê o alpha em 8 bits. Com surfaceScale alto aparecem anéis concêntricos (banding). Por isso o brilho do vidro usa gradientes (feImage "glint"), não luz.' },
    ],
  },
  {
    slug: 'relevo',
    title: 'Relevo e iluminação: do simples ao elaborado',
    blocks: [
      { type: 'p', text: 'feDiffuseLighting e feSpecularLighting tratam o alpha da entrada como um mapa de altura. Um desfoque do SourceAlpha já produz uma rampa suave nas bordas — e é isso que a luz "enxerga" como bisel.' },
      { type: 'demo', caption: 'Versão enxuta (7 etapas): blur do alpha → luz difusa tingida → brilho especular → recorte → sombra.', source: 'shapes', make: preset('bevel') },
      { type: 'p', text: 'Para uma borda em formato de anel (aro elevado e interior rebaixado), subtraia dois desfoques: o do original menos o do original erodido (feMorphology erode). Isso gera uma faixa só na borda, e a luz desenha um "aro".' },
      { type: 'demo', caption: 'Receita de 12 etapas: anel (blur − blur do erode), duas luzes, ruído hard-light, recorte, tinta e sombra.', source: 'shapes', make: preset('tray') },
      { type: 'p', text: 'Mapa de altura de esfera com borda nítida: desfocar a imagem inteira borra também a borda e a mancha vaza para fora do círculo. O truque é desfocar só o disco e depois recortar o resultado com o disco original (feComposite "in"), que continua nítido. Um feComponentTransfer no alpha (slope 1.6, intercept −0.6) escurece a borda para parecer uma cúpula; por fim, um feFlood preto com feComposite "over" dá o mapa em tons de cinza.' },
      { type: 'note', text: 'Dê id às etapas e referencie-as explicitamente (in / in2) em vez de depender do "resultado anterior": ao reordenar, referências implícitas mudam de significado sem aviso.' },
    ],
  },
  {
    slug: 'luz-pontual',
    title: 'Luz pontual: gradiente radial sem imagem',
    blocks: [
      { type: 'p', text: 'Uma luz pontual (fePointLight) sobre uma superfície plana ilumina mais perto da fonte e menos longe: o resultado é um gradiente radial, sem precisar de feImage. Uma base chapada (feFlood preto, alpha 1) é a superfície plana — com ela, surfaceScale não faz diferença, só a luz importa.' },
      { type: 'p', text: 'Para virar um círculo nítido é preciso "cortar" esse gradiente: uma feColorMatrix com ganho alto no alpha (A\' = k·A − b) transforma o degradê em liga/desliga. O corte acontece onde o alpha vale b/k.' },
      { type: 'p', text: 'Por que não funciona? (1) feSpecularLighting devolve cor branca com alpha = intensidade; como a matriz opera em cores não pré-multiplicadas, o canal R vale sempre 1 e "R − 0,5" dá alpha 0,5 em todo lugar. A informação está no canal A, então a quarta linha da matriz deve ler a quarta coluna: "0 0 0 k -b". (2) Com specularExponent 1 e luz a 50 de altura, a intensidade só varia de 1 a ~0,82 em toda a área — não há onde cortar. Aumente o expoente e/ou baixe a altura para o gradiente cair mais rápido.' },
      { type: 'code', code: "intensidade(d) = ((1 + Lz) / 2)^(expoente / 2),   Lz = z / √(d² + z²)\n\ncorte quando intensidade = b / k   →   raio ≈ z · √(1/Lz² − 1),   Lz = 2·(b/k)^(2/expoente) − 1" },
      { type: 'note', text: 'A fórmula é uma aproximação (feSpecularLighting com luz branca e specularConstant 1). Ajuste expoente, z, k e b olhando o preview: aumentar k deixa a borda mais nítida; aumentar b encolhe o círculo.' },
      { type: 'note', text: 'A segunda feColorMatrix do trecho original (matriz identidade) não faz nada e pode ser removida. Também confira o xmlns do <svg>: o correto é http://www.w3.org/2000/svg.' },
    ],
  },
  {
    slug: 'usando',
    title: 'Usando no React, HTML e CSS',
    blocks: [
      { type: 'p', text: 'O Laboratório exporta o filtro em quatro formatos. Escolha conforme onde vai usar:' },
      { type: 'p', text: 'JSX: só o <filter>, pronto para colar dentro de um <svg> em React. SVG: o mesmo em HTML puro. Componente: um overlay completo (como o Grain.tsx), com opacity e blend mode. JSON: a receita editável, para reimportar depois.' },
      { type: 'code', code: '/* Aplicando em um elemento HTML (o <filter> precisa existir no documento) */\n.card { filter: url(#meu-filtro); }\n\n/* Aplicando em um elemento SVG */\n<rect filter="url(#meu-filtro)" />' },
      { type: 'note', text: 'O id do filtro é global ao documento. Dois filtros com o mesmo id = o primeiro vence. Troque o id no painel "Filtro" antes de exportar.' },
      { type: 'note', text: 'Performance: feTurbulence, desfoques grandes e iluminação são caros em áreas grandes e animados. Prefira overlays pequenos ou estáticos.' },
    ],
  },
]

export { REFERENCE, GUIDES }
export type { TPrimitiveDocs, TGuide, TBlock, TExample }

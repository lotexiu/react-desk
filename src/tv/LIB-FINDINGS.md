# O que a tela de TV revelou sobre `@lotexiu/typescript`

Tela fictícia de Android TV (`src/tv/`) usada como teste de estresse da lib: 7 estilos visuais, 60 paletas,
navegação por D-pad, busca, catálogo assíncrono, ajustes, histórico de tema. Cada item foi **reproduzido**
(Node contra o `dist`, ou navegador), não deduzido só de leitura.

Legenda: ✅ corrigido/adicionado na lib (sem commit) · ⏳ em aberto · 🚫 de propósito fora da lib.

## 1. Bugs e inconsistências

| | Item | Estado |
|-|------|--------|
| ✅ | `ChunkUtils` com métodos de instância; `byWorkers` usava `this` e quebrava extraído | agora `static` |
| ✅ | `src/theme/model.ts` com CSS colado no fim (erro de sintaxe — quebrava `vitest` e o build) | removido |
| ✅ | `MathUtils.random(0, 3, true)` nunca devolve 3 | documentado (max exclusivo); comportamento mantido |
| ✅ | `throttle` só *leading* — perdia o valor final | `{ trailing: true }` (padrão igual) |
| ✅ | `formatMS` arredonda para 1 unidade (`5 025 000 ms → "1 hour"`) | **removido** (a pedido), junto com `clock`. Fica só `DateUtils.duration` (decompõe, provisório). Formatação: ver §7 |
| ✅ | `Palette.get` só aceitava 13 *tone stops* no tipo (runtime aceitava qualquer) | `get(tone: number)`; `CustomPalette` interpola |
| ✅ | `ValueHistory` sem `canUndo/canRedo` | adicionados (`undo()` ainda pode ir a `-1`) |
| ✅ | `uiInteraction` tinha a flag `hovered` mas nenhum método | `hover()/unhover()` |
| ✅ | `activeIndex.set(0)` com a lista vazia perdia o pedido (lista enchia e ninguém ficava focado) — achado pelo teste do catálogo assíncrono | o pedido é mantido |
| ✅ | `StopWatch.avarage` (typo) e sem como cronometrar chamadas avulsas (`start()` zera as voltas) | `average` + `measure(fn)`; `avarage` alias |
| ⏳ | CLAUDE.md descrevia `derived`/`Variant` como classe etc. | só a parte dos testes/ajustes foi atualizada |

## 2. Cores e tema

| | Faltava | Agora na lib |
|-|---------|--------------|
| ✅ | Papéis semânticos por modo | regras de papéis no `ThemeStyle` (`roles`) + `Theme.roles`; o app as declara em `appearance/theme/roles.ts` |
| ✅ | Texto ilegível sobre um fundo (ex.: branco sobre cinza claro) | `on`/`min` em cada papel → `Theme.checks` (sugestão) e `Theme.enforce` (aplica); métrica `WCAG21`/`APCA` |
| ✅ | Estilos que precisam de quantidades diferentes de paletas | o estilo declara os ids de paleta com uma padrão obrigatória (`ThemeStyle.palettes`); `Theme.setPalettes({ id: paleta })` atribui, `Theme.activePalettes` mostra o que está em uso. O app gera as 5 paletas de UMA cor com `PaletteFactory` em `appearance/theme/palettes.ts` |
| ✅ | Gerar o tema inteiro a partir de uma ou duas cores, e poder trocar uma paleta gerada à mão | `PaletteFactory`: `seeds` (a UI lista), regras por id, `build(valores, overrides)` |
| ✅ | Cor de texto legível sobre um fundo (`opposite()` = 100 − tom, não é contraste) | `Palette.onColor(bg)` |
| ✅ | `Color` → string segura (`toString()` dava `oklch(...)`; todos os tons testados saíam do gamut sRGB) | `ColorUtils.toHex/toString/withAlpha/contrast/mix` |
| ✅ | Paletas secundária/terciária/neutra a partir de uma semente | `Palette.derive(...)` / `.neutral()` |
| ✅ | `Theme.style` não seguia uma fonte derivada | `Theme.bindStyle(source)` |
| ✅ | Tipo `Color` só via `ReturnType<Palette['get']>` | `TColor` exportado |
| 🚫 | Exportar para CSS variables | fica no app (`appearance/theme/css-vars.ts`): é formato de saída, não lógica |

## 3. Reatividade × React (+ React Compiler)

- ✅ `signal`/`computed` ganharam `version()` (sem rastreio). A ponte do app (`state/reactive.ts`) virou
  `useSyncExternalStore(subscribe, () => source.version())` — sem contador manual, e sem perder mudanças
  entre o render e a assinatura.
- Continua valendo (é do React Compiler, não da lib): como `field`/`Selection`/`KeyboardState` mutam no lugar,
  `source()` mantém a mesma referência e o compilador reaproveita o JSX. A ponte entrega uma cópia rasa por
  versão (`useMutableReactive`) e passa a versão como argumento da leitura (`read`).
- 🚫 O hook em si não entra na lib (agnóstica); fica num adaptador (`@lotexiu/react`) quando existir.

## 4. Outras lacunas

| | Item | Estado |
|-|------|--------|
| ✅ | `activeIndex` sem `wrap: false` (D-pad para nas pontas) | `activeIndex(length, { wrap })` |
| ✅ | `selection` sem `size`/`isEmpty`/`set` | adicionados |
| ✅ | Timer como estado; `Time` sem "agora" | `ticker(ms)`, `Time.refresh()` |
| ✅ | `Cache` sem `getOrSet` nem limite | `getOrSet` + `maxEntries` (LRU) |
| ✅ | `ArrayUtils` sem `partition/range/zip` | adicionados |
| 🚫 | Bind de DOM para `KeyboardState`/`MouseState` | adaptador (`input/keys.ts`, `input/pointer.ts` no app) |
| 🚫 | Grid 2-D de foco com memória de coluna | específico de UI; fica no app (`navigation/navigation.ts`) |
| ⏳ | `Mask`: falta `caretPositionAfterFormat` (já listado no CLAUDE.md) | — |

## 5. Quais recursos da lib o app usa (e por que os outros não)

**Usa:** `signal`, `computed`, `Signal.batch`, `version`, `variant`, `field`, `toggle`, `selection`,
`activeIndex`, `debouncedValue`, `sort`, `task` + `AsyncUtils.retry/sleep`, `ticker`, `ValueHistory`,
`KeyboardState`, `MouseState`, `uiInteraction`, `Time`, `Theme` (`mode`, `style`, `palettes`, `activePalettes`, `roles`, `components`, `bindStyle`, `bindPalettes`),
`ThemeStyle`, `PALETTES`/`TonalPalette` (`derive`, `neutral`), `ColorUtils`, `Mask`,
`Cache`, `StopWatch.measure`, `StringUtils`, `MathUtils`, `ArrayUtils`, `ChunkUtils`, `DateUtils`,
`FunctionUtils` (`debounce`, `throttle`), `BitwiseUtils`.

**Não usa, por não haver cenário numa tela de TV:** `Parser`, `Language`/`TypescriptLang`/`AstNode`
(análise de código-fonte), `AhoCorasick` (busca multi-padrão em texto grande — a busca aqui é sobre 14
títulos), `Matrix` (buffers numéricos), `Subscription` (evento sem valor — signals já cobrem tudo que
precisei), `LocaleUtils` (o app é só pt-BR), `ProxyUtils`/`ClassUtils`/`ObjectUtils`, tipos de `service`.

## 7. Formatação de tempo — em aberto

A `Mask` não consegue formatar duração: preenche da esquerda e trata o valor como texto digitado.
`Mask.apply('3216', '0:00:00')` dá `3:21:6` (o certo seria `32:16`), e `'537'` com `00:00` dá `53:7` (certo: `5:37`).
Faltam alinhamento à direita, preenchimento com zeros e uma fonte que seja valor estruturado, não dígitos.
**Resolvido**: o player usa `Mask.of('duration-clock')` (preset neutro da Mask v2); o `format.ts` provisório foi removido.

## 6. Notas do app

- **Desempenho do vidro**: medido e refeito — ver `packages/typescript/docs/study/01-glass.md` e o banco de testes em `bench/glass/`. Resumo: o custo vem do fundo animado + passes de aberração; padrão agora é mapa vetorial, 1 passe, fundo parado.

- **Liquid Glass**: `backdrop-filter: url(#filtro)` + `feDisplacementMap` (mapa gerado em canvas por
  tamanho/raio, em `Cache` com LRU, custo medido com `StopWatch.measure`) + 3 canais deslocados
  (aberração cromática). O brilho especular segue o ponteiro (`MouseState` → `--mx/--my`).
  **Só Chromium** aceita `url()` em `backdrop-filter`; nos outros cai no desfoque simples.
  Em modo claro o vidro precisa de tinta mínima, senão o texto escuro some sobre pôsteres escuros.
- O app consome o **`dist`** da lib: depois de mexer em `packages/typescript/src`, rode `pnpm build` lá.
- Atalhos: `1`–`7` estilo · `T` claro/escuro · `M` ajustes · `Z`/`Y` desfazer/refazer · `[` `]` destaque.

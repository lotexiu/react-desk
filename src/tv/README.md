# tv — a tela de TV de teste

Uma tela fictícia de streaming (linhas de filmes, canais ao vivo, ajustes) usada para exercitar a lib
`@lotexiu/typescript`. Nenhum título, canal ou app aqui existe de verdade.

## Onde fica cada coisa

As pastas são por **assunto**: o que você procura sobre um assunto está na mesma pasta.

| Pasta | O que tem |
| --- | --- |
| `TvApp.tsx` | Monta a tela: liga relógio, reprodução, teclado e ponteiro, e junta o layout com as linhas. |
| `appearance/` | Tudo de aparência. `appearance.ts` é o estado (modo, estilo, paleta, vidro, desfazer). `AppearanceTab.tsx` é o painel. `theme/` define paletas, papéis de cor, estilos visuais e variáveis CSS. `styles/` tem o CSS de cada estilo visual. |
| `catalog/` | Os dados fictícios (`mock-content.ts`), o carregamento com busca, filtro e ordenação (`catalog.ts`), a montagem das linhas (`rows.ts`) e as linhas na tela (`Row.tsx`, `Hero.tsx`). |
| `navigation/` | Foco por D-pad: qual zona, seção, linha e coluna estão ativas, e o que abre por cima. |
| `input/` | Entradas: teclado (`keys.ts`), ponteiro (`pointer.ts`) e estado do controle remoto (`remote.ts`). |
| `playback/` | O que está tocando, a posição e o progresso. |
| `system/` | Relógio (`clock.ts`), ajustes rápidos (`settings.ts`), aviso na tela (`toast.ts`), `every.ts` (liga um `ticker` a um callback) e o painel `SystemTab.tsx`. |
| `layout/` | `Chrome.tsx` (barra superior, lateral, "tocando agora", controle remoto, aviso) e `Overlays.tsx` (ajustes e detalhes). |
| `ui/` | Peças visuais reutilizáveis, sem estado próprio: `Icon`, `Art`, `controls` (Switch, Slider, Segmented). |
| `glass/` | `Surface` (o painel base de toda a interface) e `displacement` (o mapa de refração do Liquid Glass). |
| `styles/base.css` | O CSS global do layout. |

## Como um dado chega na tela

1. O **estado** vive em módulos que exportam `signal`/`computed`/`toggle` (por exemplo `system/settings.ts`).
2. Um componente lê com `useReactive(signal)` e redesenha quando o valor muda.
3. Quem muda o estado chama o `set` do signal ou uma função do módulo (`setVolume`, `playTitle`…).

## Para entender o sistema de tema

Comece por `appearance/theme/how-it-works.ts`: é um exemplo pequeno e comentado, que ninguém importa.

## Formatação

O Prettier está configurado em `.prettierrc`, na raiz do app (tabs, sem ponto e vírgula, aspas simples,
100 colunas). Para formatar esta pasta:

```sh
../../packages/typescript/node_modules/.bin/prettier --write "src/tv/**/*.{ts,tsx,css}"
```

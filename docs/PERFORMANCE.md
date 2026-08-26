# Performance & Efficiency Benchmarks

## 1. Bundle Splitting Architecture
Vite Rollup chunking splits dependencies into granular cached bundles:

| Chunk | Size | Gzip Size | Cache Strategy |
| :--- | :---: | :---: | :--- |
| `react-vendor` | 49.43 kB | 17.46 kB | Long-term immutable |
| `motion-vendor` | 96.80 kB | 32.00 kB | Long-term immutable |
| `firebase-vendor` | 670.62 kB | 166.17 kB | Long-term immutable |
| `icons` | 852.32 kB | 157.45 kB | Long-term immutable |
| `index` | 916.03 kB | 264.32 kB | Version hash |

## 2. Rendering Optimizations
- **`useMemo`:** Applied to 7-day variance calculations, category sorting, search filtering.
- **`useCallback`:** Stabilizes reference identities for all 10+ core event handlers in `App.tsx`.
- **`React.memo`:** Applied to repeated UI units (e.g. `CategoryIcon`) to avoid re-renders.
- **`overflow-x: hidden`:** Eliminates cumulative layout shifts and page bounce.


# Architecture & Data Flow

```
+--------------------------------------------------------------------+
|                         TrackYourSpent UI                          |
|  (React 19 + TypeScript + Tailwind CSS + Motion + Lucide Icons)   |
+---------------------------------+----------------------------------+
                                  |
            +---------------------+---------------------+
            |                     |                     |
     [React Router DOM]    [Custom Hooks]       [Local Storage]
            |                     |                     |
     +------+------+       +------+------+       +------+------+
     | 9 Core Views|       | useExpenses |       | Instant App |
     | - Dashboard |       | useBankSync |       | Cache & Key |
     | - Day-Wise  |       | useAuthUser |       | Preferences |
     | - AIAdvisor |       +------+------+       +-------------+
     | - Banks     |              |
     | - Auto-Calc |       [Firestore Sync]
     | - Categories|              |
     | - History   |       +------+------+
     | - Export    |       | Firebase DB |
     | - Settings  |       | Cloud Rules |
     +-------------+       +-------------+
            |
    [Vite Proxy API]
            |
    +-------+-------+
    | NVIDIA AI API | (Nemotron-3-Ultra streaming)
    +---------------+
```

## Layered Design
1. **Presentation Layer (`src/components`):** Accessible, keyboard-navigable components adhering to WCAG 2.1 AA standards.
2. **State & Synchronization Layer (`src/hooks` & `src/utils/storage`):** Reactive offline-first state with cloud sync.
3. **Intelligence Layer (`src/components/AIAdvisorView`):** Streaming financial analysis and smart recommendations.
4. **Security & Boundary Layer (`src/ErrorBoundary` & `firestore.rules`):** Multi-tier fault tolerance and strict tenant isolation.


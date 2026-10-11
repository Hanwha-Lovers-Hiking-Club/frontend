# Source structure

```text
app/                    Next.js routes and route-level composition
components/
  ai-elements/          AI Elements components
  layout/               App-wide layout components
  ui/                   shadcn/ui components
features/
  chat/                 Chat feature
  document-upload/      Document upload and processing feature
  knowledge/            Knowledge card feature
utils/                  Shared utility functions
stores/                 App-wide Zustand stores
```

Keep feature-specific components, API calls, types, and Zustand stores inside their feature folder. Move state into `stores/` only when multiple features need it. Put only feature-independent helper functions in `utils/`. Route files in `app/` should stay thin and compose feature components rather than contain reusable feature logic.

Do not move generated or library-style components out of `components/ui` or `components/ai-elements`; keeping those directories stable makes updates and ownership clear.

Application-owned components belong in `features/<feature>/components` when they serve one feature. Only components shared by multiple features belong in `components/`, grouped by their role such as `components/layout`.

# Frontend Best Practices

## Data Fetching - MANDATORY

**ALWAYS use TanStack Query for ALL data fetching operations.**

### Rules

- **NO exceptions**: Every API call, data fetch, or server request MUST use TanStack Query
- **Convert on sight**: If you encounter code using `fetch`, `axios`, `useEffect` for data loading, or any other data fetching method - you MUST immediately convert it to TanStack Query
- **No manual state management** for server data: No `useState` + `useEffect` patterns for loading data
- **Must not fetch in components** Make sure to create API calls and use those with the Tanstack `useQuery` - see `@ProtectionSociety/client/src/api/tasksApi.ts` for a sample.

### Why TanStack Query?

- Automatic caching and invalidation
- Built-in loading and error states
- Request deduplication
- Background refetching
- Consistent data fetching patterns across the app

### Example Implementation

See `@ProtectionSociety/client/src/pages/TasksPage.tsx` for a complete reference implementation showing:

- `useQuery` for fetching data (lines 8-12)
- `useMutation` for updates (lines 15-22)
- Automatic cache invalidation (line 20)
- Proper loading and error handling (lines 32-33)

### Key Patterns

````tsx
// CORRECT - Using TanStack Query
const { data, error, isLoading } = useQuery({
  queryKey: ["resource"],
  queryFn: fetchResource,
});

### Mutations

```tsx
// CORRECT - Using useMutation with cache invalidation
const mutation = useMutation({
  mutationFn: updateResource,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["resource"] });
  },
});
````

## This is Non-Negotiable

TanStack Query is the ONLY approved method for data fetching in this codebase. Any deviation from this pattern is considered a critical issue that must be fixed immediately.

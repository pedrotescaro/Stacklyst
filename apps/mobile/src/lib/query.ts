import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: (count, error) =>
        !(error instanceof ApiError && [400, 401, 403, 404].includes(error.status)) && count < 2,
    },
    mutations: { retry: false },
  },
});

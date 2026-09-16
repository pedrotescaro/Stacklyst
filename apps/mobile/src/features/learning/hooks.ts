import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { KnowledgeMapData } from '../../lib/types';
export const useLearning = () =>
  useQuery({
    queryKey: ['learning'],
    queryFn: ({ signal }) => api<KnowledgeMapData>('/api/mobile/learning', { signal }),
  });

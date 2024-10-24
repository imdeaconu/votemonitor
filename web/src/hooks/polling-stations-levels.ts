import { authApi } from '@/common/auth-api';
import type { LevelNode } from '@/common/types';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

const STALE_TIME = 1000 * 60 * 15; // fifteen minutes

type PollingStationsLocationLevelsResponse = { nodes: LevelNode[] };

type UsePollingStationsLocationLevelsResult = UseQueryResult<Record<string, LevelNode[]>, Error>;

export function usePollingStationsLocationLevels(electionRoundId: string): UsePollingStationsLocationLevelsResult {
  return useQuery({
    queryKey: ['polling-stations', 'levels', electionRoundId],
    queryFn: async () => {
      const response = await authApi.get<PollingStationsLocationLevelsResponse>(
        `/election-rounds/${electionRoundId}/polling-stations:fetchLevels`
      );

      return response.data.nodes.reduce<Record<string, LevelNode[]>>(
        (group, node) => ({ ...group, [node.depth]: [...(group[node.depth] ?? []), node] }),
        {}
      );
    },
    enabled: !!electionRoundId,
    staleTime: STALE_TIME,
  });
}

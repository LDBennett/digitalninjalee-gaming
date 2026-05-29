import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  makeQueryClient,
  prefetchGames,
  prefetchMoods,
} from "@/src/lib/backend/backlog/infrastructure";
import { gameKeys, moodKeys } from "@/src/lib/backend/backlog/repository";
import { DashboardView } from "@/src/lib/frontend/pages/dashboard";

export default async function DashboardPage() {
  const queryClient = makeQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: gameKeys.all,
      queryFn: () => prefetchGames(),
    }),
    queryClient.prefetchQuery({
      queryKey: moodKeys.all,
      queryFn: prefetchMoods,
    }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardView />
    </HydrationBoundary>
  );
}

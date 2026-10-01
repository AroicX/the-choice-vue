"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";

/** A room is a membership in a discussion; send old room links to it. */
export default function RoomRedirectPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["room", params.slug],
    queryFn: async () => {
      const { data } = await api.get(endpoints.rooms.detail(params.slug));
      const room = (data?.room ?? data?.data ?? data) as { discussionsId?: string } | null;
      return room?.discussionsId ?? null;
    },
    retry: false
  });

  useEffect(() => {
    if (query.data) router.replace(`/discussions/${query.data}`);
  }, [query.data, router]);

  if (query.isError || (query.isSuccess && !query.data)) {
    return <TimelineEmpty title="Room not found" body="It may have been closed, or you need to sign in." href="/discourse" action="Browse discussions" />;
  }
  return (
    <div className="space-y-3 px-4 pt-4" aria-busy>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

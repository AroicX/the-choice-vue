import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function RoomDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Room" endpoint={endpoints.rooms.detail(params.slug)} />;
}

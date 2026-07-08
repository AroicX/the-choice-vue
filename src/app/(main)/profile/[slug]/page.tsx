import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function ProfileDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Profile" endpoint={endpoints.users.profile(params.slug)} />;
}

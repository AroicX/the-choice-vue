import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const runtime = "edge";
export const alt = "Choice9ja: know your leaders, hold them to account";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    background: "forest",
    label: "Civic accountability for Nigeria",
    title: "Know your leaders. Hold them to account.",
    subtitle: "Rate politicians, report local issues and join the conversation."
  });
}

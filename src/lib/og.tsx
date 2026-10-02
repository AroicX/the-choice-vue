import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Shared Open Graph card: halftone background (src/lib/og-assets, rendered by
 * scripts/make-carousel-art.py), a dark wash for legibility, the Choice9ja
 * mark, a label, a big title, a context line and optional portraits.
 * Satori renders this: every multi-child <div> needs display: flex.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export type OgBackground = "forest" | "ink" | "clay";

const BACKGROUND_COLOR: Record<OgBackground, string> = {
  forest: "#0B2E22",
  ink: "#141A2B",
  clay: "#3A1D14"
};

const ACCENT: Record<OgBackground, string> = {
  forest: "#6EE7A0",
  ink: "#93A8D8",
  clay: "#F0A585"
};

// OG routes run on Node, not the edge: with fonts and halftone art the edge
// bundle is ~1.5MB gzipped, over Vercel's 1MB edge limit, and every deploy
// failed. next.config traces this folder into each serverless function.
const ASSET_DIR = join(process.cwd(), "src/lib/og-assets");
const ASSET_FILES = {
  forest: "forest.png",
  ink: "ink.png",
  clay: "clay.png",
  icon: "icon.png",
  inter400: "inter-400.ttf",
  inter700: "inter-700.ttf"
};

async function asset(name: keyof typeof ASSET_FILES): Promise<ArrayBuffer> {
  const file = await readFile(join(ASSET_DIR, ASSET_FILES[name]));
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
}

/**
 * The OG renderer only decodes PNG/JPEG. Cloudinary can convert on the fly,
 * so ask it for a face-cropped JPEG at the size we draw; other hosts pass through.
 */
function ogPhoto(url: string, size: number) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_jpg,q_80,c_fill,g_face,w_${size * 2},h_${size * 2}/`);
}

export type OgCard = {
  background?: OgBackground;
  label: string;
  title: string;
  subtitle?: string;
  /** Up to 5 round portraits (absolute image URLs). */
  portraits?: string[];
  /** One large round portrait on the right (e.g. a politician). */
  hero?: string | null;
};

export async function renderOgImage(card: OgCard) {
  const background = card.background ?? "forest";
  const [bg, icon, regular, bold] = await Promise.all([
    asset(background),
    asset("icon"),
    asset("inter400"),
    asset("inter700")
  ]);
  const title = card.title.length > 90 ? `${card.title.slice(0, 88).replace(/\s+\S*$/, "")}…` : card.title;
  const portraits = (card.portraits ?? []).filter(Boolean).slice(0, 5).map((url) => ogPhoto(url, 72));
  const hero = card.hero ? ogPhoto(card.hero, 300) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: BACKGROUND_COLOR[background],
          fontFamily: "Inter",
          color: "white"
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={bg as unknown as string} width={1200} height={630} style={{ position: "absolute", inset: 0 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: `linear-gradient(100deg, ${BACKGROUND_COLOR[background]} 30%, ${BACKGROUND_COLOR[background]}cc 60%, ${BACKGROUND_COLOR[background]}33 100%)`
          }}
        />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "64px 72px", width: hero ? 780 : "100%", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={icon as unknown as string} width={44} height={44} />
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>Choice9ja</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
            <div style={{ fontSize: 26, color: ACCENT[background], fontWeight: 700 }}>{card.label}</div>
            <div style={{ fontSize: title.length > 60 ? 54 : 64, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, marginTop: 14 }}>
              {title}
            </div>
            {card.subtitle ? (
              <div style={{ fontSize: 28, color: "rgba(255,255,255,0.72)", marginTop: 18, lineHeight: 1.3 }}>{card.subtitle}</div>
            ) : null}
            {portraits.length ? (
              <div style={{ display: "flex", marginTop: 28 }}>
                {portraits.map((src, index) => (
                  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                  <img
                    key={src}
                    src={src}
                    width={72}
                    height={72}
                    style={{
                      borderRadius: 36,
                      objectFit: "cover",
                      objectPosition: "top",
                      border: `4px solid ${BACKGROUND_COLOR[background]}`,
                      marginLeft: index ? -16 : 0
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.55)", marginTop: 36 }}>thechoice9ja.com</div>
        </div>

        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={hero}
            width={300}
            height={300}
            style={{
              position: "absolute",
              right: 90,
              top: 165,
              borderRadius: 150,
              objectFit: "cover",
              objectPosition: "top",
              border: `8px solid ${ACCENT[background]}`
            }}
          />
        ) : null}
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" }
      ]
    }
  );
}

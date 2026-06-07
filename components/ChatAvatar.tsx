/**
 * ChatAvatar — the shared messaging avatar: a light-tinted fill, a solid colour
 * ring, and a colour-matched glyph/initial. Used by BOTH the lobby dead-group
 * chat and the live gameplay chat so the whole app reads as one messaging UI.
 */

/** Light-transparent fill behind an avatar of the given solid hex colour. */
export function tint(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, 0.22)`;
}

export default function ChatAvatar({ glyph, color, size = 36 }: { glyph: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), background: tint(color), color, border: `2px solid ${color}` }}
    >
      {glyph}
    </div>
  );
}

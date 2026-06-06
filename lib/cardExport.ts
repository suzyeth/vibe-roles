import { toPng } from "html-to-image";
/** Export the card DOM to a PNG data URL (fallback share path when Fotor isn't available). */
export async function exportCardPng(el: HTMLElement): Promise<string> {
  return toPng(el, { pixelRatio: 2, cacheBust: true });
}

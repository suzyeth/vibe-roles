import { toPng } from "html-to-image";
/** 把卡片 DOM 导出为 PNG dataURL（Fotor 不可用时的保底分享路径） */
export async function exportCardPng(el: HTMLElement): Promise<string> {
  return toPng(el, { pixelRatio: 2, cacheBust: true });
}

/** Entry point for the standalone SECTION bundle only (built by build.mjs
 *  into dist/suiteas-pay-section.js) — modal + "how it works" side by side.
 *  For the modal alone (to slot next to existing pricing plans), use
 *  mount.tsx / dist/suiteas-pay.js instead. */
import React from "react";
import { createRoot } from "react-dom/client";
import SuiteasPaySection, { type SuiteasPaySectionProps } from "./SuiteasPaySection";
import avalancheIconUrl from "./assets/avalanche-icon.png";
import baseIconUrl from "./assets/base-icon.png";
import markUrl from "./assets/logo/suiteas-mark.svg";
import markOnDarkUrl from "./assets/logo/suiteas-mark-on-dark.svg";

export type SuiteasPaySectionMountProps = Partial<SuiteasPaySectionProps> &
  Pick<SuiteasPaySectionProps, "merchant">;

function resolveEl(target: string | HTMLElement): HTMLElement {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) throw new Error(`SuiteasPay.mountSection: no element matches "${target}"`);
  return el as HTMLElement;
}

function mountSection(target: string | HTMLElement, props: SuiteasPaySectionMountProps) {
  const el = resolveEl(target);
  const root = createRoot(el);
  root.render(
    <SuiteasPaySection
      avalancheIconSrc={avalancheIconUrl}
      baseIconSrc={baseIconUrl}
      markSrc={markUrl}
      markOnDarkSrc={markOnDarkUrl}
      {...props}
    />,
  );
  return { unmount: () => root.unmount() };
}

function readAmount(v: string | undefined): number | undefined {
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Zero-JS drop-in: <div data-suiteas-pay-section data-merchant="..." data-amount="0.12" data-pay-url="https://..." data-title="..." data-subtitle="..."> */
function autoMount() {
  document.querySelectorAll<HTMLElement>("[data-suiteas-pay-section]").forEach((el) => {
    if (el.dataset.suiteasMounted) return;
    el.dataset.suiteasMounted = "true";
    mountSection(el, {
      merchant: el.dataset.merchant ?? "Merchant",
      amount: readAmount(el.dataset.amount),
      merchantLogo: el.dataset.merchantLogo,
      payUrl: el.dataset.payUrl,
      coinName: el.dataset.coinName,
      title: el.dataset.title,
      subtitle: el.dataset.subtitle,
    });
  });
}

type MountFn = (target: string | HTMLElement, props: never) => { unmount: () => void };

declare global {
  interface Window {
    SuiteasPay: { mount?: MountFn; mountSection?: MountFn };
  }
}

window.SuiteasPay = { ...window.SuiteasPay, mountSection: mountSection as MountFn };

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMount);
} else {
  autoMount();
}

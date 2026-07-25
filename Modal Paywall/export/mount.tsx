/** Entry point for the standalone bundle only (built by build.mjs into
 *  dist/suiteas-pay.js). Not used when importing SuiteasPayModal directly
 *  into a React app — that path keeps using plain "/assets/..." props. */
import React from "react";
import { createRoot } from "react-dom/client";
import SuiteasPayModal, { type SuiteasPayModalProps } from "./SuiteasPayModal";
import avalancheIconUrl from "./assets/avalanche-icon.png";
import baseIconUrl from "./assets/base-icon.png";
import markUrl from "./assets/logo/suiteas-mark.svg";
import markOnDarkUrl from "./assets/logo/suiteas-mark-on-dark.svg";

export type SuiteasPayMountProps = Partial<SuiteasPayModalProps> &
  Pick<SuiteasPayModalProps, "merchant">;

function resolveEl(target: string | HTMLElement): HTMLElement {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) throw new Error(`SuiteasPay.mount: no element matches "${target}"`);
  return el as HTMLElement;
}

function mount(target: string | HTMLElement, props: SuiteasPayMountProps) {
  const el = resolveEl(target);
  const root = createRoot(el);
  root.render(
    <SuiteasPayModal
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

/** Zero-JS drop-in: <div data-suiteas-pay data-merchant="..." data-amount="0.12" data-pay-url="https://..."> */
function autoMount() {
  document.querySelectorAll<HTMLElement>("[data-suiteas-pay]").forEach((el) => {
    if (el.dataset.suiteasMounted) return;
    el.dataset.suiteasMounted = "true";
    mount(el, {
      merchant: el.dataset.merchant ?? "Merchant",
      amount: readAmount(el.dataset.amount),
      merchantLogo: el.dataset.merchantLogo,
      payUrl: el.dataset.payUrl,
      coinName: el.dataset.coinName,
    });
  });
}

declare global {
  interface Window {
    SuiteasPay: { mount: typeof mount };
  }
}

window.SuiteasPay = { mount };

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMount);
} else {
  autoMount();
}

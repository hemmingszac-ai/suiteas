# Suite as — Pay with Koha modal

Real x402 micropayments on **Avalanche Fuji testnet**, settled in USDC. Two ways to use it:

1. **In a React app** — import `SuiteasPayModal.tsx` directly.
2. **Drag-and-drop into any HTML site** — one `<script>` tag, no build step, no React required on the host page.

Both paths call the same hosted `/api/pay` route (see `apps/web/app/api/pay/route.ts` in the main repo) to settle payment — the widget itself never touches funds directly, it just signs the EIP-3009 authorization with whatever wallet the visitor has installed (Core, MetaMask, etc.) and lets the facilitator settle it.

## Option 1 — React

Copy `SuiteasPayModal.tsx`, `suiteas-pay-client.ts`, and `assets/` into your app, and load Archivo:

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&display=swap" rel="stylesheet">
```

```tsx
import SuiteasPayModal from "./SuiteasPayModal";

<SuiteasPayModal
  merchant="PropertyUp"
  merchantLogo="/assets/products/propertyup.png"
  amount={0.12}
  payUrl="https://your-suiteas-deploy.vercel.app/api/pay"
  onPaid={({ txHash, amount, network }) => console.log(txHash, amount, network)}
/>
```

`payUrl` defaults to same-origin `/api/pay` — set it to the full deployed URL unless this app *is* the Suiteas deploy.

## Option 2 — drag-and-drop into someone else's HTML

```bash
cd "Modal Paywall/export"
npm install
npm run build        # -> dist/suiteas-pay.js (brand assets inlined, React bundled in)
```

Drop the built file into any page:

```html
<div
  data-suiteas-pay
  data-merchant="PropertyUp"
  data-amount="0.12"
  data-pay-url="https://your-suiteas-deploy.vercel.app/api/pay"
></div>
<script src="./dist/suiteas-pay.js"></script>
```

(path is wherever you host the built file — see `demo.html` for a working copy)

That's it — no other files needed, brand icons are inlined into the bundle. `merchantLogo`/`coinName` are also settable via `data-merchant-logo` / `data-coin-name` if you want them.

Prefer JS? `window.SuiteasPay.mount(selectorOrElement, props)` is also exposed, same props as the React component, and returns `{ unmount }`.

See `demo.html` for a working example (serve the folder locally, e.g. `python3 -m http.server`, and open `demo.html`).

## What's built in

- Idle → connecting → connected → paying → paid state machine, backed by a real wallet (`window.ethereum`) and real x402 settlement (`x402-fetch` + viem) — see `suiteas-pay-client.ts`
- Two networks: **Avalanche C-Chain** settles for real on Fuji; **Base Sepolia** (the Fire Eyes developer track) is always simulated — there's no Base facilitator/contract wired up, so picking it fakes a timed response instead of hitting `/api/pay`
- Auto-adds/switches the connected wallet to Avalanche Fuji (43113) — used for both networks; only the settlement path differs
- Editable amount field down to $0.001 for genuine micropayments, clamped on blur
- Error banner on connect/payment failure (no wallet installed, user rejects, insufficient funds, etc.)
- Fixed-height state area so the card doesn't resize as it moves through steps
- Receipt links to Snowtrace testnet once a real tx hash comes back

## Requirements for a real settlement

The widget only needs a wallet and network access — the server side needs:

- `X402_PAY_TO` set (a receiving address; doesn't need to be the deployed Suite pool)
- `THIRDWEB_SECRET_KEY` + `THIRDWEB_SERVER_WALLET_ADDRESS` set so `facilitatorConfig()` builds a real thirdweb facilitator (see `apps/web/lib/x402.ts`) — needs a thirdweb account signup and a server wallet funded with Fuji AVAX for gas
- The payer's wallet needs Fuji AVAX (gas, tiny) and Fuji USDC — see `SETUP.md` faucets
- None of this applies to Base Sepolia — it's simulated regardless of server config

Without a facilitator configured, `/api/pay` still returns a valid 402 with payment requirements (so the UI and error states are fully testable), it just can't settle.

## Previewing without a wallet

`previewConnect`/`previewPay` (exported from `SuiteasPayModal.tsx`) are scripted, timed mocks — pass them explicitly as `connectWallet`/`sendPayment` props to demo the UI states without touching a real wallet or the network.

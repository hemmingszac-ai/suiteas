# dNZD — on-chain inspection

New Money's dNZD on Avalanche Fuji, inspected read-only with `cast` on
2026-07-25. Every "confirmed" line below is a call anyone can repeat.

**Headline: dNZD does not implement EIP-3009, so it cannot settle over x402's
current exact-EVM scheme.** Its EIP-712 identity and decimals are confirmed and
recorded in config; the settlement status stays **pending** because the thing that
matters for the rail is not there. The pool contract itself is fine with dNZD —
the gap is only in the gasless payment leg. See "What we can still do".

## Addresses

| | |
|---|---|
| dNZD (ERC-1967 proxy) | `0x99A22a5AD6B2fd7EefE512F49dc22336dEEdf877` |
| Implementation | `0xd4858c1427484c372507dabecbe656ffdd103fb5` |
| Demo payer | `0x32f720F098816BCfe19d694D81fF9Bd8e27DaFE4` |
| Owner / deployer | `0xa7Dd13442d45450BE26843f6941B659555116bf1` |

## Confirmed

| Property | Value | How |
|---|---|---|
| `name()` | `dNZD` | direct call |
| `symbol()` | `dNZD` | direct call |
| `decimals()` | `6` | direct call |
| `totalSupply()` | `11000000000000` = 11,000,000 dNZD | direct call |
| Demo payer balance | `1000000000000` = 1,000,000.000000 dNZD | matches the stated mint |
| EIP-712 domain name | `dNZD` | `eip712Domain()` **and** domain-separator recomputation |
| EIP-712 domain version | `1` | same |
| EIP-712 chainId / verifyingContract | `43113` / the proxy address | same |
| ERC-2612 `permit` | **implemented and working** | a valid signature simulates successfully |
| `nonces(address)` | present, `0` for the demo payer | direct call |
| `paused()` | `false` | direct call |
| Transfer gating | none in effect — `isAllowed(address)` returns `true` for every address probed, including never-seen ones, and a 1 dNZD transfer to a fresh address simulates fine | direct calls |
| Proxy pattern | UUPS (`proxiableUUID` guarded, ERC-1967 admin slot empty, `UPGRADER_ROLE` present) | storage + call |
| Access control | OpenZeppelin AccessControl with `MINTER_ROLE`, `PAUSER_ROLE`, `UPGRADER_ROLE` | direct calls |

The EIP-712 domain is worth spelling out because it is the part config gets wrong
silently. Two independent confirmations:

1. `eip712Domain()` (ERC-5267) returns fields bitmap `0x0f` — name, version,
   chainId, verifyingContract, no salt — with `("dNZD", "1", 43113, 0x99A2…)`.
2. Recomputing `keccak256(abi.encode(EIP712Domain typehash, keccak("dNZD"),
   keccak("1"), 43113, 0x99A2…))` gives
   `0xa2e0290fb90215e9e1f7c77c158fbce2389f20121a6a9d911e7158acba471682`, which is
   exactly what `DOMAIN_SEPARATOR()` returns.

And it was proven end to end: a valid `Permit` signed against that domain with a
freshly generated throwaway key simulated successfully. A wrong name or version
would have failed signature recovery instead.

## Confirmed absent

| Function | Both selector forms checked |
|---|---|
| `transferWithAuthorization` | `0xe3ee160e` (v,r,s) and `0xcf092995` (bytes) |
| `receiveWithAuthorization` | `0xef55bec6` (v,r,s) and `0x88b7ab63` (bytes) |
| `authorizationState(address,bytes32)` | `0xe94a0102` |
| `cancelAuthorization` | `0x5a049a70` |
| `version()` | `0x54fd4d50` — the ERC-2612-style getter x402 falls back to |

**This is not a selector guess.** Two independent methods agree:

1. **Exhaustive enumeration.** `cast selectors` over the implementation bytecode
   lists all 41 functions the contract exposes. None of the EIP-3009 selectors
   appear, in either signature form. Every one of the 41 was accounted for.
2. **Behavioural probe with a control.** Every EIP-3009 call reverts with JSON-RPC
   error code `0` and empty data `0x` — the signature of a call that hit no
   function. A function that *is* implemented but fails validation reverts
   differently, with code `3` and an ABI-encoded reason:
   - `permit` with a bad signature → `ECDSA: invalid signature`
   - `transfer` beyond balance → `ERC20: transfer amount exceeds balance`
   - a deliberately invented function → code `0`, `0x`, same as the EIP-3009 calls

So the empty reverts mean "absent", not "present but rejecting".

## Why that blocks x402

Verified against x402 1.2.0 in `node_modules`, not assumed. Its exact-EVM scheme:

- **signs** `TransferWithAuthorization` typed data against the token's EIP-712
  domain, and
- **settles** by calling `transferWithAuthorization` on
  `paymentRequirements.asset` — the `bytes signature` form for smart wallets, the
  `(v, r, s)` form for EOAs.

dNZD has neither, so settlement would revert. ERC-2612 `permit` is **not** a
substitute: `permit` grants an allowance, it does not move tokens, so it needs a
second transaction from someone who pays gas — which is precisely the gasless
property x402 exists to provide. Supporting it is a new x402 scheme, not a
configuration change. No environment variable fixes this.

## What we can still do

Worth being precise about, because "dNZD doesn't work" is too broad:

- **The pool holds dNZD fine.** `Suite` only calls `balanceOf` and `transfer`, and
  is decimals-agnostic (tested). Deploying `Suite` with
  `SETTLEMENT_TOKEN=0x99A2…` works, and the on-chain split (flow 3) works — the
  demo payer can seed the pool with a plain transfer.
- **What does not work is the x402 leg** (flow 2): a gasless, signature-authorised
  micropayment in dNZD.
- So a dNZD demo is possible for the **split**, with the koha payment settling in
  USDC — but that is two currencies in one story and needs a deliberate call, not
  a silent config change.

## Ask New Money

1. Can dNZD add EIP-3009 (`transferWithAuthorization`, `receiveWithAuthorization`,
   `authorizationState`)? It is a UUPS proxy with an `UPGRADER_ROLE`, so an
   upgrade is technically possible without changing the address — an
   implementation question for them, not a redeployment for us.
2. If not, is there any sanctioned relayed/meta-transaction path? There is no
   custom one today: all 41 functions are accounted for, and the only one that
   looked like a meta-transaction (`0x9884f090`) is the initializer.
3. Facilitator/API details for dNZD, if they intend one.

## Repeating the checks

```bash
export RPC=https://api.avax-test.network/ext/bc/C/rpc
T=0x99A22a5AD6B2fd7EefE512F49dc22336dEEdf877

cast call $T "name()(string)"     --rpc-url $RPC
cast call $T "decimals()(uint8)"  --rpc-url $RPC
cast call $T "eip712Domain()(bytes1,string,string,uint256,address,bytes32,uint256[])" --rpc-url $RPC
cast call $T "DOMAIN_SEPARATOR()(bytes32)" --rpc-url $RPC

# absent -> reverts with code 0 and empty data
cast call $T "authorizationState(address,bytes32)(bool)" $T 0x00…01 --rpc-url $RPC

# the control: present but failing -> reverts with a reason string
cast call $T "transfer(address,uint256)(bool)" $T 1 --from 0x…dEaD --rpc-url $RPC

# the full exposed function set
cast selectors $(cast code 0xd4858c1427484c372507dabecbe656ffdd103fb5 --rpc-url $RPC)
```

All read-only. No transaction was broadcast and no private key was used, other
than a throwaway key generated on the spot for the permit simulation.

## Unresolved

- Two role constants (`0x63e849cb`, `0x797669c9`) and two role-gated admin
  functions taking `uint256[]` (`0x987c5ced`, `0xc9892a5f`) are unidentified —
  no public 4-byte match. Not payment-related; neither is reachable on the
  settlement path.
- A string getter at `0x38b90333` returns `"0.1.7"`, presumably a contract
  version. It is **not** `version()` (`0x54fd4d50`), so anything expecting the
  ERC-2612-style getter will not find one.
- The implementation source is not verified on Snowtrace, so these findings come
  from bytecode and behaviour rather than source review.
- Whether New Money intends dNZD to be upgraded for EIP-3009 — their call.

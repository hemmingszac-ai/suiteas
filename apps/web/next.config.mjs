/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @suiteas/shared ships raw TS; let Next compile it.
  transpilePackages: ["@suiteas/shared"],
  webpack: (config, { webpack }) => {
    // wagmi's connectors barrel (@wagmi/connectors) transitively imports the
    // Coinbase/base-org stack, which references optional @x402/* server-signing
    // packages we don't install or use. Present regardless of Privy's walletList,
    // so this is required as long as wagmi is a dependency. Dropping wagmi in
    // favour of Privy-native tx + viem (see docs/SPONSORS.md, option B) removes it.
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// }));
    return config;
  },
};

export default nextConfig;

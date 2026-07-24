/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @suiteas/shared ships raw TS; let Next compile it.
  transpilePackages: ["@suiteas/shared"],
  webpack: (config, { webpack }) => {
    // The Coinbase connector (pulled in transitively by wagmi) references
    // optional @x402/* server-signing packages we don't install or use.
    // Ignore them so the client bundle builds.
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// }),
    );
    return config;
  },
};

export default nextConfig;

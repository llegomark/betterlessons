/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    fontLoaders: [
      { loader: "@next/font/google", options: { subsets: ["latin"] } },
    ],
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/llegomark/betterlessons/",
        permanent: false,
      },
      {
        source: "/twitter",
        destination: "https://twitter.com/markllego/",
        permanent: false,
      },
    ];
  },
};
export default config;

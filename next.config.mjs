/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "simple-git",
    "@google/generative-ai",
    "@aws-sdk/client-s3",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      "simple-git": "commonjs simple-git",
      "@google/generative-ai": "commonjs @google/generative-ai",
      "@aws-sdk/client-s3": "commonjs @aws-sdk/client-s3",
    });
    return config;
  },
};

export default nextConfig;

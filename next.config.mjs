/** @type {import('next').NextConfig} */
const rawBasePath = process.env.BASE_PATH ?? "";
const normalizedBasePath =
  rawBasePath && rawBasePath !== "/"
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: normalizedBasePath,
  assetPrefix: normalizedBasePath || undefined,
};

export default nextConfig;

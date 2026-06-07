/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't let lint warnings (e.g. unused vars) block the production build/deploy.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;

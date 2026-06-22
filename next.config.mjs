/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'pg', 'bcryptjs'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;

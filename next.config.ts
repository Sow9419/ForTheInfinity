import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tkpdecdgidpodsawhrxm.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.airtableusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  // Cache HTTP : les pages (HTML) doivent toujours être revalidées pour
  // que les visiteurs reçoivent les dernières références d'assets ; les
  // fichiers statiques renommés (cache-bust) sont mis en cache long terme.
  async headers() {
    const immutable = { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' };
    return [
      {
        // Pages HTML et assets non versionnés : revalidation à chaque visite
        source: '/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        // Chunks internes Next.js : fingerprintés (hash dans le nom) → cache 1 an
        source: '/_next/static/:path*',
        headers: [immutable],
      },
      // Assets marque versionnés par nom de fichier : cache 1 an
      { source: '/logo-4ti.png', headers: [immutable] },
      { source: '/favicon-4ti-256.png', headers: [immutable] },
      { source: '/favicon-4ti-512.png', headers: [immutable] },
    ];
  },
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;

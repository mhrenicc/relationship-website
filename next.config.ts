import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Photos live in `public/photos/` and are deliberately kept behind the
     * password gate in `src/proxy.ts`. The image optimizer fetches source
     * files server-side without the visitor's session cookie, so it gets
     * redirected to /login and fails.
     *
     * Serving them unoptimized keeps the gate intact: the browser request
     * carries the cookie, so signed-in visitors see the photos and everyone
     * else is redirected. Excluding /photos from the gate would fix the
     * optimizer but make every personal photo world-readable, which defeats
     * the point of the site.
     */
    unoptimized: true,
  },
  experimental: {
    /**
     * Photographs are downscaled in the browser before they are sent, so a
     * request carries roughly 600KB rather than a 5MB original. This ceiling
     * exists for headroom: the default is 1MB, which a single phone photo
     * exceeds outright, and Vercel caps a function's request body at about
     * 4.5MB no matter what is set here — which is why uploads go one
     * photograph at a time rather than a whole set per request.
     */
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;

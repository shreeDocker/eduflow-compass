// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only; default cloudflare — override with nitro.preset for self-hosting),
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

const publicOutDir = resolve(".output/public");

export default defineConfig({
  nitro: {
    preset: "node-server",
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: false,
        outDir: ".output/public",
        includeAssets: ["icon.svg", "icon-maskable.svg", "robots.txt"],
        integration: {
          async beforeBuildServiceWorker(options) {
            // Production-only: TanStack outputs client assets to .output/public.
            // In dev, vite-plugin-pwa expects sw.js under dev-dist/ — do not redirect.
            if (options.mode === "development") return;

            if (!existsSync(resolve(publicOutDir, "assets"))) {
              options.disable = true;
              return;
            }
            options.workbox.globDirectory = publicOutDir;
            options.workbox.swDest = resolve(publicOutDir, "sw.js");
            options.workbox.navigateFallback = undefined;
          },
        },
        manifest: {
          name: "Swotify Plus",
          short_name: "Swotify",
          description:
            "Student success operating system — real-time syllabus tracking for teachers and principals.",
          theme_color: "#181b20",
          background_color: "#181b20",
          display: "standalone",
          orientation: "portrait-primary",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "icon-maskable.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,woff2,svg,png,ico,webmanifest}"],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "pages",
                networkTimeoutSeconds: 4,
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: {
          // Manifest only in dev — SW is generated on production build (.output/public).
          enabled: false,
          type: "module",
        },
      }),
    ],
    server: {
      // Allow tunnel hosts for mobile / remote dev testing
      allowedHosts: [".loca.lt", ".trycloudflare.com"],
    },
  },
});

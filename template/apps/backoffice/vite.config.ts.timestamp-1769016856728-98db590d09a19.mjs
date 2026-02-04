// vite.config.ts
import { defineConfig } from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6_terser@5.44.1/node_modules/vite/dist/node/index.js";
import react from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@25.0.6_terser@5.44.1_/node_modules/@vitejs/plugin-react/dist/index.js";
import tsconfigPaths from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite-tsconfig-paths@6.0.4_typescript@5.9.3_vite@7.3.1_@types+node@25.0.6_terser@5.44.1_tsx@4.21.0_yaml@2.8.2_/node_modules/vite-tsconfig-paths/dist/index.js";
import path from "path";
import { sentryVitePlugin } from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/@sentry+vite-plugin@2.23.1/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
var __vite_injected_original_dirname = "/Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/apps/backoffice";
var vite_config_default = defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5175,
    strictPort: true
  },
  plugins: [
    react(),
    tsconfigPaths({ root: path.resolve(__vite_injected_original_dirname, "../..") }),
    // Upload source maps to Sentry on production builds
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Only upload source maps in production builds
      disable: process.env.NODE_ENV !== "production",
      sourcemaps: {
        assets: "./dist/**"
      }
    })
  ],
  resolve: {
    alias: {
      // App-internal alias
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      // Force SDK to use dist (avoids @/ path alias conflicts with SDK source)
      "@xalabaas/sdk/hooks": path.resolve(__vite_injected_original_dirname, "../../packages/client-sdk/dist/hooks/index.mjs"),
      "@xalabaas/sdk/types": path.resolve(__vite_injected_original_dirname, "../../packages/client-sdk/dist/types/index.mjs"),
      "@xalabaas/sdk/services": path.resolve(__vite_injected_original_dirname, "../../packages/client-sdk/dist/services/index.mjs"),
      "@xalabaas/sdk": path.resolve(__vite_injected_original_dirname, "../../packages/client-sdk/dist/index.mjs"),
      // CSS imports cannot be resolved by tsconfig paths
      "@digdir/designsystemet-css": path.resolve(__vite_injected_original_dirname, "../../node_modules/@digdir/designsystemet-css")
    }
  },
  optimizeDeps: {
    exclude: ["@xalabaas/sdk"],
    include: ["@digdir/designsystemet-css"]
  },
  build: {
    sourcemap: true,
    // Generate source maps for production builds
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/mapbox-gl")) {
            return "vendor-mapbox";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "vendor-query";
          }
          if (id.includes("packages/client-sdk/src")) {
            return "vendor-sdk";
          }
          if (id.includes("packages/ds/src") || id.includes("@xalatechnologies/platform/ui")) {
            return "vendor-ds";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 800
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9MYXJhdmVsL1hhbGEtU0FBUy90b29scy94YWxhLWRpZ2Rpci1tb25vcmVwby9hcHBzL2JhY2tvZmZpY2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Wb2x1bWVzL0xhcmF2ZWwvWGFsYS1TQUFTL3Rvb2xzL3hhbGEtZGlnZGlyLW1vbm9yZXBvL2FwcHMvYmFja29mZmljZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVm9sdW1lcy9MYXJhdmVsL1hhbGEtU0FBUy90b29scy94YWxhLWRpZ2Rpci1tb25vcmVwby9hcHBzL2JhY2tvZmZpY2Uvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc2VudHJ5Vml0ZVBsdWdpbiB9IGZyb20gJ0BzZW50cnkvdml0ZS1wbHVnaW4nO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcG9ydDogNTE3NSxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0c2NvbmZpZ1BhdGhzKHsgcm9vdDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uJykgfSksXG4gICAgLy8gVXBsb2FkIHNvdXJjZSBtYXBzIHRvIFNlbnRyeSBvbiBwcm9kdWN0aW9uIGJ1aWxkc1xuICAgIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgICAgb3JnOiBwcm9jZXNzLmVudi5TRU5UUllfT1JHLFxuICAgICAgcHJvamVjdDogcHJvY2Vzcy5lbnYuU0VOVFJZX1BST0pFQ1QsXG4gICAgICBhdXRoVG9rZW46IHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOLFxuICAgICAgLy8gT25seSB1cGxvYWQgc291cmNlIG1hcHMgaW4gcHJvZHVjdGlvbiBidWlsZHNcbiAgICAgIGRpc2FibGU6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsXG4gICAgICBzb3VyY2VtYXBzOiB7XG4gICAgICAgIGFzc2V0czogJy4vZGlzdC8qKicsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIC8vIEFwcC1pbnRlcm5hbCBhbGlhc1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgIC8vIEZvcmNlIFNESyB0byB1c2UgZGlzdCAoYXZvaWRzIEAvIHBhdGggYWxpYXMgY29uZmxpY3RzIHdpdGggU0RLIHNvdXJjZSlcbiAgICAgICdAZGlnaWxpc3QvY2xpZW50LXNkay9ob29rcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9jbGllbnQtc2RrL2Rpc3QvaG9va3MvaW5kZXgubWpzJyksXG4gICAgICAnQGRpZ2lsaXN0L2NsaWVudC1zZGsvdHlwZXMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvY2xpZW50LXNkay9kaXN0L3R5cGVzL2luZGV4Lm1qcycpLFxuICAgICAgJ0BkaWdpbGlzdC9jbGllbnQtc2RrL3NlcnZpY2VzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2NsaWVudC1zZGsvZGlzdC9zZXJ2aWNlcy9pbmRleC5tanMnKSxcbiAgICAgICdAZGlnaWxpc3QvY2xpZW50LXNkayc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9jbGllbnQtc2RrL2Rpc3QvaW5kZXgubWpzJyksXG4gICAgICAvLyBDU1MgaW1wb3J0cyBjYW5ub3QgYmUgcmVzb2x2ZWQgYnkgdHNjb25maWcgcGF0aHNcbiAgICAgICdAZGlnZGlyL2Rlc2lnbnN5c3RlbWV0LWNzcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9ub2RlX21vZHVsZXMvQGRpZ2Rpci9kZXNpZ25zeXN0ZW1ldC1jc3MnKSxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ0BkaWdpbGlzdC9jbGllbnQtc2RrJ10sXG4gICAgaW5jbHVkZTogWydAZGlnZGlyL2Rlc2lnbnN5c3RlbWV0LWNzcyddLFxuICB9LFxuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogdHJ1ZSwgLy8gR2VuZXJhdGUgc291cmNlIG1hcHMgZm9yIHByb2R1Y3Rpb24gYnVpbGRzXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczogKGlkKSA9PiB7XG4gICAgICAgICAgLy8gTWFwYm94IEdMIGluIHNlcGFyYXRlIGNodW5rIChsYXJnZSwgcmFyZWx5IGNoYW5nZXMpXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbWFwYm94LWdsJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLW1hcGJveCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVhY3QgUXVlcnkgaW4gc2VwYXJhdGUgY2h1bmtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AdGFuc3RhY2svcmVhY3QtcXVlcnknKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItcXVlcnknO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENsaWVudCBTREsgaW4gc2VwYXJhdGUgY2h1bmtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL2NsaWVudC1zZGsvc3JjJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXNkayc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGVzaWduIHN5c3RlbSBpbiBzZXBhcmF0ZSBjaHVua1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvZHMvc3JjJykgfHwgaWQuaW5jbHVkZXMoJ0B4YWxhdGVjaG5vbG9naWVzL3BsYXRmb3JtL3VpJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWRzJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBFdmVyeXRoaW5nIGVsc2UgZnJvbSBub2RlX21vZHVsZXMgZ29lcyB0b2dldGhlclxuICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGJldHdlZW4gY2h1bmtzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBJbmNyZWFzZSBjaHVuayBzaXplIHdhcm5pbmcgbGltaXRcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDgwMCxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpWSxTQUFTLG9CQUFvQjtBQUM5WixPQUFPLFdBQVc7QUFDbEIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsd0JBQXdCO0FBSmpDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixjQUFjLEVBQUUsTUFBTSxLQUFLLFFBQVEsa0NBQVcsT0FBTyxFQUFFLENBQUM7QUFBQTtBQUFBLElBRXhELGlCQUFpQjtBQUFBLE1BQ2YsS0FBSyxRQUFRLElBQUk7QUFBQSxNQUNqQixTQUFTLFFBQVEsSUFBSTtBQUFBLE1BQ3JCLFdBQVcsUUFBUSxJQUFJO0FBQUE7QUFBQSxNQUV2QixTQUFTLFFBQVEsSUFBSSxhQUFhO0FBQUEsTUFDbEMsWUFBWTtBQUFBLFFBQ1YsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxNQUVMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQTtBQUFBLE1BRXBDLDhCQUE4QixLQUFLLFFBQVEsa0NBQVcsZ0RBQWdEO0FBQUEsTUFDdEcsOEJBQThCLEtBQUssUUFBUSxrQ0FBVyxnREFBZ0Q7QUFBQSxNQUN0RyxpQ0FBaUMsS0FBSyxRQUFRLGtDQUFXLG1EQUFtRDtBQUFBLE1BQzVHLHdCQUF3QixLQUFLLFFBQVEsa0NBQVcsMENBQTBDO0FBQUE7QUFBQSxNQUUxRiw4QkFBOEIsS0FBSyxRQUFRLGtDQUFXLCtDQUErQztBQUFBLElBQ3ZHO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLHNCQUFzQjtBQUFBLElBQ2hDLFNBQVMsQ0FBQyw0QkFBNEI7QUFBQSxFQUN4QztBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjLENBQUMsT0FBTztBQUVwQixjQUFJLEdBQUcsU0FBUyx3QkFBd0IsR0FBRztBQUN6QyxtQkFBTztBQUFBLFVBQ1Q7QUFHQSxjQUFJLEdBQUcsU0FBUyxvQ0FBb0MsR0FBRztBQUNyRCxtQkFBTztBQUFBLFVBQ1Q7QUFHQSxjQUFJLEdBQUcsU0FBUyx5QkFBeUIsR0FBRztBQUMxQyxtQkFBTztBQUFBLFVBQ1Q7QUFHQSxjQUFJLEdBQUcsU0FBUyxpQkFBaUIsS0FBSyxHQUFHLFNBQVMsK0JBQStCLEdBQUc7QUFDbEYsbUJBQU87QUFBQSxVQUNUO0FBSUEsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQSxFQUN6QjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import type { Plugin } from 'vite';

/**
 * Strip `@import "tailwindcss"` from vitrine CSS files.
 * Tailwind is already injected via styles/tailwind.css — processing it again
 * from the vitrine's own node_modules causes a PostCSS @layer conflict.
 */
function stripVitrineTailwindImport(): Plugin {
  return {
    name: 'strip-vitrine-tailwind-import',
    transform(code, id) {
      if (
        id.includes('vitrine') &&
        (id.endsWith('.css') || id.includes('main.css'))
      ) {
        return {
          code: code.replace(/@import\s+["']tailwindcss["'];?\s*/g, ''),
          map: null,
        };
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  // Real path to the vitrine source (junction target)
  const vitrineRealPath = path.resolve(
    __dirname,
    "../../code front/front-ennea/src"
  );

  return {
    plugins: [stripVitrineTailwindImport(), react()],
    // Base path: use VITE_BASE_PATH (allows '/' for subdomain root like https://course.alingua.ma/)
    base: env.VITE_BASE_PATH || "/",
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    css: {
      // Use inline postcss config so packages resolve from frontend-app/node_modules
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
        // Ensure tailwindcss resolves from our node_modules, not vitrine's
        "tailwindcss": path.resolve(__dirname, "node_modules/tailwindcss"),
      },
    },
    server: {
      fs: {
        // Allow serving files from outside the project root (vitrine source)
        allow: [
          path.resolve(__dirname),
          vitrineRealPath,
          path.resolve(__dirname, "../../code front/front-ennea"),
        ],
      },
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import fg from "fast-glob";
import path from "node:path";
import fs from "node:fs";

function buildInputs() {
  const files = fg.sync("src/components/*.vue", { dot: false });
  return Object.fromEntries(
    files.map((f) => [path.basename(f, ".vue"), path.resolve(f)])
  );
}

function multiEntryVueDevEndpoints(options) {
  const { entries } = options;
  const V_PREFIX = "\0vue-multi-entry:";

  const renderDevHtml = (name) => `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} Component</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/${name}.js"></script>
</body>
</html>`;

  return {
    name: "vue-multi-entry-dev-endpoints",
    resolveId(id) {
      if (id.startsWith("/")) id = id.slice(1);
      if (id.endsWith(".js")) {
        const name = id.slice(0, -3);
        if (entries[name]) return `${V_PREFIX}entry:${name}`;
      }
      if (id.endsWith(".html")) {
        const name = id.slice(0, -5);
        if (entries[name]) return `${V_PREFIX}html:${name}`;
      }
      if (id.startsWith(V_PREFIX)) return id;
      return null;
    },
    load(id) {
      if (!id.startsWith(V_PREFIX)) return null;

      const rest = id.slice(V_PREFIX.length);
      const [kind, name] = rest.split(":", 2);
      const entry = entries[name];
      if (!entry) return null;

      if (kind === "html") {
        return renderDevHtml(name);
      }

      if (kind === "entry") {
        return `
import './src/base.css'
import { createApp } from 'vue'
import Component from '${entry}'

createApp(Component).mount('#app')
`;
      }
      return null;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET" || !req.url) return next();
        const url = req.url.split("?")[0];

        if (url.endsWith(".html")) {
          const m = url.match(/^\/?([\w-]+)\.html$/);
          if (m && entries[m[1]]) {
            const html = renderDevHtml(m[1]);
            res.setHeader("Content-Type", "text/html");
            res.end(html);
            return;
          }
        }
        next();
      });
    },
  };
}

const inputs = buildInputs();

// Créer le dossier temp s'il n'existe pas
if (!fs.existsSync('temp')) {
  fs.mkdirSync('temp');
}

// Créer des fichiers HTML dans temp pour le build
Object.keys(inputs).forEach((name) => {
  const htmlContent = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} Component</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/${name}.js"></script>
</body>
</html>`;
  fs.writeFileSync(`temp/${name}.html`, htmlContent);
});

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    viteSingleFile(),
    multiEntryVueDevEndpoints({ entries: inputs }),
  ],
  build: {
    target: "es2022",
    minify: "esbuild",
    outDir: "dist",
    rollupOptions: {
      input: Object.fromEntries(
        Object.keys(inputs).map((name) => [name, `temp/${name}.html`])
      ),
    },
  },
});

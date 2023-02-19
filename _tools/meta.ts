import { BuildOptions } from "https://deno.land/x/dnt@0.33.1/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {},
  compilerOptions: {
    lib: ["esnext", "dom"],
  },
  typeCheck: true,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  package: {
    name: "@httpland/http-auth",
    version,
    description:
      "HTTP authentication middleware framework for standard Request and Response",
    keywords: [
      "http",
      "middleware",
      "auth",
      "authentication",
      "framework",
      "handler",
      "basic",
      "bearer",
      "request",
      "response",
    ],
    license: "MIT",
    homepage: "https://github.com/httpland/http-auth",
    repository: {
      type: "git",
      url: "git+https://github.com/httpland/http-auth.git",
    },
    bugs: {
      url: "https://github.com/httpland/http-auth/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
  },
  packageManager: "pnpm",
});

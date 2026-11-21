// Compiles the Rust sim in rust/flock to public/wasm/flock.wasm.
//
//   npm run wasm
//
// Needs Rust with the WebAssembly target:
//   rustup target add wasm32-unknown-unknown
// The compiled .wasm is committed, so the site deploys without Rust installed.

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, statSync } from "node:fs";

execFileSync(
  "cargo",
  ["build", "--release", "--target", "wasm32-unknown-unknown", "--manifest-path", "rust/flock/Cargo.toml"],
  { stdio: "inherit" },
);
mkdirSync("public/wasm", { recursive: true });
const out = "public/wasm/flock.wasm";
copyFileSync("rust/flock/target/wasm32-unknown-unknown/release/flock.wasm", out);
console.log(`${out}  ${(statSync(out).size / 1024).toFixed(1)} KB`);

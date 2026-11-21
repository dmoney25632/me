// Copy for /lab, the Rust + WebAssembly flocking sim (code in rust/flock).

export const lab = {
  name: "Flock",
  source: "https://github.com/dmoney25632/me/tree/main/rust/flock",
  description: "Thousands of birds flocking in real time: a Rust simulation compiled to WebAssembly, running in your browser.",
  intro:
    "Every bird only looks at the birds right around it and follows three simple rules. Nobody is in charge, but the whole flock swirls and splits and joins back up like the real thing. The physics is written in Rust and compiled to WebAssembly, so it runs at native-ish speed right in your browser.",
  rules: [
    { title: "Separation", body: "Don't crowd. Steer away from neighbours that get too close." },
    { title: "Alignment", body: "Fly the way your neighbours are flying." },
    { title: "Cohesion", body: "Drift toward the middle of the birds around you." },
  ],
  details: [
    "Neighbour search uses a uniform grid the size of a bird's vision, so each bird checks only the 3×3 cells around it instead of every other bird.",
    "The Rust side exposes a tiny C-style API. JavaScript reads every bird's position straight out of WebAssembly memory each frame, with no copying.",
    "The hot loop never allocates: the grid and buffers are reused every step, and new velocities are double-buffered so update order doesn't matter.",
    "The world wraps at the edges, and the module has zero imports, so it can't touch anything outside its own sandbox.",
    "cargo test runs headless physics checks: birds stay on screen, speeds stay capped, a random crowd lines up into a flock, and the pointer clears space.",
  ],
};

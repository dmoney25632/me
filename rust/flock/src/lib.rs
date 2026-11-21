//! Flock: a boids simulation in plain Rust, compiled to WebAssembly.
//!
//! Every bird follows three local rules (Craig Reynolds, 1986):
//!   1. separation: don't crowd your neighbours,
//!   2. alignment:  fly the way your neighbours fly,
//!   3. cohesion:   drift toward your neighbours' centre.
//! Nobody leads, yet the whole flock moves as one.
//!
//! Finding neighbours naively is O(n²). Instead, each step buckets birds
//! into a uniform grid whose cells are one perception radius wide, so a bird
//! only looks at the 3×3 cells around it: roughly O(n).
//!
//! The JS side (src/components/lab/) calls the `flock_*` functions below and
//! reads positions straight out of WebAssembly memory, with no copying.

use std::f32::consts::PI;

/// Knobs the UI exposes. All weights are unitless multipliers.
#[derive(Clone, Copy, Debug)]
pub struct Params {
    pub separation: f32,
    pub alignment: f32,
    pub cohesion: f32,
    /// Top speed in pixels per second.
    pub max_speed: f32,
    /// How far a bird can see, in pixels.
    pub radius: f32,
}

impl Default for Params {
    fn default() -> Self {
        Params { separation: 1.6, alignment: 1.0, cohesion: 0.9, max_speed: 170.0, radius: 32.0 }
    }
}

/// How the pointer affects the flock.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Pointer {
    None,
    Attract,
    Repel,
}

pub struct World {
    w: f32,
    h: f32,
    pos: Vec<f32>,
    vel: Vec<f32>,
    next_vel: Vec<f32>,
    /// What JS reads every frame: x, y, heading (radians), speed (0..1).
    out: Vec<f32>,
    cols: usize,
    rows: usize,
    cell_start: Vec<u32>,
    cell_items: Vec<u32>,
    cell_of: Vec<u32>,
    /// Reused every step so the hot loop never allocates.
    cursor: Vec<u32>,
    pub params: Params,
    rng: u32,
}

/// Neighbours considered per bird. Past this the answer barely changes.
const MAX_NEIGHBOURS: u32 = 48;
/// Pointer reach in pixels.
const POINTER_RADIUS: f32 = 170.0;

impl World {
    pub fn new(n: usize, w: f32, h: f32, seed: u32) -> World {
        let mut world = World {
            w: w.max(1.0),
            h: h.max(1.0),
            pos: Vec::new(),
            vel: Vec::new(),
            next_vel: Vec::new(),
            out: Vec::new(),
            cols: 1,
            rows: 1,
            cell_start: Vec::new(),
            cell_items: Vec::new(),
            cell_of: Vec::new(),
            cursor: Vec::new(),
            params: Params::default(),
            rng: seed | 1,
        };
        world.set_count(n);
        world.rebuild_grid_shape();
        world
    }

    pub fn len(&self) -> usize {
        self.pos.len() / 2
    }

    pub fn is_empty(&self) -> bool {
        self.pos.is_empty()
    }

    /// xorshift32: fast, deterministic, good enough for scattering birds.
    fn rand(&mut self) -> f32 {
        let mut x = self.rng;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        self.rng = x;
        (x >> 8) as f32 / (1u32 << 24) as f32
    }

    /// Grow or shrink the flock. New birds appear at random with a random heading.
    pub fn set_count(&mut self, n: usize) {
        let old = self.len();
        self.pos.truncate(n * 2);
        self.vel.truncate(n * 2);
        for _ in old..n {
            let (x, y) = (self.rand() * self.w, self.rand() * self.h);
            let a = self.rand() * 2.0 * PI;
            let s = self.params.max_speed * (0.6 + 0.4 * self.rand());
            self.pos.extend_from_slice(&[x, y]);
            self.vel.extend_from_slice(&[a.cos() * s, a.sin() * s]);
        }
        self.next_vel = vec![0.0; n * 2];
        self.out = vec![0.0; n * 4];
        self.cell_items = vec![0; n];
        self.cell_of = vec![0; n];
        self.write_out();
    }

    pub fn resize(&mut self, w: f32, h: f32) {
        let (w, h) = (w.max(1.0), h.max(1.0));
        let (sx, sy) = (w / self.w, h / self.h);
        for i in 0..self.len() {
            self.pos[i * 2] *= sx;
            self.pos[i * 2 + 1] *= sy;
        }
        self.w = w;
        self.h = h;
        self.rebuild_grid_shape();
    }

    /// Send everyone flying outward from the centre.
    pub fn scatter(&mut self) {
        let (cx, cy) = (self.w / 2.0, self.h / 2.0);
        for i in 0..self.len() {
            let dx = self.pos[i * 2] - cx;
            let dy = self.pos[i * 2 + 1] - cy;
            let d = (dx * dx + dy * dy).sqrt().max(1.0);
            let s = self.params.max_speed;
            self.vel[i * 2] = dx / d * s;
            self.vel[i * 2 + 1] = dy / d * s;
        }
    }

    fn rebuild_grid_shape(&mut self) {
        let r = self.params.radius.max(4.0);
        self.cols = ((self.w / r) as usize).max(1);
        self.rows = ((self.h / r) as usize).max(1);
        self.cell_start = vec![0; self.cols * self.rows + 1];
    }

    fn cell(&self, x: f32, y: f32) -> usize {
        let cx = ((x / self.w * self.cols as f32) as usize).min(self.cols - 1);
        let cy = ((y / self.h * self.rows as f32) as usize).min(self.rows - 1);
        cy * self.cols + cx
    }

    /// Counting sort of birds into grid cells.
    fn bin(&mut self) {
        let n = self.len();
        self.cell_start.iter_mut().for_each(|c| *c = 0);
        for i in 0..n {
            let c = self.cell(self.pos[i * 2], self.pos[i * 2 + 1]);
            self.cell_of[i] = c as u32;
            self.cell_start[c + 1] += 1;
        }
        for c in 1..self.cell_start.len() {
            self.cell_start[c] += self.cell_start[c - 1];
        }
        self.cursor.clear();
        self.cursor.extend_from_slice(&self.cell_start);
        for i in 0..n {
            let c = self.cell_of[i] as usize;
            self.cell_items[self.cursor[c] as usize] = i as u32;
            self.cursor[c] += 1;
        }
    }

    /// Shortest offset on a wrapping axis.
    #[inline]
    fn wrap_delta(d: f32, size: f32) -> f32 {
        if d > size * 0.5 {
            d - size
        } else if d < -size * 0.5 {
            d + size
        } else {
            d
        }
    }

    /// Advance the simulation by `dt` seconds.
    pub fn step(&mut self, dt: f32, px: f32, py: f32, pointer: Pointer) {
        let n = self.len();
        if n == 0 {
            return;
        }
        let dt = dt.clamp(0.0, 1.0 / 20.0);
        self.bin();

        let p = self.params;
        let r2 = p.radius * p.radius;
        let sep_r = p.radius * 0.5;
        let sep_r2 = sep_r * sep_r;
        let max_force = p.max_speed * 2.4;
        let min_speed = p.max_speed * 0.45;
        let (cols, rows) = (self.cols as isize, self.rows as isize);

        for i in 0..n {
            let (x, y) = (self.pos[i * 2], self.pos[i * 2 + 1]);
            let (vx, vy) = (self.vel[i * 2], self.vel[i * 2 + 1]);
            let c = self.cell_of[i] as isize;
            let (ccx, ccy) = (c % cols, c / cols);

            let (mut ax, mut ay) = (0.0f32, 0.0f32); // alignment
            let (mut cx, mut cy) = (0.0f32, 0.0f32); // cohesion (offsets)
            let (mut sx, mut sy) = (0.0f32, 0.0f32); // separation
            let mut count = 0u32;

            // Visit each distinct neighbouring cell once, even on tiny grids.
            let mut seen = [usize::MAX; 9];
            let mut k = 0;
            'cells: for oy in -1..=1isize {
                for ox in -1..=1isize {
                    let nx = (ccx + ox).rem_euclid(cols);
                    let ny = (ccy + oy).rem_euclid(rows);
                    let cell = (ny * cols + nx) as usize;
                    if seen[..k].contains(&cell) {
                        continue;
                    }
                    seen[k] = cell;
                    k += 1;
                    let (a, b) = (self.cell_start[cell] as usize, self.cell_start[cell + 1] as usize);
                    for &j in &self.cell_items[a..b] {
                        let j = j as usize;
                        if j == i {
                            continue;
                        }
                        let dx = Self::wrap_delta(self.pos[j * 2] - x, self.w);
                        let dy = Self::wrap_delta(self.pos[j * 2 + 1] - y, self.h);
                        let d2 = dx * dx + dy * dy;
                        if d2 > r2 || d2 == 0.0 {
                            continue;
                        }
                        ax += self.vel[j * 2];
                        ay += self.vel[j * 2 + 1];
                        cx += dx;
                        cy += dy;
                        if d2 < sep_r2 {
                            // Push away, harder the closer they are.
                            sx -= dx / d2;
                            sy -= dy / d2;
                        }
                        count += 1;
                        if count >= MAX_NEIGHBOURS {
                            break 'cells;
                        }
                    }
                }
            }

            let (mut fx, mut fy) = (0.0f32, 0.0f32);
            if count > 0 {
                let inv = 1.0 / count as f32;
                let (stx, sty) = steer(ax * inv, ay * inv, vx, vy, p.max_speed, max_force);
                fx += stx * p.alignment;
                fy += sty * p.alignment;
                let (stx, sty) = steer(cx * inv, cy * inv, vx, vy, p.max_speed, max_force);
                fx += stx * p.cohesion;
                fy += sty * p.cohesion;
                if sx != 0.0 || sy != 0.0 {
                    let (stx, sty) = steer(sx, sy, vx, vy, p.max_speed, max_force);
                    fx += stx * p.separation;
                    fy += sty * p.separation;
                }
            }

            if pointer != Pointer::None {
                let dx = Self::wrap_delta(px - x, self.w);
                let dy = Self::wrap_delta(py - y, self.h);
                let d2 = dx * dx + dy * dy;
                if d2 < POINTER_RADIUS * POINTER_RADIUS && d2 > 1.0 {
                    let falloff = 1.0 - (d2).sqrt() / POINTER_RADIUS;
                    let sign = if pointer == Pointer::Attract { 1.0 } else { -1.0 };
                    let (stx, sty) = steer(dx * sign, dy * sign, vx, vy, p.max_speed * 1.3, max_force * 2.0);
                    fx += stx * 2.5 * falloff;
                    fy += sty * 2.5 * falloff;
                }
            }

            let (fx, fy) = limit(fx, fy, max_force * 2.0);
            let mut nvx = vx + fx * dt;
            let mut nvy = vy + fy * dt;
            let speed = (nvx * nvx + nvy * nvy).sqrt();
            if speed > p.max_speed {
                nvx *= p.max_speed / speed;
                nvy *= p.max_speed / speed;
            } else if speed < min_speed && speed > 0.0 {
                nvx *= min_speed / speed;
                nvy *= min_speed / speed;
            }
            self.next_vel[i * 2] = nvx;
            self.next_vel[i * 2 + 1] = nvy;
        }

        std::mem::swap(&mut self.vel, &mut self.next_vel);
        for i in 0..n {
            let x = self.pos[i * 2] + self.vel[i * 2] * dt;
            let y = self.pos[i * 2 + 1] + self.vel[i * 2 + 1] * dt;
            self.pos[i * 2] = x.rem_euclid(self.w);
            self.pos[i * 2 + 1] = y.rem_euclid(self.h);
            // rem_euclid can return exactly `w` for tiny negatives in f32.
            if self.pos[i * 2] >= self.w {
                self.pos[i * 2] = 0.0;
            }
            if self.pos[i * 2 + 1] >= self.h {
                self.pos[i * 2 + 1] = 0.0;
            }
        }
        self.write_out();
    }

    fn write_out(&mut self) {
        let max = self.params.max_speed.max(1.0);
        for i in 0..self.len() {
            let (vx, vy) = (self.vel[i * 2], self.vel[i * 2 + 1]);
            self.out[i * 4] = self.pos[i * 2];
            self.out[i * 4 + 1] = self.pos[i * 2 + 1];
            self.out[i * 4 + 2] = vy.atan2(vx);
            self.out[i * 4 + 3] = ((vx * vx + vy * vy).sqrt() / max).min(1.0);
        }
    }

    /// x, y, heading, speed for every bird, packed.
    pub fn data(&self) -> &[f32] {
        &self.out
    }

    pub fn velocity(&self, i: usize) -> (f32, f32) {
        (self.vel[i * 2], self.vel[i * 2 + 1])
    }

    /// How lined-up the flock is: 1.0 when everyone flies the same way, ~0 when random.
    pub fn order(&self) -> f32 {
        let (mut sx, mut sy) = (0.0f32, 0.0f32);
        let n = self.len();
        for i in 0..n {
            let (vx, vy) = self.velocity(i);
            let s = (vx * vx + vy * vy).sqrt().max(1e-6);
            sx += vx / s;
            sy += vy / s;
        }
        if n == 0 {
            0.0
        } else {
            (sx * sx + sy * sy).sqrt() / n as f32
        }
    }
}

/// Reynolds steering: desired velocity at full speed, minus current, capped.
#[inline]
fn steer(dx: f32, dy: f32, vx: f32, vy: f32, max_speed: f32, max_force: f32) -> (f32, f32) {
    let m = (dx * dx + dy * dy).sqrt();
    if m == 0.0 {
        return (0.0, 0.0);
    }
    limit(dx / m * max_speed - vx, dy / m * max_speed - vy, max_force)
}

#[inline]
fn limit(x: f32, y: f32, max: f32) -> (f32, f32) {
    let m2 = x * x + y * y;
    if m2 > max * max {
        let m = (m2).sqrt();
        (x / m * max, y / m * max)
    } else {
        (x, y)
    }
}

// ----------------------------------------------------------------- C ABI for JS
// A World lives behind a raw pointer that JS holds as a number. Every function
// tolerates a null pointer so a bad call can't crash the page.

#[no_mangle]
pub extern "C" fn flock_new(n: u32, w: f32, h: f32, seed: u32) -> *mut World {
    Box::into_raw(Box::new(World::new(n.min(20_000) as usize, w, h, seed)))
}

/// # Safety
/// `world` must come from `flock_new` (or be null) and not be used afterwards.
#[no_mangle]
pub unsafe extern "C" fn flock_free(world: *mut World) {
    if !world.is_null() {
        drop(Box::from_raw(world));
    }
}

/// # Safety
/// `world` must come from `flock_new` (or be null).
#[no_mangle]
pub unsafe extern "C" fn flock_step(world: *mut World, dt: f32, px: f32, py: f32, pointer: u32) {
    if let Some(w) = world.as_mut() {
        let p = match pointer {
            1 => Pointer::Attract,
            2 => Pointer::Repel,
            _ => Pointer::None,
        };
        w.step(dt, px, py, p);
    }
}

/// # Safety
/// `world` must come from `flock_new` (or be null).
#[no_mangle]
pub unsafe extern "C" fn flock_resize(world: *mut World, w: f32, h: f32) {
    if let Some(world) = world.as_mut() {
        world.resize(w, h);
    }
}

/// # Safety
/// `world` must come from `flock_new` (or be null).
#[no_mangle]
pub unsafe extern "C" fn flock_set_count(world: *mut World, n: u32) {
    if let Some(world) = world.as_mut() {
        world.set_count(n.min(20_000) as usize);
    }
}

/// # Safety
/// `world` must come from `flock_new` (or be null).
#[no_mangle]
pub unsafe extern "C" fn flock_set_params(world: *mut World, separation: f32, alignment: f32, cohesion: f32, speed: f32) {
    if let Some(world) = world.as_mut() {
        let clean = |v: f32, lo: f32, hi: f32| if v.is_finite() { v.clamp(lo, hi) } else { lo };
        world.params.separation = clean(separation, 0.0, 5.0);
        world.params.alignment = clean(alignment, 0.0, 5.0);
        world.params.cohesion = clean(cohesion, 0.0, 5.0);
        world.params.max_speed = clean(speed, 20.0, 600.0);
    }
}

/// # Safety
/// `world` must come from `flock_new` (or be null).
#[no_mangle]
pub unsafe extern "C" fn flock_scatter(world: *mut World) {
    if let Some(world) = world.as_mut() {
        world.scatter();
    }
}

/// Pointer to `count * 4` floats: x, y, heading, speed.
///
/// # Safety
/// `world` must come from `flock_new` (or be null).
#[no_mangle]
pub unsafe extern "C" fn flock_data(world: *const World) -> *const f32 {
    world.as_ref().map_or(std::ptr::null(), |w| w.data().as_ptr())
}

/// # Safety
/// `world` must come from `flock_new` (or be null).
#[no_mangle]
pub unsafe extern "C" fn flock_count(world: *const World) -> u32 {
    world.as_ref().map_or(0, |w| w.len() as u32)
}

/// # Safety
/// `world` must come from `flock_new` (or be null).
#[no_mangle]
pub unsafe extern "C" fn flock_order(world: *const World) -> f32 {
    world.as_ref().map_or(0.0, |w| w.order())
}

// ----------------------------------------------------------------- tests
// `cargo test` runs these natively: the "sims" that check the physics.

#[cfg(test)]
mod tests {
    use super::*;

    fn run(world: &mut World, seconds: f32) {
        let steps = (seconds * 60.0) as usize;
        for _ in 0..steps {
            world.step(1.0 / 60.0, 0.0, 0.0, Pointer::None);
        }
    }

    #[test]
    fn birds_stay_on_screen() {
        let mut w = World::new(800, 640.0, 360.0, 7);
        run(&mut w, 10.0);
        for c in w.data().chunks(4) {
            assert!(c[0] >= 0.0 && c[0] < 640.0, "x out of bounds: {}", c[0]);
            assert!(c[1] >= 0.0 && c[1] < 360.0, "y out of bounds: {}", c[1]);
        }
    }

    #[test]
    fn speed_stays_within_limits() {
        let mut w = World::new(500, 800.0, 600.0, 3);
        run(&mut w, 5.0);
        let max = w.params.max_speed;
        for i in 0..w.len() {
            let (vx, vy) = w.velocity(i);
            let s = (vx * vx + vy * vy).sqrt();
            assert!(s <= max * 1.001 && s >= max * 0.44, "speed {s}");
        }
    }

    #[test]
    fn a_random_crowd_becomes_a_flock() {
        let mut w = World::new(600, 600.0, 400.0, 42);
        let before = w.order();
        run(&mut w, 30.0);
        let after = w.order();
        assert!(before < 0.2, "should start disordered, got {before}");
        assert!(after > before + 0.3, "should line up: {before} -> {after}");
    }

    #[test]
    fn birds_dont_pile_up() {
        let mut w = World::new(400, 500.0, 500.0, 9);
        run(&mut w, 10.0);
        let d = w.data();
        let mut stacked = 0;
        for i in 0..w.len() {
            for j in (i + 1)..w.len() {
                let dx = d[i * 4] - d[j * 4];
                let dy = d[i * 4 + 1] - d[j * 4 + 1];
                if dx * dx + dy * dy < 0.25 {
                    stacked += 1;
                }
            }
        }
        assert!(stacked < w.len() / 20, "{stacked} pairs on top of each other");
    }

    #[test]
    fn repel_pushes_birds_away_from_the_pointer() {
        let mut w = World::new(600, 800.0, 800.0, 5);
        let near = |w: &World| {
            w.data().chunks(4).filter(|c| (c[0] - 400.0).powi(2) + (c[1] - 400.0).powi(2) < 80.0 * 80.0).count()
        };
        run(&mut w, 2.0);
        let before = near(&w);
        for _ in 0..120 {
            w.step(1.0 / 60.0, 400.0, 400.0, Pointer::Repel);
        }
        assert!(near(&w) < before.max(1), "repel should clear the centre: {before} -> {}", near(&w));
    }

    #[test]
    fn resize_and_recount_keep_things_valid() {
        let mut w = World::new(100, 300.0, 300.0, 1);
        w.resize(1200.0, 200.0);
        w.set_count(3000);
        run(&mut w, 1.0);
        assert_eq!(w.len(), 3000);
        assert!(w.data().iter().all(|v| v.is_finite()));
        w.set_count(10);
        run(&mut w, 0.5);
        assert_eq!(w.data().len(), 40);
    }

    #[test]
    fn c_api_survives_bad_input() {
        unsafe {
            flock_step(std::ptr::null_mut(), 0.016, 0.0, 0.0, 9);
            assert_eq!(flock_count(std::ptr::null()), 0);
            let w = flock_new(50, 200.0, 200.0, 2);
            flock_set_params(w, f32::NAN, -3.0, 99.0, f32::INFINITY);
            flock_step(w, 1.0, 10.0, 10.0, 7);
            assert_eq!(flock_count(w), 50);
            assert!(!flock_data(w).is_null());
            drop(Box::from_raw(w));
        }
    }
}

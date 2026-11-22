//! kit: the Rust behind the terminal on dayton's site, compiled to one small
//! WebAssembly module with no imports. It can't touch the network, the page
//! or anything else: bytes go in, bytes come out.
//!
//!   hash      SHA-256, HMAC, PBKDF2           (sha256.rs)
//!   encrypt   PBKDF2 → ChaCha20 + HMAC         (cipher.rs)
//!   pwcheck   guess-count strength estimator   (password.rs)
//!   pwgen     unbiased password generator      (password.rs)
//!   flock     boids simulation                 (flock.rs)
//!
//! The JS side is src/lib/kit.ts. Strings cross the boundary as UTF-8 in
//! buffers from `kit_alloc`; results land in one output buffer that JS reads
//! with `kit_out_ptr` / `kit_out_len`.

pub mod cipher;
pub mod flock;
pub mod password;
pub mod sha256;

use std::cell::RefCell;

thread_local! {
    static OUT: RefCell<Vec<u8>> = const { RefCell::new(Vec::new()) };
}

fn set_out(bytes: Vec<u8>) {
    OUT.with(|o| {
        let mut o = o.borrow_mut();
        o.fill(0); // the last result may have been a decrypted secret
        *o = bytes;
    });
}

/// # Safety
/// `ptr` must point to `len` readable bytes (or `len` must be 0).
unsafe fn input<'a>(ptr: *const u8, len: u32) -> &'a [u8] {
    if ptr.is_null() || len == 0 {
        &[]
    } else {
        std::slice::from_raw_parts(ptr, len as usize)
    }
}

/// Largest single input JS may hand over (16 MB).
const MAX_INPUT: u32 = 16 << 20;

// ----------------------------------------------------------------- memory

#[no_mangle]
pub extern "C" fn kit_alloc(len: u32) -> *mut u8 {
    if len > MAX_INPUT {
        return std::ptr::null_mut();
    }
    Box::into_raw(vec![0u8; len as usize].into_boxed_slice()) as *mut u8
}

/// Zeroes the buffer, then frees it. Passphrases don't linger in memory.
///
/// # Safety
/// `ptr`/`len` must come from one `kit_alloc` call and not be used afterwards.
#[no_mangle]
pub unsafe extern "C" fn kit_free(ptr: *mut u8, len: u32) {
    if !ptr.is_null() {
        let mut b = Box::from_raw(std::ptr::slice_from_raw_parts_mut(ptr, len as usize));
        b.fill(0);
        drop(b);
    }
}

#[no_mangle]
pub extern "C" fn kit_out_ptr() -> *const u8 {
    OUT.with(|o| o.borrow().as_ptr())
}

#[no_mangle]
pub extern "C" fn kit_out_len() -> u32 {
    OUT.with(|o| o.borrow().len() as u32)
}

/// Wipe the output buffer once JS has copied it.
#[no_mangle]
pub extern "C" fn kit_out_clear() {
    set_out(Vec::new());
}

// ----------------------------------------------------------------- tools

/// out = SHA-256 digest (32 bytes).
///
/// # Safety
/// See [`input`].
#[no_mangle]
pub unsafe extern "C" fn kit_sha256(ptr: *const u8, len: u32) -> i32 {
    set_out(sha256::sha256(input(ptr, len)).to_vec());
    0
}

/// out = encrypted blob. `random` must hold 28 bytes from a CSPRNG.
/// Returns 0, or 1 if `random` is too short.
///
/// # Safety
/// See [`input`].
#[no_mangle]
pub unsafe extern "C" fn kit_encrypt(
    pass: *const u8,
    pass_len: u32,
    msg: *const u8,
    msg_len: u32,
    random: *const u8,
    random_len: u32,
    iterations: u32,
) -> i32 {
    let Ok(r) = <&[u8; cipher::RANDOM]>::try_from(input(random, random_len)) else {
        return 1;
    };
    set_out(cipher::encrypt(input(pass, pass_len), input(msg, msg_len), r, iterations));
    0
}

/// out = plaintext. Returns 0 ok, 1 not a valid blob, 2 wrong passphrase or tampered.
///
/// # Safety
/// See [`input`].
#[no_mangle]
pub unsafe extern "C" fn kit_decrypt(pass: *const u8, pass_len: u32, blob: *const u8, blob_len: u32) -> i32 {
    match cipher::decrypt(input(pass, pass_len), input(blob, blob_len)) {
        Ok(p) => {
            set_out(p);
            0
        }
        Err(cipher::Error::Malformed) => 1,
        Err(cipher::Error::Rejected) => 2,
    }
}

/// out = four little-endian f64s: bits, flags, length, pool. Returns 1 for invalid UTF-8.
///
/// # Safety
/// See [`input`].
#[no_mangle]
pub unsafe extern "C" fn kit_password(ptr: *const u8, len: u32) -> i32 {
    let Ok(pw) = std::str::from_utf8(input(ptr, len)) else {
        return 1;
    };
    let r = password::analyze(pw);
    let mut out = Vec::with_capacity(32);
    for v in [r.bits, r.flags as f64, r.len as f64, r.pool as f64] {
        out.extend_from_slice(&v.to_le_bytes());
    }
    set_out(out);
    0
}

/// out = generated password (ASCII).
///
/// # Safety
/// See [`input`].
#[no_mangle]
pub unsafe extern "C" fn kit_pwgen(random: *const u8, random_len: u32, len: u32, symbols: u32) -> i32 {
    set_out(password::generate(input(random, random_len), len.min(256) as usize, symbols != 0).into_bytes());
    0
}

#[cfg(test)]
mod tests {
    use super::*;

    fn out() -> Vec<u8> {
        unsafe { std::slice::from_raw_parts(kit_out_ptr(), kit_out_len() as usize).to_vec() }
    }

    #[test]
    fn c_api_round_trips_and_survives_bad_input() {
        unsafe {
            assert_eq!(kit_sha256(std::ptr::null(), 0), 0);
            assert_eq!(out(), sha256::sha256(b""));
            assert_eq!(kit_encrypt(b"pw".as_ptr(), 2, b"hi".as_ptr(), 2, [0u8; 3].as_ptr(), 3, 10), 1);
            let r = [9u8; 28];
            assert_eq!(kit_encrypt(b"pw".as_ptr(), 2, b"hi".as_ptr(), 2, r.as_ptr(), 28, 10), 0);
            let blob = out();
            assert_eq!(kit_decrypt(b"pw".as_ptr(), 2, blob.as_ptr(), blob.len() as u32), 0);
            assert_eq!(out(), b"hi");
            assert_eq!(kit_decrypt(b"no".as_ptr(), 2, blob.as_ptr(), blob.len() as u32), 2);
            assert_eq!(kit_decrypt(b"pw".as_ptr(), 2, std::ptr::null(), 0), 1);
            assert_eq!(kit_password([0xffu8, 0xfe].as_ptr(), 2), 1);
            assert!(kit_alloc(u32::MAX).is_null());
            let p = kit_alloc(8);
            kit_free(p, 8);
            kit_free(std::ptr::null_mut(), 0);
        }
    }
}

//! Passphrase encryption: PBKDF2-HMAC-SHA256 stretches the passphrase into a
//! master key, HMAC splits that into an encryption key and a MAC key, ChaCha20 (RFC 8439) encrypts, and HMAC-SHA256 seals the result
//! (encrypt-then-MAC), so a wrong passphrase or a single flipped bit is caught
//! before anything is decrypted.
//!
//! Blob layout (everything the reader needs travels with the message):
//!
//! ```text
//! [version 1][iterations u32 BE][salt 16][nonce 12][ciphertext …][tag 32]
//! ```
//!
//! Randomness (salt + nonce) comes from the browser's crypto.getRandomValues,
//! passed in by the caller. This module never invents its own.

use crate::sha256::{hmac_sha256, pbkdf2, Hmac};

pub const VERSION: u8 = 1;
pub const ITERATIONS: u32 = 210_000;
/// Refuse blobs that ask for more work than this, so a crafted message can't
/// freeze the tab for long. (600k is OWASP's figure for PBKDF2-SHA256.)
pub const MAX_ITERATIONS: u32 = 600_000;
pub const SALT: usize = 16;
pub const NONCE: usize = 12;
pub const TAG: usize = 32;
pub const HEADER: usize = 1 + 4 + SALT + NONCE;
pub const RANDOM: usize = SALT + NONCE;

#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    /// Not one of our blobs (wrong length, version or iteration count).
    Malformed,
    /// The tag didn't match: wrong passphrase, or the message was changed.
    Rejected,
}

#[inline]
fn quarter(s: &mut [u32; 16], a: usize, b: usize, c: usize, d: usize) {
    s[a] = s[a].wrapping_add(s[b]);
    s[d] = (s[d] ^ s[a]).rotate_left(16);
    s[c] = s[c].wrapping_add(s[d]);
    s[b] = (s[b] ^ s[c]).rotate_left(12);
    s[a] = s[a].wrapping_add(s[b]);
    s[d] = (s[d] ^ s[a]).rotate_left(8);
    s[c] = s[c].wrapping_add(s[d]);
    s[b] = (s[b] ^ s[c]).rotate_left(7);
}

/// One 64-byte ChaCha20 keystream block.
pub fn chacha20_block(key: &[u8; 32], counter: u32, nonce: &[u8; 12]) -> [u8; 64] {
    let le = |b: &[u8]| u32::from_le_bytes([b[0], b[1], b[2], b[3]]);
    let mut init = [0u32; 16];
    init[..4].copy_from_slice(&[0x6170_7865, 0x3320_646e, 0x7962_2d32, 0x6b20_6574]);
    for i in 0..8 {
        init[4 + i] = le(&key[i * 4..]);
    }
    init[12] = counter;
    for i in 0..3 {
        init[13 + i] = le(&nonce[i * 4..]);
    }
    let mut s = init;
    for _ in 0..10 {
        quarter(&mut s, 0, 4, 8, 12);
        quarter(&mut s, 1, 5, 9, 13);
        quarter(&mut s, 2, 6, 10, 14);
        quarter(&mut s, 3, 7, 11, 15);
        quarter(&mut s, 0, 5, 10, 15);
        quarter(&mut s, 1, 6, 11, 12);
        quarter(&mut s, 2, 7, 8, 13);
        quarter(&mut s, 3, 4, 9, 14);
    }
    let mut out = [0u8; 64];
    for i in 0..16 {
        out[i * 4..i * 4 + 4].copy_from_slice(&s[i].wrapping_add(init[i]).to_le_bytes());
    }
    out
}

/// XOR `data` with the keystream, starting at block `counter`. Encrypts and decrypts.
pub fn chacha20(key: &[u8; 32], nonce: &[u8; 12], counter: u32, data: &mut [u8]) {
    for (i, chunk) in data.chunks_mut(64).enumerate() {
        let ks = chacha20_block(key, counter.wrapping_add(i as u32), nonce);
        for (b, k) in chunk.iter_mut().zip(ks) {
            *b ^= k;
        }
    }
}

/// One slow PBKDF2 run for a 32-byte master key, then two fast HMACs to
/// split it into independent keys (half the work of asking PBKDF2 for 64).
fn derive(pass: &[u8], salt: &[u8], iterations: u32) -> ([u8; 32], Hmac) {
    let mut master = [0u8; 32];
    pbkdf2(pass, salt, iterations, &mut master);
    let enc = hmac_sha256(&master, b"kit/enc");
    let mut mac_key = hmac_sha256(&master, b"kit/mac");
    let mac = Hmac::new(&mac_key);
    master.fill(0);
    mac_key.fill(0);
    (enc, mac)
}

/// Compare without stopping at the first difference, so timing leaks nothing.
fn same(a: &[u8], b: &[u8]) -> bool {
    a.len() == b.len() && a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

pub fn encrypt(pass: &[u8], plain: &[u8], random: &[u8; RANDOM], iterations: u32) -> Vec<u8> {
    let iterations = iterations.clamp(1, MAX_ITERATIONS);
    let (salt, nonce) = random.split_at(SALT);
    let nonce: &[u8; 12] = nonce.try_into().expect("12-byte nonce");
    let (mut key, mac) = derive(pass, salt, iterations);

    let mut out = Vec::with_capacity(HEADER + plain.len() + TAG);
    out.push(VERSION);
    out.extend_from_slice(&iterations.to_be_bytes());
    out.extend_from_slice(salt);
    out.extend_from_slice(nonce);
    out.extend_from_slice(plain);
    chacha20(&key, nonce, 1, &mut out[HEADER..]);
    key.fill(0);
    let tag = mac.mac(&[&out]);
    out.extend_from_slice(&tag);
    out
}

pub fn decrypt(pass: &[u8], blob: &[u8]) -> Result<Vec<u8>, Error> {
    if blob.len() < HEADER + TAG || blob[0] != VERSION {
        return Err(Error::Malformed);
    }
    let iterations = u32::from_be_bytes([blob[1], blob[2], blob[3], blob[4]]);
    if iterations == 0 || iterations > MAX_ITERATIONS {
        return Err(Error::Malformed);
    }
    let salt = &blob[5..5 + SALT];
    let nonce: &[u8; 12] = blob[5 + SALT..HEADER].try_into().expect("12-byte nonce");
    let (body, tag) = blob.split_at(blob.len() - TAG);
    let (mut key, mac) = derive(pass, salt, iterations);
    if !same(&mac.mac(&[body]), tag) {
        key.fill(0);
        return Err(Error::Rejected);
    }
    let mut plain = body[HEADER..].to_vec();
    chacha20(&key, nonce, 1, &mut plain);
    key.fill(0);
    Ok(plain)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hex(b: &[u8]) -> String {
        b.iter().map(|x| format!("{x:02x}")).collect()
    }

    #[test]
    fn chacha20_block_matches_rfc_8439() {
        // RFC 8439 §2.3.2
        let key: [u8; 32] = core::array::from_fn(|i| i as u8);
        let nonce = [0, 0, 0, 9, 0, 0, 0, 0x4a, 0, 0, 0, 0];
        let block = chacha20_block(&key, 1, &nonce);
        assert_eq!(hex(&block[..16]), "10f1e7e4d13b5915500fdd1fa32071c4");
    }

    const R: [u8; RANDOM] = [7; RANDOM];

    #[test]
    fn round_trips() {
        let blob = encrypt(b"hunter2", b"meet me at noon", &R, 1000);
        assert_eq!(blob.len(), HEADER + 15 + TAG);
        assert_eq!(decrypt(b"hunter2", &blob).unwrap(), b"meet me at noon");
    }

    #[test]
    fn the_ciphertext_hides_the_message() {
        let blob = encrypt(b"k", b"aaaaaaaaaaaaaaaa", &R, 10);
        assert!(!blob.windows(4).any(|w| w == b"aaaa"));
    }

    #[test]
    fn wrong_passphrase_is_rejected() {
        let blob = encrypt(b"right", b"secret", &R, 1000);
        assert_eq!(decrypt(b"wrong", &blob), Err(Error::Rejected));
    }

    #[test]
    fn any_flipped_bit_is_caught() {
        let blob = encrypt(b"pw", b"secret message", &R, 100);
        for i in 0..blob.len() {
            let mut bad = blob.clone();
            bad[i] ^= 0x01;
            assert!(decrypt(b"pw", &bad).is_err(), "flip at byte {i} went unnoticed");
        }
    }

    #[test]
    fn garbage_and_greedy_blobs_are_refused() {
        assert_eq!(decrypt(b"pw", b""), Err(Error::Malformed));
        assert_eq!(decrypt(b"pw", &[1; 20]), Err(Error::Malformed));
        let mut greedy = encrypt(b"pw", b"x", &R, 10);
        greedy[1..5].copy_from_slice(&u32::MAX.to_be_bytes());
        assert_eq!(decrypt(b"pw", &greedy), Err(Error::Malformed));
    }
}

//! A small password strength estimator, in the spirit of zxcvbn: instead of
//! "has a capital and a number", it estimates how many guesses a cracker
//! would actually need, by spotting the shortcuts crackers use (leaked
//! password lists, dictionary words, l33t swaps, keyboard runs, years).
//!
//! Plus an unbiased password generator fed by the browser's CSPRNG.

pub const LOWER: u32 = 1;
pub const UPPER: u32 = 2;
pub const DIGIT: u32 = 4;
pub const SYMBOL: u32 = 8;
pub const OTHER: u32 = 16;
/// The whole thing is on the leaked-passwords list.
pub const LEAKED: u32 = 32;
pub const WORD: u32 = 64;
pub const SEQUENCE: u32 = 128;
pub const REPEAT: u32 = 256;
pub const YEAR: u32 = 512;
pub const SHORT: u32 = 1024;

/// The most common leaked passwords, most common first.
const LEAKED_LIST: &[&str] = &[
    "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111", "1234567", "dragon",
    "123123", "baseball", "abc123", "football", "monkey", "letmein", "696969", "shadow", "master", "666666",
    "qwertyuiop", "123321", "mustang", "1234567890", "michael", "654321", "superman", "1qaz2wsx", "7777777",
    "121212", "000000", "qazwsx", "123qwe", "killer", "trustno1", "jordan", "jennifer", "zxcvbnm", "asdfgh",
    "hunter", "buster", "soccer", "harley", "batman", "andrew", "tigger", "sunshine", "iloveyou", "2000",
    "charlie", "robert", "thomas", "hockey", "ranger", "daniel", "starwars", "klaster", "112233", "george",
    "computer", "michelle", "jessica", "pepper", "1111", "zxcvbn", "555555", "11111111", "131313", "freedom",
    "777777", "pass", "maggie", "159753", "aaaaaa", "ginger", "princess", "joshua", "cheese", "amanda",
    "summer", "love", "ashley", "nicole", "chelsea", "biteme", "matthew", "access", "yankees", "987654321",
    "dallas", "austin", "thunder", "taylor", "matrix", "admin", "welcome", "login", "passw0rd", "hunter2",
    "password1", "qwerty123", "iloveyou1", "princess1", "football1", "monkey1", "charlie1", "aa123456",
    "donald", "qwe123", "letmein1", "welcome1", "abcd1234", "admin123", "root", "toor", "changeme",
];

/// Words that show up inside passwords all the time.
const WORDS: &[&str] = &[
    "password", "pass", "love", "dragon", "monkey", "master", "shadow", "sunshine", "princess", "football",
    "baseball", "soccer", "hockey", "summer", "winter", "spring", "autumn", "flower", "secret", "welcome",
    "admin", "login", "hello", "hunter", "killer", "batman", "superman", "starwars", "pokemon", "minecraft",
    "freedom", "whatever", "trustno", "letmein", "qwerty", "iloveyou", "angel", "baby", "cookie", "cheese",
    "chocolate", "computer", "internet", "orange", "banana", "apple", "purple", "yellow", "silver", "golden",
    "tiger", "lion", "eagle", "falcon", "wolf", "bear", "horse", "kitty", "puppy", "doggy", "family", "forever",
    "money", "magic", "music", "guitar", "pepper", "ginger", "jordan", "michael", "jessica", "ashley", "daniel",
    "thomas", "robert", "charlie", "matrix", "thunder", "ranger", "access", "school", "college", "summer",
    "beach", "ocean", "sky", "star", "moon", "sun", "fire", "ice", "dark", "light", "king", "queen", "god",
    "jesus", "lucky", "happy", "sexy", "cool", "crazy", "test", "user", "guest", "root", "corgi", "rust",
];

const ROWS: &[&str] = &["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890", "abcdefghijklmnopqrstuvwxyz"];

pub struct Report {
    /// Estimated entropy: log2 of the guesses needed.
    pub bits: f64,
    pub flags: u32,
    pub len: u32,
    pub pool: u32,
}

fn unleet(c: char) -> char {
    match c {
        '@' | '4' => 'a',
        '3' => 'e',
        '1' | '!' | '|' => 'i',
        '0' => 'o',
        '$' | '5' => 's',
        '7' | '+' => 't',
        '8' => 'b',
        '9' => 'g',
        c => c.to_ascii_lowercase(),
    }
}

/// Bits spent on capitalisation: none, first letter, all caps, or a mix.
fn caps_bits(seg: &[char]) -> f64 {
    let up = seg.iter().filter(|c| c.is_uppercase()).count();
    if up == 0 {
        0.0
    } else if up == seg.len() || (up == 1 && seg[0].is_uppercase()) {
        1.0
    } else {
        seg.len().min(up + 2) as f64
    }
}

fn leet_bits(raw: &[char], norm: &[char]) -> f64 {
    let swaps = raw.iter().zip(norm).filter(|(r, n)| r.to_ascii_lowercase() != **n).count();
    if swaps == 0 { 0.0 } else { 1.0 + swaps as f64 }
}

/// Longest run starting at `i` that walks a keyboard row or the alphabet
/// (either direction), or repeats one character.
fn run_at(lower: &[char], i: usize) -> (usize, u32) {
    let mut best = (1, 0);
    let rep = lower[i..].iter().take_while(|&&c| c == lower[i]).count();
    if rep >= 3 {
        best = (rep, REPEAT);
    }
    for row in ROWS {
        let fwd: Vec<char> = row.chars().collect();
        let rev: Vec<char> = row.chars().rev().collect();
        for r in [fwd, rev] {
            if let Some(start) = r.iter().position(|&c| c == lower[i]) {
                let n = lower[i..].iter().zip(&r[start..]).take_while(|(a, b)| a == b).count();
                if n >= 3 && n > best.0 {
                    best = (n, SEQUENCE);
                }
            }
        }
    }
    best
}

pub fn analyze(pw: &str) -> Report {
    let raw: Vec<char> = pw.chars().collect();
    let n = raw.len();
    let mut flags = 0;
    for c in &raw {
        flags |= if c.is_ascii_lowercase() {
            LOWER
        } else if c.is_ascii_uppercase() {
            UPPER
        } else if c.is_ascii_digit() {
            DIGIT
        } else if c.is_ascii_graphic() || *c == ' ' {
            SYMBOL
        } else {
            OTHER
        };
    }
    if n < 8 {
        flags |= SHORT;
    }
    let pool = [(LOWER, 26), (UPPER, 26), (DIGIT, 10), (SYMBOL, 33), (OTHER, 100)]
        .iter()
        .filter(|(f, _)| flags & f != 0)
        .map(|(_, p)| p)
        .sum::<u32>()
        .max(1);
    if n == 0 {
        return Report { bits: 0.0, flags, len: 0, pool };
    }

    let norm: Vec<char> = raw.iter().map(|&c| unleet(c)).collect();
    let lower: Vec<char> = raw.iter().map(|c| c.to_ascii_lowercase()).collect();

    // Straight off a leaked list: a cracker tries these first.
    let whole: String = norm.iter().collect();
    let plain: String = lower.iter().collect();
    for cand in [&plain, &whole] {
        if let Some(rank) = LEAKED_LIST.iter().position(|w| w == cand) {
            let bits = ((rank + 1) as f64).log2() + caps_bits(&raw) + leet_bits(&raw, &norm);
            return Report { bits: bits.max(1.0), flags: flags | LEAKED, len: n as u32, pool };
        }
    }

    let per_char = (pool as f64).log2();
    let word_bits = (WORDS.len() as f64).log2();
    let mut bits = 0.0;
    let mut i = 0;
    while i < n {
        // the longest dictionary word starting here (after undoing l33t)
        let word = WORDS
            .iter()
            .filter(|w| w.len() >= 3)
            .filter(|w| {
                let wc: Vec<char> = w.chars().collect();
                norm.len() >= i + wc.len() && norm[i..i + wc.len()] == wc[..]
            })
            .map(|w| w.chars().count())
            .max();
        if let Some(len) = word {
            bits += word_bits + caps_bits(&raw[i..i + len]) + leet_bits(&raw[i..i + len], &norm[i..i + len]);
            flags |= WORD;
            i += len;
            continue;
        }
        // a year, 1900–2039
        if i + 4 <= n && raw[i..i + 4].iter().all(|c| c.is_ascii_digit()) {
            let y: u32 = raw[i..i + 4].iter().collect::<String>().parse().unwrap_or(0);
            if (1900..2040).contains(&y) {
                bits += (140f64).log2();
                flags |= YEAR;
                i += 4;
                continue;
            }
        }
        let (len, kind) = run_at(&lower, i);
        if len >= 3 {
            bits += per_char + (len as f64).log2() + 1.0;
            flags |= kind;
            i += len;
            continue;
        }
        bits += per_char;
        i += 1;
    }
    Report { bits, flags, len: n as u32, pool }
}

pub const ALPHA: &[u8] = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
pub const SYMBOLS: &[u8] = b"!@#$%^&*-_=+?";

/// Turns random bytes into a password. Uses rejection sampling, so every
/// character is exactly equally likely (a plain `byte % n` would favour some).
/// Returns fewer than `len` characters only if `random` runs dry.
pub fn generate(random: &[u8], len: usize, symbols: bool) -> String {
    let mut set: Vec<u8> = ALPHA.to_vec();
    if symbols {
        set.extend_from_slice(SYMBOLS);
    }
    let n = set.len();
    let limit = 256 - 256 % n;
    random
        .iter()
        .filter(|&&b| (b as usize) < limit)
        .take(len)
        .map(|&b| set[b as usize % n] as char)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn leaked_passwords_are_instant() {
        for pw in ["password", "P@ssw0rd", "123456", "Qwerty", "hunter2"] {
            let r = analyze(pw);
            assert!(r.flags & LEAKED != 0, "{pw} should be flagged as leaked");
            assert!(r.bits < 15.0, "{pw} scored {} bits", r.bits);
        }
    }

    #[test]
    fn patterns_count_for_little() {
        let r = analyze("Summer2024!");
        assert!(r.flags & WORD != 0 && r.flags & YEAR != 0);
        assert!(r.bits < 30.0, "Summer2024! scored {}", r.bits);
        assert!(analyze("qwertyasdfgh").bits < 25.0);
        assert!(analyze("aaaaaaaaaaaaaaaa").bits < 15.0);
    }

    #[test]
    fn random_and_long_beats_short_and_clever() {
        assert!(analyze("k9#Vq2!mZx7$Lp4w").bits > 90.0);
        assert!(analyze("correct horse battery staple").bits > analyze("Tr0ub4dor&3").bits);
    }

    #[test]
    fn generator_is_the_right_length_and_alphabet() {
        let rnd: Vec<u8> = (0..=255u8).cycle().take(512).collect();
        let pw = generate(&rnd, 24, true);
        assert_eq!(pw.len(), 24);
        assert!(pw.bytes().all(|b| ALPHA.contains(&b) || SYMBOLS.contains(&b)));
        assert!(generate(&rnd, 24, false).bytes().all(|b| ALPHA.contains(&b)));
    }

    #[test]
    fn generator_is_unbiased() {
        // Every byte value once: after rejection, each character appears equally often.
        let rnd: Vec<u8> = (0..=255u8).collect();
        let pw = generate(&rnd, 1000, false);
        let counts = ALPHA.iter().map(|c| pw.bytes().filter(|b| b == c).count());
        assert!(counts.into_iter().all(|k| k == 4));
    }
}

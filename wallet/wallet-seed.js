import { pbkdf2 } from "crypto";
import { Account } from "@solana/web3.js";
import * as bip32 from "bip32";
import bs58 from "bs58";
import { EventEmitter } from "events";
import nacl from "tweetnacl";
const { randomBytes, secretbox } = nacl;
import { derivePath } from "ed25519-hd-key";
import { LocalStorage } from "node-localstorage";
global.localStorage = new LocalStorage("./store");

export function normalizeMnemonic(mnemonic) {
  return mnemonic.trim().split(/\s+/g).join(" ");
}

export async function generateMnemonicAndSeed() {
  //console.log("generateMnemonicAndSeed");
  const bip39 = await import("bip39");
  const mnemonic = bip39.generateMnemonic(256);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return { mnemonic, seed: Buffer.from(seed).toString("hex") };
}
//done
export async function mnemonicToSeed(mnemonic) {
  //console.log("mnemonicToSeed");
  const bip39 = await import("bip39");
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Invalid seed words");
  }
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Buffer.from(seed).toString("hex");
}

async function deriveEncryptionKey(password, salt, iterations, digest) {
  return new Promise((resolve, reject) =>
    pbkdf2(
      password,
      salt,
      iterations,
      secretbox.keyLength,
      digest,
      (err, key) => (err ? reject(err) : resolve(key))
    )
  );
}
function deriveImportsEncryptionKey(seed) {
  // SLIP16 derivation path.

  return bip32.fromSeed(Buffer.from(seed, "hex")).derivePath("m/10016'/0")
    .privateKey;
}

export async function storeMnemonicAndSeed(
  mnemonic,
  seed,
  password,
  derivationPath
) {
  //console.log("storeMnemonicAndSeed", mnemonic, seed, password, derivationPath);
  const plaintext = JSON.stringify({ mnemonic, seed, derivationPath });
  if (password) {
    const salt = randomBytes(16);
    const kdf = "pbkdf2";
    const iterations = 100000;
    const digest = "sha256";
    const key = await deriveEncryptionKey(password, salt, iterations, digest);
    const nonce = randomBytes(secretbox.nonceLength);
    const encrypted = secretbox(Buffer.from(plaintext), nonce, key);
    localStorage.setItem(
      "locked",
      JSON.stringify({
        encrypted: bs58.encode(encrypted),
        nonce: bs58.encode(nonce),
        kdf,
        salt: bs58.encode(salt),
        iterations,
        digest,
      })
    );
    localStorage.removeItem("unlocked");
  } else {
    localStorage.setItem("unlocked", plaintext);
    localStorage.removeItem("locked");
  }
  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  // setUnlockedMnemonicAndSeed(
  //   mnemonic,
  //   seed,
  //   importsEncryptionKey,
  //   derivationPath
  // );
}
export async function loadMnemonicAndSeed(password, stayLoggedIn) {
  //console.log("loadMnemonicAndSeed", password, stayLoggedIn);
  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest,
  } = JSON.parse(localStorage.getItem("locked"));
  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const plaintext = secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error("Incorrect password");
  }
  const decodedPlaintext = Buffer.from(plaintext).toString();
  const { mnemonic, seed, derivationPath } = JSON.parse(decodedPlaintext);

  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  // setUnlockedMnemonicAndSeed(
  //   mnemonic,
  //   seed,
  //   importsEncryptionKey,
  //   derivationPath
  // );
  return { mnemonic, seed, derivationPath };
}

export function forgetWallet() {
  //console.log("forgetWallet");
  localStorage.clear();
}
export function getUnlockedMnemonicAndSeed() {
  return unlockedMnemonicAndSeed;
}
const EMPTY_MNEMONIC = {
  mnemonic: null,
  seed: null,
  importsEncryptionKey: null,
  derivationPath: null,
};

let unlockedMnemonicAndSeed = (async () => {
  //console.log("unlockedMnemonicAndSeed");
  const unlockedExpiration = localStorage.getItem("unlockedExpiration");
  // Left here to clean up stored mnemonics from previous method
  if (unlockedExpiration && Number(unlockedExpiration) < Date.now()) {
    localStorage.removeItem("unlocked");
    localStorage.removeItem("unlockedExpiration");
  }
  const stored = JSON.parse(localStorage.getItem("unlocked") || "null");
  if (stored === null) {
    return EMPTY_MNEMONIC;
  }
  return {
    importsEncryptionKey: deriveImportsEncryptionKey(stored.seed),
    ...stored,
  };
})();

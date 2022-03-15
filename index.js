import {
  mnemonicToSeed,
  generateMnemonicAndSeed,
  storeMnemonicAndSeed,
  loadMnemonicAndSeed,
  forgetWallet,
} from "./wallet/wallet-seed.js";
import { getAccountFromSeed } from "./wallet/walletProvider/localStorage.js";
import { Wallet } from "./wallet/wallet.js";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const mnemonic =
  "gold shy refuse quit gadget suffer slim approve air nephew orient gather drastic inherit layer curve idea soul dad dizzy boring tattoo raccoon scale";

(async () => {
  //const seed = await mnemonicToSeed(mnemonic);
  //storeMnemonicAndSeed(mnemonic, seed, "password", "bip44Change");
  const m_s = await loadMnemonicAndSeed("password", "true");
  console.log(m_s);
  const account = await getAccountFromSeed(m_s.seed, 0, m_s.derivationPath, 0);
  console.log(account.publicKey.toBase58());
  const wallet = new Wallet(connection, "local", { account });
  const destination = new PublicKey(
    "FfLczWEt8wYoubArWX6iTKJ85inoKinvovzJ4CqRRuzX"
  );
  const tokenAddress = new PublicKey(
    "9QPeHFjjyw4jy9GDzs3RvWxWJuwpKBj6RzQpEnwBuAnR"
  );
  console.log(wallet);
  //wallet.createTokenAccount(tokenAddress);
  wallet.transferSol(destination, 50000);
})();

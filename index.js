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
const destination = new PublicKey(
  "FfLczWEt8wYoubArWX6iTKJ85inoKinvovzJ4CqRRuzX"
);
const tokenAddress = new PublicKey(
  "9QPeHFjjyw4jy9GDzs3RvWxWJuwpKBj6RzQpEnwBuAnR"
);

(async () => {
  // create new wallet
  const mnemonicAndSeed = await generateMnemonicAndSeed();

  //restore old wallet
  const seed = await mnemonicToSeed(mnemonic);
  const account = await getAccountFromSeed(m_s.seed, 0, m_s.derivationPath, 0);

  //passcode wallet
  storeMnemonicAndSeed(mnemonic, seed, "password", "bip44Change");

  //load a saved wallet from localStorage
  const m_s = await loadMnemonicAndSeed("password", "true");

  //get a wallet object
  const wallet = new Wallet(connection, "local", { account });

  //transfer solana
  wallet.transferSol(destination, 50000);

  //transfer token
  wallet.transferToken(tokenAddress, destination, 50000);
})();

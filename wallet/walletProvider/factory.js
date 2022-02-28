import { LocalStorageWalletProvider } from "./localStorage.js";

export class WalletProviderFactory {
  static getProvider(type, args) {
    if (type === "local") {
      return new LocalStorageWalletProvider(args);
    }
  }
}

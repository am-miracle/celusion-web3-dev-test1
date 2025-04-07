/* eslint-disable @typescript-eslint/no-explicit-any */
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/constants";
import { ethers } from "ethers";

export const provider = typeof window !== 'undefined' && (window as any).ethereum;
export const getContract = async () => {
    if (provider) {
      const browserProvider = new ethers.BrowserProvider(provider);
      const signer = await browserProvider.getSigner();
      return new ethers.Contract(
        MARKETPLACE_ADDRESS!,
        MARKETPLACE_ABI,
        signer
      );
    }
    return null;
  };

  export const connectWallet = async () => {
    if (provider) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });//+
        return accounts[0];
      } catch (error) {
        console.error("User rejected request:", error);
        return null;
      }
    } else {
      alert("Please install MetaMask!");
      return null;
    }
  };

  export const getListingFee = async () => {
    const contract = await getContract();
    if (!contract) return null;
    return await contract.getListingFee();
  };
export function shortenAddress(address: string, chars = 4): string {
    return `${address.substring(0, chars + 2)}...${address.substring(
      address.length - chars
    )}`;
  }
  
  export function formatEther(wei: bigint, decimals = 4): string {
    const ether = Number(wei) / 10 ** 18;
    return ether.toFixed(decimals);
  }
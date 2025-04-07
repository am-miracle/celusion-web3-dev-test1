/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from "react";
import { getContract, provider } from "@/lib/contract";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { NFTDetailModal } from "./nft-detail-modal";

interface NFT {
    id?: bigint;
  tokenId: number;
  owner?: string;
  seller?: string;
  price?: string;
  tokenURI?: string;
  name?: string;
  description?: string;
  image?: string;
  isListed?: boolean;
}

interface AllNFTsProps {
  mintedData: any[];
  listedData: any[];
  mintedLoading: boolean;
  listedLoading: boolean;
  mintedError: Error | null;
  listedError: Error | null;
}

export default function AllNFTs({
  mintedData,
  listedData,
  mintedLoading,
  listedLoading,
  mintedError,
  listedError,
}: AllNFTsProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check wallet connection on load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (provider) {
        try {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkWalletConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || null);
    };

    (window as any).ethereum?.on("accountsChanged", handleAccountsChanged);
    return () => {
      (window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  // Process NFT data
  useEffect(() => {
    if (mintedLoading || listedLoading) {
      setLoading(true);
      return;
    }

    if (mintedError || listedError) {
      setError(mintedError?.message || listedError?.message || "Failed to fetch NFTs");
      setLoading(false);
      return;
    }

    const processNFTs = async () => {
        try {
          const mergedNFTs: NFT[] = [];
          const listedTokens = new Set();

          // Process listed NFTs first
          if (listedData) {
            for (const listing of listedData) {
              if (!listing.tokenId) continue; // Skip if no tokenId

              listedTokens.add(listing.tokenId);
              const metadata = await fetchNFTMetadata(listing.tokenURI);

              mergedNFTs.push({
                id: listing.id,
                tokenId: listing.tokenId,
                seller: listing.seller,
                price: listing.price,
                isListed: true,
                ...metadata
              });
            }
          }

          // Process minted NFTs
          if (mintedData) {
            for (const mint of mintedData) {
              if (!mint.tokenId || listedTokens.has(mint.tokenId)) continue;

              const metadata = await fetchNFTMetadata(mint.tokenURI);

              mergedNFTs.push({
                id: mint.id,
                tokenId: mint.tokenId,
                owner: mint.owner,
                isListed: false,
                ...metadata
              });
            }
          }

          console.log("Processed NFTs:", mergedNFTs);
          setNfts(mergedNFTs);
        } catch (error: any) {
          console.error("Error processing NFTs:", error);
          setError(error.message || "Failed to process NFT data");
        } finally {
          setLoading(false);
        }
      };

    processNFTs();
  }, [mintedData, listedData, mintedLoading, listedLoading, mintedError, listedError]);

  const fetchNFTMetadata = async (tokenURI: string | undefined | null) => {
    // Handle missing or invalid tokenURI
    if (!tokenURI || typeof tokenURI !== 'string') {
      console.warn("Invalid tokenURI:", tokenURI);
      return {
        name: "Unknown NFT",
        description: "No metadata available",
        image: "/placeholder-nft.png"
      };
    }
  
    try {
      // Handle data URIs (base64 encoded JSON)
      if (tokenURI.startsWith("data:application/json;base64,")) {
        const base64Data = tokenURI.split(",")[1];
        const jsonString = atob(base64Data);
        const metadata = JSON.parse(jsonString);
        
        // Process image URL if it's IPFS
        let imageUrl = metadata.image;
        if (imageUrl?.startsWith("ipfs://")) {
          imageUrl = `https://ipfs.io/ipfs/${imageUrl.slice(7)}`;
        }
        
        return {
          name: metadata.name || `NFT #${tokenURI.split("/").pop()?.split(".")[0] || "Unknown"}`,
          description: metadata.description || "No description available",
          image: imageUrl || "/placeholder-nft.png",
        };
      }
      // Handle IPFS URIs
      else if (tokenURI.startsWith("ipfs://")) {
        const uri = `https://ipfs.io/ipfs/${tokenURI.slice(7)}`;
        const response = await fetch(uri);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const metadata = await response.json();
        
        // Process nested IPFS image URLs
        let imageUrl = metadata.image;
        if (imageUrl?.startsWith("ipfs://")) {
          imageUrl = `https://ipfs.io/ipfs/${imageUrl.slice(7)}`;
        }
        
        return {
          name: metadata.name || `NFT #${tokenURI.split("/").pop()?.split(".")[0] || "Unknown"}`,
          description: metadata.description || "No description available",
          image: imageUrl || "/placeholder-nft.png",
        };
      }
      // Handle regular HTTP URLs
      else if (tokenURI.startsWith("http")) {
        const response = await fetch(tokenURI);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const metadata = await response.json();
        
        // Process nested IPFS image URLs
        let imageUrl = metadata.image;
        if (imageUrl?.startsWith("ipfs://")) {
          imageUrl = `https://ipfs.io/ipfs/${imageUrl.slice(7)}`;
        }
        
        return {
          name: metadata.name || `NFT #${tokenURI.split("/").pop()?.split(".")[0] || "Unknown"}`,
          description: metadata.description || "No description available",
          image: imageUrl || "/placeholder-nft.png",
        };
      }
      // Fallback for unknown URI formats
      else {
        return {
          name: `NFT #${tokenURI.split("/").pop()?.split(".")[0] || "Unknown"}`,
          description: "No description available",
          image: "/placeholder-nft.png",
        };
      }
    } catch (error) {
      console.error("Error fetching NFT metadata:", error);
      return {
        name: `NFT #${tokenURI.split("/").pop()?.split(".")[0] || "Unknown"}`,
        description: "No description available",
        image: "/placeholder-nft.png",
      };
    }
  };


  const handleConnectWallet = async () => {
    try {
      if (provider === "undefined") {
        throw new Error("Please install MetaMask or another Ethereum wallet");
      }

      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      setAccount(accounts[0]);
      toast.success("Wallet connected successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to connect wallet");
      console.error("Connection error:", error);
    }
  };

  const handleBuyNFT = async (nft: NFT) => {
    if (!account) {
      toast.error("Please connect your wallet to buy NFTs");
      return;
    }
  
    if (!nft.isListed || !nft.price) {
      toast.error("This NFT is not available for purchase");
      return;
    }
  
    if (nft.seller?.toLowerCase() === account.toLowerCase()) {
      toast.error("You cannot buy your own NFT");
      return;
    }
  
    setBuyingId(nft.tokenId.toString());
    try {
      const contract = await getContract();
      if (!contract) {
        throw new Error("Failed to connect to contract");
      }

      // Convert price string to BigNumber in wei
      const priceInWei = BigInt(nft.price);

      // Add debug logs
      console.log("Price in ETH:", nft.price);
      console.log("Price in wei:", priceInWei.toString());

      const tx = await contract.buyNFT(
        nft.tokenId,
        {
          value: priceInWei,
        }
      );

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast.success(`Successfully purchased NFT #${nft.tokenId}`);
        setNfts(prev => prev.filter(item => item.tokenId !== nft.tokenId));
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Buy error:", error);
      let errorMessage = error.reason || error.message;

      // More user-friendly error messages
      if (errorMessage.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH balance for purchase";
      }

      toast.error(errorMessage || "Failed to purchase NFT");
    } finally {
      setBuyingId(null);
    }
  };

  const handleNFTSelected = (nft: NFT) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const handleListSuccess = () => {
    // Refresh NFT data after listing
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-1/2" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nfts.map((nft) => {
        const isOwner = nft.owner?.toLowerCase() === account?.toLowerCase() ||
                       nft.seller?.toLowerCase() === account?.toLowerCase();
        return (
          <Card
          className="cursor-pointer hover:shadow-lg transition-shadow shadow-none relative"
            key={nft.id}
            onClick={() => handleNFTSelected(nft)}
            >
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="truncate max-w-[180px]">{nft.name}</span>
                {nft.isListed && <Badge>Listed</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-square">
                <Image
                  src={nft.image || "/placeholder-nft.png"}
                  alt={nft.name || `NFT #${nft.tokenId}`}
                  fill
                  className="object-cover rounded"
                  unoptimized
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="flex justify-between w-full">
                <span className="text-sm text-muted-foreground">#{nft.tokenId}</span>
                {nft.isListed && (
                  <span className="font-bold">
                    {ethers.formatEther(nft.price || "0")} ETH
                  </span>
                )}
              </div>

              {!account ? (
                <Button
                  onClick={handleConnectWallet}
                  variant="outline"
                  className="w-full"
                >
                  Connect to Buy
                </Button>
              ) : nft.isListed && !isOwner ? (
                <Button
                  onClick={() => handleBuyNFT(nft)}
                  disabled={buyingId === (nft.tokenId.toString() as string)}
                  className="w-full"
                >
                  {buyingId === (nft.tokenId.toString() as string) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Purchasing...
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </Button>
              ) : isOwner ? (
                <div className="text-sm text-center text-muted-foreground py-1">
                  {nft.isListed ? "Your listing" : "Your NFT"}
                </div>
              ) : null}
            </CardFooter>
          </Card>
        );
      })}
        {selectedNFT && (
            <NFTDetailModal
            nft={selectedNFT}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onListSuccess={handleListSuccess}
            />
        )}
    </div>
  );
}

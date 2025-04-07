/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import {
  AlertCircle,
  Loader2,
  Plus
} from "lucide-react";
import { getContract, provider } from "@/lib/contract";
import Image from "next/image";
import { NFTDetailModal } from "@/components/nft-detail-modal";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface NFT {
  tokenId: number;
  name?: string;
  description?: string;
  image?: string;
  isListed?: boolean;
  price?: string;
}

export default function MyNFTsPage() {
  const router = useRouter();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proceeds, setProceeds] = useState("0");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const listedNFTs = nfts.filter(nft => nft.isListed);
  const unlistedNFTs = nfts.filter(nft => !nft.isListed);

  const loadUserData = useCallback(async () => {
    if (!account) {
      console.log("No account connected, skipping data load");
      return;
    }

    console.log("Starting data load for account:", account);
    setLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      if (!contract) {
        throw new Error("Failed to connect to contract");
      }

      console.log("Fetching proceeds...");
      const proceedsWei = await contract.getProceeds(account);
      setProceeds(ethers.formatEther(proceedsWei));

      const totalNFTs = await contract.getTotalNFTs();

      const myNFTs: NFT[] = [];

      for (let i = 0; i < totalNFTs; i++) {
        try {
          console.log(`Checking NFT ${i}...`);
          const owner = await contract.ownerOf(i);
          console.log(`NFT ${i} owner:`, owner);

          if (owner.toLowerCase() === account.toLowerCase()) {
            console.log(`NFT ${i} belongs to user`);
            const isListed = await contract.isNFTListed(i);
            let price = "0";

            if (isListed) {
              const [listingPrice] = await contract.getListing(i);
              price = ethers.formatEther(listingPrice);
            }

            const tokenURI = await contract.tokenURI(i);
            console.log("Token URI:", tokenURI);

            const metadata = await fetchNFTMetadata(tokenURI);

            myNFTs.push({
              tokenId: i,
              isListed,
              price,
              ...metadata,
            });
          }
        } catch (error) {
          console.error(`Error processing NFT ${i}:`, error);
        }
      }

      console.log("Found NFTs:", myNFTs);
      setNfts(myNFTs);
    } catch (error: any) {
      console.error("Error in loadUserData:", error);
      setError(error.message || "Failed to load NFT data");
    } finally {
      setLoading(false);
    }
  },[account]);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (provider) {
        try {
            const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });//+
            if (accounts.length > 0) {
            setAccount(accounts[0]);
            loadUserData();
          }
        } catch (error) {
          setError("Failed to check wallet connection");
          console.error(error);
        }
      }
    };

    checkWalletConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || null);
      if (accounts[0]) loadUserData();
    };

    (window as any).ethereum?.on("accountsChanged", handleAccountsChanged);
    return () => {
      (window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [loadUserData]);

  const fetchNFTMetadata = async (tokenURI: string) => {
    try {
      const uri = tokenURI.startsWith("ipfs://")
        ? `https://ipfs.io/ipfs/${tokenURI.split("ipfs://")[1]}`
        : tokenURI;
      const response = await fetch(uri);
      if (!response.ok) throw new Error("Failed to fetch metadata");
      return await response.json();
    } catch (error) {
      console.error("Error fetching NFT metadata:", error);
      return {
        name: `NFT #${tokenURI.split("/").pop()}`,
        description: "No description available",
        image: "/placeholder-nft.png",
      };
    }
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    try {
      const contract = await getContract();
      if (!contract) throw new Error("Failed to connect to contract");

      const tx = await contract.withdrawProceeds();
      await tx.wait();

      setProceeds("0");
      loadUserData();
    } catch (error: any) {
      setError(error.message || "Failed to withdraw proceeds");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleNFTSelected = (nft: NFT) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const handleListSuccess = () => {
    loadUserData();
  };

  const NFTCard = ({ nft}: { nft: NFT}) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow shadow-none relative"
      onClick={() => handleNFTSelected(nft)}
    >
        {nft.isListed && <Badge className="absolute top-0 right-0 bg-green-700">Listed</Badge>}
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
      <CardFooter className="flex justify-between">
        <h1 className="text-lg text-muted-foreground">{nft.name}</h1>
        {nft.isListed && (
          <span className="font-bold">{nft.price} ETH</span>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My NFTs</h1>
        <Button onClick={() => router.push('/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New NFT
        </Button>
      </div>

      {!account ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wallet not connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to view your NFTs
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Proceeds Card */}
          {parseFloat(proceeds) > 0 && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-green-800">Available Proceeds</h3>
                  <p className="text-green-600">{proceeds} ETH</p>
                </div>
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading}
                >
                  {withdrawLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    'Withdraw Funds'
                  )}
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : nfts.length > 0 ? (
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All NFTs ({nfts.length})</TabsTrigger>
                <TabsTrigger value="listed">Listed ({listedNFTs.length})</TabsTrigger>
                <TabsTrigger value="unlisted">Not Listed ({unlistedNFTs.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {nfts.map(nft => (
                    <NFTCard key={nft.tokenId} nft={nft}/>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="listed" className="mt-6">
                {listedNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {listedNFTs.map(nft => (
                      <NFTCard key={nft.tokenId} nft={nft}/>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">You don&apos;t have any NFTs listed for sale</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unlisted" className="mt-6">
                {unlistedNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {unlistedNFTs.map(nft => (
                      <NFTCard key={nft.tokenId} nft={nft}/>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">All your NFTs are listed for sale</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You don&apos;t have any NFTs yet</p>
            </div>
          )}
        </>
      )}

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
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { ethers } from "ethers";
import { getContract } from "@/lib/contract";
import toast from "react-hot-toast";
import Image from "next/image";
import { MARKETPLACE_ADDRESS } from "@/constants";

const listSchema = z.object({
    tokenId: z.number().min(0, "Token ID must be positive").optional(),
  price: z.number().min(0.0001, "Price must be at least 0.0001 ETH"),
});

type ListFormValues = z.infer<typeof listSchema>;

interface NFTDetailModalProps {
  nft: {
    tokenId: number;
    name?: string;
    description?: string;
    image?: string;
    isListed?: boolean;
    price?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onListSuccess: () => void;
}

export function NFTDetailModal({ nft, open, onOpenChange, onListSuccess }: NFTDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ListFormValues>({
    resolver: zodResolver(listSchema),
    defaultValues: {
        tokenId: nft.tokenId,
      price: 0.001,
    },
  });

  const handleListNFT = async (values: ListFormValues) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) {
        throw new Error("Failed to connect to contract");
      }

            const isApproved = await contract.getApproved(values.tokenId);
              const marketplaceAddress = MARKETPLACE_ADDRESS;
      
              if (isApproved !== marketplaceAddress) {
                  // 2. If not approved, request approval
                  toast("Approving NFT for marketplace...");
                  const approveTx = await contract.approve(marketplaceAddress, values.tokenId);
                  await approveTx.wait();
                  toast.success("NFT approved for marketplace");
              }

      const listingFee = await contract.getListingFee();
      const tx = await contract.listNFT(
        nft.tokenId,
        ethers.parseEther(values.price.toString()),
        { value: listingFee }
      );
      await tx.wait();

      toast.success("NFT listed successfully!");
      onListSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to list NFT");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NFT #{nft.tokenId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {nft.image && (
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <Image
                src={nft.image}
                alt={`NFT ${nft.tokenId}`}
                width={200}
                height={200}
                className="h-full object-cover"
                />
            </div>
          )}

          <div>
            <h3 className="font-semibold">{nft.name || `NFT #${nft.tokenId}`}</h3>
            <p className="text-sm text-gray-500">{nft.description}</p>
          </div>

          {nft.isListed ? (
            <div className="bg-green-50 p-3 rounded">
              <p className="text-green-800">This NFT is listed for {ethers.formatEther(nft.price || 0)} ETH</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleListNFT)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Price (ETH)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Listing..." : "List NFT"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
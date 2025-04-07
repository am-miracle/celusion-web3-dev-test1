/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { getContract } from "@/lib/contract";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { MARKETPLACE_ADDRESS } from "@/constants";

const formSchema = z.object({
  tokenId: z.number().min(0, "Token ID must be positive"),
  price: z.number().min(0.0001, "Price must be at least 0.0001 ETH"),
});

type FormValues = z.infer<typeof formSchema>;

const ListNFTForm = () => {
    const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const tokenId = searchParams.get("tokenId");
  const router = useRouter();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenId: 0,
      price: 0,
    },
  });

  useEffect(() => {
    if (tokenId) {
      form.setValue("tokenId", Number(tokenId));
    }
  }, [tokenId, form]);

  const onSubmit = async (values: FormValues) => {
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
        values.tokenId,
        ethers.parseEther(values.price.toString()),
        { value: listingFee }
      );
      await tx.wait();

      toast.success("NFT listed successfully!");
      router.push(`/my-nfts`);
    } catch (error: any) {
      toast.error(error.message || "Failed to list NFT");
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="tokenId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    disabled={!!tokenId} // Disable if tokenId comes from URL
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (ETH)</FormLabel>
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Listing..." : "List NFT"}
          </Button>
        </form>
      </Form>
  );
};

export default ListNFTForm;
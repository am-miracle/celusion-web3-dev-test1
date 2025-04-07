"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { uploadToIPFS } from "@/lib/ipfs";
import toast from "react-hot-toast";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import Image from "next/image";
import { Button } from "./ui/button";
import { getContract } from "@/lib/contract";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.instanceof(File, { message: "Image is required" }),
  attributes: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Must be valid JSON"),
});

type FormValues = z.infer<typeof formSchema>;

const MintNFTForm = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      attributes: "[]",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Upload image to IPFS
      const imageUrl = await uploadToIPFS(values.image);
      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      // Mint NFT
      const contract = await getContract();
      if (!contract) {
        throw new Error("Failed to connect to contract");
      }

      // Get the current token ID counter to predict the new token ID
      const currentTokenId = await contract.getTotalNFTs();
      const newTokenId = Number(currentTokenId);

      const tx = await contract.mintNFT(
        values.name,
        values.description,
        imageUrl,
        values.attributes
      );
      await tx.wait();

      toast.success("NFT minted successfully!");
      
      // Redirect to listing page with the new token ID
      router.push(`/list-nft?tokenId=${newTokenId}`);
      
      form.reset();
      setImagePreview(null);
    } catch (error) {
      toast.error('Failed to mint NFT');
      console.error("Error minting NFT:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NFT Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Image</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </FormControl>
          {form.formState.errors.image && (
            <FormMessage>{form.formState.errors.image.message}</FormMessage>
          )}
          {imagePreview && (
            <div className="mt-2">
              <Image
                src={imagePreview}
                alt="Preview"
                height={128}
                width={128}
                className="h-32 w-32 object-cover rounded"
              />
            </div>
          )}
        </FormItem>

        <FormField
          control={form.control}
          name="attributes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attributes (JSON)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Minting..." : "Mint NFT"}
        </Button>
      </form>
    </Form>
  );
};

export default MintNFTForm;
import AllNFTs from "@/components/nfts";
import { getClient } from "@/lib/apollo-client";
import { GET_LISTED_NFTS, GET_MINTED_NFTS } from "@/lib/queries";
import { Suspense } from "react";

export default async function Home() {

   const { data: mintedData } = await getClient().query({
      query: GET_MINTED_NFTS,
      variables: {
        first: 12,
        skip: 0,
      },
    });
    const { data: listedData } = await getClient().query({
      query: GET_LISTED_NFTS,
      variables: {
        first: 12,
        skip: 0,
      },
    });

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading...</div>}>
      <AllNFTs
        mintedData={mintedData?.nftMinteds || []}
        listedData={listedData?.nftlisteds || []}
        mintedLoading={false}
        listedLoading={false}
        mintedError={null}
        listedError={null}
      />
      </Suspense>
    </div>
  );
}
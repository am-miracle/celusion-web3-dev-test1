import Image from "next/image";

interface NftCardProps {
  id?: string;
  name: string;
  image: string;
  seller: string;
  price: string;
}

export function NftCard({ name, image, seller, price }: NftCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          Listed by: {`${seller.slice(0, 6)}...${seller.slice(-4)}`}
        </p>
        <p className="text-lg font-medium mt-2">{price} ETH</p>
      </div>
    </div>
  );
}
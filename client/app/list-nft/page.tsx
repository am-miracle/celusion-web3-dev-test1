import ListNFTForm from '@/components/list-nft-form'
import React from 'react'

const ListNftPage = () => {
  return (
    <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">List NFT</h1>
        <ListNFTForm />
    </div>
  )
}

export default ListNftPage
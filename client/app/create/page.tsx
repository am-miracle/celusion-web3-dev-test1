import MintNFTForm from '@/components/mint-form'
import React from 'react'

const CreateNftPage = () => {
  return (
    <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Create New NFT</h1>
          <MintNFTForm />
    </div>
  )
}

export default CreateNftPage
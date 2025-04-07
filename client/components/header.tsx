/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export default function Header() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const provider = typeof window !== 'undefined' && (window as any).ethereum;

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const shouldConnect = localStorage.getItem('walletConnected') === 'true';

      if (provider && shouldConnect) {
        try {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await handleWalletConnection(accounts[0]);
          }
        } catch (error) {
          console.error("Auto-connect error:", error);
        }
      }
    };
    
    checkConnection();
  }, [provider]);

  const handleWalletConnection = async (address: string) => {
    try {
      const browserProvider = new ethers.BrowserProvider(provider);
      const network = await browserProvider.getNetwork();
      const isSepolia = network.chainId === BigInt(11155111);
      
      setIsCorrectNetwork(isSepolia);
      setWalletAddress(address);
      
      if (isSepolia) {
        const balanceInWei = await browserProvider.getBalance(address);
        setBalance(ethers.formatEther(balanceInWei));
        toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
      } else {
        toast.error('Please switch to Sepolia network');
      }
    } catch (error) {
      console.error("Error handling wallet connection:", error);
    }
  };

  const connectWallet = useCallback(async () => {
    if (!provider) {
      toast.error('Please install MetaMask!');
      return;
    }
    try {
      const browserProvider = new ethers.BrowserProvider(provider);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      localStorage.setItem('walletConnected', 'true'); // Set connection flag
      await handleWalletConnection(accounts[0]);
    } catch (error: any) {
      toast.error(`Connection error: ${error.message}`);
    }
  }, [provider,]);

  const disconnectWallet = async () => {
    try {
      // Reset all local state
      setWalletAddress(null);
      setBalance('0');
      setIsCorrectNetwork(true);
      setIsMobileMenuOpen(false);

      localStorage.removeItem('walletConnected');

      if (provider && provider.disconnect) {
        await provider.disconnect();
      }

      if (provider && provider._handleDisconnect) {
        provider._handleDisconnect();
      }

      toast.success('Wallet disconnected');
    } catch (error) {
      console.error("Disconnection error:", error);
      toast.error("Error disconnecting wallet");
    }
  };

  // Event listeners for account/chain changes
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnectWallet();
      else handleWalletConnection(accounts[0]);
    };

    const handleChainChanged = () => window.location.reload();

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [provider, walletAddress]);

  return (
    <header className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between py-3">
          <Link href="/" className="text-xl font-bold text-gray-900">
            NFT Marketplace
          </Link>

          <nav className="flex gap-6 text-sm">
            <Link href="/create" className="hover:text-blue-600">Create</Link>
            {walletAddress && (
              <Link href="/my-nfts" className="hover:text-blue-600">My NFTs</Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {walletAddress ? (
              <>
                <div className="text-sm text-gray-700 hidden lg:block">
                  {parseFloat(balance).toFixed(4)} ETH
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={disconnectWallet}
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={connectWallet}
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between py-3">
          <Link href="/" className="text-xl font-bold text-gray-900">
            NFT Marketplace
          </Link>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <nav className="flex flex-col gap-3 text-sm border-t pt-4">
              <Link 
                href="/explore" 
                className="hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link 
                href="/create" 
                className="hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create
              </Link>
              {walletAddress && (
                <Link 
                  href="/my-nfts" 
                  className="hover:text-blue-600 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My NFTs
                </Link>
              )}
            </nav>

            <div className="border-t pt-4">
              {walletAddress ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    Balance: {parseFloat(balance).toFixed(4)} ETH
                  </div>
                  {!isCorrectNetwork && (
                    <div className="text-red-500 text-sm">
                      Wrong Network - Switch to Sepolia
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={disconnectWallet}
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect Wallet
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={connectWallet}
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
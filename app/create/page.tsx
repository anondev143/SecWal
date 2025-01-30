"use client";

import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { BrowserProvider } from "ethers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SafeApiKit from "@safe-global/api-kit";
import { SafeAccountConfig } from "@safe-global/protocol-kit";
import { SafeFactory } from "@safe-global/protocol-kit";
import OwnerModal from "@/components/OwnerModal";
import { Toaster } from "react-hot-toast";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

export default function Create() {
  const router = useRouter();
  const { address, chainId, isConnected } = useWeb3ModalAccount();

  const [mounted, setMounted] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [owners, setOwners]: any = useState([]);
  const [requiredConfirmations, setRequiredConfirmations]: any = useState(0);
  const [status, setStatus] = useState("Create Smart Wallet");
  const options: any = Array.from({ length: owners.length }, (_, i) => i + 1);
  const defaultOption = requiredConfirmations;
  const { walletProvider } = useWeb3ModalProvider();

  if (address && owners.length == 0) {
    setOwners([address]);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  function updateOwners(provider: any) {
    const newOwners = [...owners];
    newOwners.push(provider);
    setOwners(newOwners);
  }

  const createWallet = async () => {
    try {
      setLoading(true);
      const safeFactory = await SafeFactory.init({
        provider: walletProvider!,
      });

      const safeAccountConfig: SafeAccountConfig = {
        owners: owners,
        threshold: requiredConfirmations.value,
      };

      const protocolKitOwner1 = await safeFactory.deploySafe({
        safeAccountConfig,
      });

      const safeAddress = await protocolKitOwner1.getAddress();
      setLoading(false);

      router.push("wallet/" + safeAddress);
    } catch (err) {
      setLoading(false);

      console.log(err);
      setStatus("Create Smart Wallet");
    }
  };

  return (
    <div className="flex flex-col gap-2 font-['DM_Sans'] bg-gray-900 px-8 py-6 rounded-lg mt-2 xl:mx-20 xl:mt-10">
      <div className="flex">
        <div className="mt-2">
          <h1 className="text-2xl tracking-wide  text-white font-semibold">
            Create Smart Wallet
          </h1>
        </div>
      </div>

      <div className=" mt-2 bg-gray-700  rounded-xl">
        <div className="border-b-[1px] px-6 py-6 border-b-gray-600">
          <p className="text-xl font-semibold">Owners</p>
          <p className="mt-">
            Set the owner wallets of your MultiSig Smart Wallet
          </p>
        </div>
        <div className="px-6 py-6">
          {owners && owners.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              {owners.map((owner: any, index: any) => (
                <div className="flex items-center gap-2 " key={index}>
                  <p className="bg-white border border-gray-600 rounded-md px-3 py-2 mt-2 text-sm text-gray-800 w-1/2 tracking-wide xl:hidden">
                    {owner.slice(0, 8) + "..." + owner.slice(-6)}
                  </p>
                  <p className="bg-white border border-gray-600 rounded-md px-3 py-2 mt-2 text-sm text-gray-800  tracking-wide  hidden xl:flex w-96">
                    {owner}
                  </p>
                </div>
              ))}
            </div>
          )}
          <button
            className="text-blue-500 mt-2 disabled:opacity-50 disabled:text-blue-100"
            onClick={() => setOpenModal(true)}
            disabled={!address}
          >
            + Add new owner
          </button>
        </div>
      </div>
      <div className=" mt-2 bg-gray-700 rounded-xl">
        <div className="border-b-[1px] px-6 py-6 border-b-gray-600">
          <p className="text-xl font-semibold">Confirmations</p>
          <p className="mt-1">Any transaction requires the confirmation of</p>
        </div>
        <div className="px-6 py-6 flex items-center gap-2">
          <Dropdown
            options={options}
            value={defaultOption}
            onChange={(option: any) => setRequiredConfirmations(option)}
            placeholder={requiredConfirmations}
            className="w-16 text-gray-950 "
          />
          <p>out of {owners.length} owners</p>
        </div>
      </div>
      <div className="flex flex-col items-center m-4">
        {address ? (
          <button
            className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded tracking-wider"
            onClick={() => createWallet()}
          >
            {loading ? (
              <img src="/loading.gif" className="h-6 rounded-full"></img>
            ) : (
              status
            )}
          </button>
        ) : (
          <w3m-button />
        )}
      </div>
      {openModal && (
        <OwnerModal
          onClose={() => setOpenModal(false)}
          setOwners={setOwners}
          owners={owners}
        ></OwnerModal>
      )}
      <Toaster />
    </div>
  );
}

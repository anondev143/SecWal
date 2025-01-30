"use client";
import { useEffect, useState } from "react";

import {
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { ArrowUpRightIcon, UserIcon } from "@heroicons/react/20/solid";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import Safe from "@safe-global/protocol-kit";
import {
  SafeMultisigTransactionListResponse,
  SignatureResponse,
} from "@safe-global/api-kit";
import SafeApiKit from "@safe-global/api-kit";
import { ethers, formatUnits } from "ethers";

export default function Wallet({ params }: { params: { address: string } }) {
  const router = useRouter();
  const { walletProvider } = useWeb3ModalProvider();

  const [signer, setSigner] = useState(null);
  const [started, setStarted] = useState("");
  const [owners, setOwners]: any = useState();
  const [transactions, setTransactions]: any = useState();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance]: any = useState("");
  const { address, chainId, isConnected } = useWeb3ModalAccount();

  const getBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(walletProvider!);
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth);
    } catch (error) {
      console.log(error);
    }
  };

  const getOwners = async () => {
    try {
      const protocolKit = await Safe.init({
        provider: "https://1rpc.io/sepolia",
        safeAddress: params.address,
      });
      const ownerAddresses = await protocolKit.getOwners();

      setOwners(ownerAddresses);
    } catch (e) {
      console.log(e);
    }
  };

  const getTxs = async () => {
    try {
      const chainId: bigint = BigInt(11155111);
      const apiKit = new SafeApiKit({
        chainId,
      });
      const multisigTxs: SafeMultisigTransactionListResponse =
        await apiKit.getMultisigTransactions(params.address);

      setTransactions(multisigTxs.results);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (address) {
      getBalance();
    }
  }, [address]);

  useEffect(() => {
    if (params.address) {
      getOwners();
      getTxs();
    }
  }, [params]);

  const send = async () => {
    try {
      setStarted("send");
      const receiver = (document.getElementById("receiver") as any).value;
      const amount = (document.getElementById("amount") as any).value;

      const formatAmount = ethers.parseUnits(amount, "ether").toString();

      const safeTransactionData: any = {
        to: receiver,
        data: "0x",
        value: formatAmount,
      };
      const protocolKit = await Safe.init({
        provider: walletProvider!,
        safeAddress: params.address,
      });
      const chainId: bigint = BigInt(11155111);
      const apiKit = new SafeApiKit({
        chainId,
      });
      const safeTransaction = await protocolKit.createTransaction({
        transactions: [safeTransactionData],
      });

      const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);

      const senderSignature = await protocolKit.signHash(safeTxHash);

      await apiKit.proposeTransaction({
        safeAddress: params.address,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: address,
        senderSignature: senderSignature.data,
      });

      console.log(safeTransaction);
      toast.success("Transaction sent");
      await getTxs();
      setStarted("");
    } catch (err) {
      console.log(err);
      setStarted("");
    }
  };

  async function confirm(safeTxHash: any) {
    try {
      setStarted("confirm");
      const protocolKit = await Safe.init({
        provider: walletProvider!,
        safeAddress: params.address,
      });
      const signature = await protocolKit.signHash(safeTxHash);

      const chainId: bigint = BigInt(11155111);
      const apiKit = new SafeApiKit({
        chainId,
      });

      await apiKit.confirmTransaction(safeTxHash, signature.data);

      toast.success("Transaction confirmed");
      await getTxs();
      setStarted("");
    } catch (err) {
      console.log(err);
      toast.error("Transaction failed");
      setStarted("");
    }
  }

  async function execute(safeTxHash: any) {
    try {
      setStarted("execute");
      const protocolKit = await Safe.init({
        provider: walletProvider!,
        safeAddress: params.address,
      });

      const chainId: bigint = BigInt(11155111);
      const apiKit = new SafeApiKit({
        chainId,
      });

      const safeTransaction = await apiKit.getTransaction(safeTxHash);
      const executeTxResponse: any = await protocolKit.executeTransaction(
        safeTransaction
      );
      const receipt = await executeTxResponse.transactionResponse?.wait();
      toast.success("Transaction confirmed");
      await getTxs();

      setStarted("");
    } catch (err) {
      console.log(err);
      toast.error("Transaction failed");
      setStarted("");
    }
  }

  function copyAddress() {
    navigator.clipboard.writeText(params.address);
    toast.success("Address copied");
  }

  function openExplorer() {
    window.open("https://sepolia.etherscan.io/address/" + params.address);
  }

  useState(() => {
    setMounted(true);
  });

  if (!mounted) {
    return null;
  }

  function hasOwnerConfirmed(confirmations: any, ownerAddress: any) {
    return confirmations.some(
      (confirmation: any) =>
        confirmation.owner.toLowerCase() === ownerAddress.toLowerCase()
    );
  }

  if (!address) {
    return (
      <div className="flex  justify-center mt-[22%]">
        Connect your wallet to access your secured wallet
      </div>
    );
  }

  return (
    <div>
      {!loading ? (
        <div className="flex  justify-center mt-[22%]">
          <img src="/loading.gif" className="h-8 rounded-full"></img>
        </div>
      ) : (
        <div className="font-['DM_Sans'] mx-3 xl:mx-20 xl:mt-5">
          <div className="">
            <div className="xl:flex xl:w-full xl:gap-8">
              <div className="w-full xl:w-1/2">
                <h1 className="text-lg tracking-wider font-bold text-black m-2 xl:m-0">
                  Overview
                </h1>
                <div className=" mt-2 bg-gray-900 py-5 px-7 rounded-xl">
                  <div className="flex items-center justify-between">
                    <img src="/profile.png" className="h-12 rounded-full"></img>
                    <div className="flex gap-2">
                      <div className="ml-2 bg-blue-800 rounded-md p-2 px-4">
                        {balance && (
                          <div className="flex gap-1 text-sm items-center justify-center">
                            <p>{balance.slice(0, 6)}</p>
                            <p>ETH</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col mt-4">
                    <div className="flex items-center gap-2 justify-between">
                      {params.address && (
                        <div>
                          {" "}
                          <p className="hidden xl:flex tracking-wider">
                            {params.address}
                          </p>
                          <p className="tracking-widest xl:hidden">
                            {params.address.slice(0, 8) +
                              "......." +
                              params.address.slice(-8)}{" "}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 items-center  hover:cursor-pointer">
                        <DocumentDuplicateIcon
                          className="h-5 mb-1"
                          onClick={copyAddress}
                        />
                        <ArrowTopRightOnSquareIcon
                          className="h-5 mb-1 hover:cursor-pointer"
                          onClick={openExplorer}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="mt-2 text-lg">Owners</p>
                    {owners &&
                      owners.map((owner: any) => {
                        return (
                          <div
                            className="flex mb-2 gap-2 items-center justify-between"
                            key={owner}
                          >
                            <p className="hidden xl:flex tracking-wider">
                              {owner}
                            </p>
                            <p className="tracking-widest xl:hidden">
                              {owner.slice(0, 8) + "......." + owner.slice(-8)}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div className="w-full mt-3 xl:w-1/2 xl:mt-0 ">
                <h1 className="text-lg tracking-wider font-bold text-black m-2 xl:m-0">
                  Transaction
                </h1>
                <div className=" mt-2 bg-gray-900  py-5 px-7 rounded-xl">
                  <p>Receiver address</p>
                  <input
                    className="w-full bg-white p-2 text-gray-800 rounded-md mt-2 focus:outline-none"
                    placeholder="address"
                    id="receiver"
                  ></input>
                  <p className="mt-2">Amount</p>
                  <input
                    className="w-full bg-white text-gray-800 p-2 rounded-md mt-2 focus:outline-none"
                    placeholder="0"
                    id="amount"
                  ></input>
                  <div className="mt-2 flex flex-col items-center">
                    {started == "send" ? (
                      <div className="flex gap-2 items-center mt-2">
                        <img
                          src="/loading.gif"
                          className="h-6 rounded-full"
                        ></img>
                      </div>
                    ) : (
                      <button
                        className="bg-blue-800 rounded-md p-2 mt-2 px-6"
                        onClick={send}
                      >
                        Send
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full mt-5">
            <h1 className="text-lg tracking-wider font-bold text-white m-2 xl:m-0">
              Transactions
            </h1>
            <div className="flex flex-col gap-2 bg-gray-900 p-2 mt-4 rounded-xl ">
              <div className="flex flex-col gap-2 ">
                <div className="overflow-x-scroll" id="transactions">
                  {transactions ? (
                    transactions
                      .slice()
                      .reverse()
                      .map((tx: any, index: any) => {
                        return (
                          <div
                            className="px-2 py-2 flex h-[50px]  justify-between "
                            key={index}
                          >
                            <div className="flex items-center justify-between w-full">
                              <p className="min-w-4">{index + 1}</p>
                              <p className="flex gap-1 min-w-20">
                                <ArrowUpRightIcon className="h-6" />
                                <p className="">Send</p>
                              </p>
                              <p className="min-w-60">
                                {tx.to.slice(0, 11)}....{tx.to.slice(-11)}
                              </p>

                              <div className="flex items-center gap-1 min-w-20">
                                <p>{formatUnits(tx.value)}</p>
                                {/* <p>{chain.nativeCurrency.symbol}</p> */}
                              </div>
                              <p className="flex items-center gap-1 min-w-32">
                                <UserIcon className="h-5 text-gray-600" />{" "}
                                {tx.confirmations.length +
                                  " out of " +
                                  tx.confirmationsRequired}
                                {/* {data.requiredConfirmations} */}
                              </p>

                              {tx.isExecuted ? (
                                <p className="h-6 text-green-500 min-w-52 text-end pr-4">
                                  success
                                </p>
                              ) : (
                                <div>
                                  {hasOwnerConfirmed(
                                    tx.confirmations,
                                    address
                                  ) ? (
                                    <div>
                                      {tx.confirmations.length ==
                                      tx.confirmationsRequired ? (
                                        <div className="min-w-52 text-end">
                                          <button
                                            className="bg-blue-800 rounded-md px-4 py-1 h-[32px] w-[92px] text-center"
                                            onClick={() =>
                                              execute(tx.safeTxHash)
                                            }
                                          >
                                            {started == "execute" ? (
                                              <div className="flex flex-col items-center ">
                                                <img
                                                  src="/loading.gif"
                                                  className="h-5 w-5 rounded-full"
                                                ></img>
                                              </div>
                                            ) : (
                                              <p>Execute</p>
                                            )}{" "}
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="h-6 text-green-500 min-w-52 text-end ">
                                          Waiting for confirmations
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="min-w-52 text-end">
                                      <button
                                        className="bg-blue-800 rounded-md px-4 py-1 w-[92px] text-center"
                                        onClick={() => confirm(tx.safeTxHash)}
                                      >
                                        {started == "confirm" ? (
                                          <div className="flex flex-col items-center ">
                                            <img
                                              src="/loading.gif"
                                              className="h-5 w-5 rounded-full"
                                            ></img>
                                          </div>
                                        ) : (
                                          <p>Confirm</p>
                                        )}{" "}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="flex justify-center p-2">
                      <p>No Transactions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Toaster />
        </div>
      )}
    </div>
  );
}

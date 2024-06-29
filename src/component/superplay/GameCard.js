"use client";
import { IonIcon } from "@ionic/react";
import { arrowRedo, bookmark } from "ionicons/icons";
import Image from "next/image";
import React, { useContext, useState } from "react";
import { ethers } from "ethers";
import { FunPassAbi } from "@/utils/FunPassAbi";
import { FarcasterContext } from "@/context/farcaster";
import { toast } from "react-toastify";

const GameCard = ({ pass }) => {
  const farcasterContext = useContext(FarcasterContext);
  const { connectMetaMaskAndGetSigner } = farcasterContext;
  const [loading, setLoading] = useState(false);

  async function buyPass(tokenId, price) {
    let contractAddress = "0x6020fC64A9EB25bfc6A1aB383cfeCD5460c66A3C";

    try {
      setLoading(true);

      await connectMetaMaskAndGetSigner();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (signer) {
        const contract = new ethers.Contract(
          contractAddress,
          FunPassAbi,
          signer
        );

        let tx = await contract.buyFunPass(tokenId, {
          value: ethers.parseEther(price),
        });
        await tx.wait();
        setLoading(false);
        toast.success("Fun Pass purchased successfully!");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <div className="relative bg-white shadow-xl rounded-lg transition-transform transform duration-300 m-2">
      <div className="card shadow-xl">
        <div className=" ">
          <Image
            width={100}
            height={100}
            src={pass?.image}
            alt={pass?.name}
            className=" w-full h-48 rounded-t-lg"
          />
        </div>
        <div className="card-body p-2">
          <div className="flex">
            <button
              onClick={() => buyPass(pass?.tokenId, pass?.price)}
              type="button"
              className="button bg-secondery flex-1 "
              disabled={loading}
            >
              {loading ? "Buying...." : ` Fun Pass ${pass?.price}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;

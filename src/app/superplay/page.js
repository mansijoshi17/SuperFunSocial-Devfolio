"use client";
import Layout from "@/components/layout/Layout";
import RightSIdeBar from "@/components/sidebar/RightSIdeBar";
import GameCard from "@/components/superplay/GameCard";
import { gamesData } from "@/lib/utils";
import Link from "next/link";
import React, { useContext } from "react";
import { FarcasterContext } from "@/context/farcaster";
import { FunPassAbi } from "@/utils/FunPassAbi";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const page = () => {
  const farcasterContext = useContext(FarcasterContext);
  const { connectMetaMaskAndGetSigner } = farcasterContext;
  const checkEligibility = async () => {
    let contractAddress = "0x6020fC64A9EB25bfc6A1aB383cfeCD5460c66A3C";

    try {
      await connectMetaMaskAndGetSigner();
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (provider) {
        const contract = new ethers.Contract(
          contractAddress,
          FunPassAbi,
          provider
        );

        let balance = await contract.balanceOf(
          localStorage.getItem("currentUser")
        );

        if (Number(balance) > 0) {
          window.open("https://t.me/tokensmashbot", "_blank");
        } else {
          toast.error("Please buy FunPass to access game!");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <main
        id="site__main"
        className="2xl:ml-[--w-side]  xl:ml-[--w-side-sm] p-2.5 h-[calc(100vh-var(--m-top))] mt-[--m-top]"
      >
        <div
          className="lg:flex 2xl:gap-12 gap-8 max-w-[1065px] mx-auto"
          id="js-oversized"
        >
          <div className="max-w-[1080px] mx-auto">
            <div className="flex-none w-full flex flex-col items-center">
              <div className="page-heading mb-8">
                <h1 className="page-title text-4xl font-bold">TOKEN $MASH</h1>
              </div>
              <Link href="">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/post-as-nft-sfs-ton.appspot.com/o/game.png?alt=media&token=d46957ad-cd9f-49c9-8d80-c21307e64bee"
                  alt="Token Smash"
                  layout="responsive"
                  width={300}
                  height={1280}
                  onClick={checkEligibility}
                  className="rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
                />
              </Link>
            </div>
          </div>
          <RightSIdeBar />
        </div>
      </main>
    </Layout>
  );
};

export default page;

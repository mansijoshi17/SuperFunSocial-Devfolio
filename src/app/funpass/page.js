"use client";
import Layout from '@/components/layout/Layout';
import RightSIdeBar from '@/components/sidebar/RightSIdeBar';
import GameCard from '@/components/superplay/GameCard';
import { gamesData } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { FunPassAbi } from '@/utils/FunPassAbi';
import axios from 'axios';
import { data } from 'autoprefixer';

const page = () => {

    useEffect(() => {
        getFunPass()
    }, []);

    const [funPass, setFunPass] = useState([]);

    async function getFunPass() {
        let contractAddress = "0x6020fC64A9EB25bfc6A1aB383cfeCD5460c66A3C";
        let allFunPass = [];

        try {
            const provider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/g_38XwGAdJH3BZVdo2g3auJe_LeZWyDB");
            if (provider) {
                const contract = new ethers.Contract(
                    contractAddress,
                    FunPassAbi,
                    provider
                );

                let passes = await contract.getTokensForSale();
                let price = await contract.standardPrice();

                for (let i = 0; i < passes.length; i++) {
                    const id = Number(passes[i]);
                    let uri = await contract.tokenURI(id)
                    let pass = await axios.get(uri);


                    const newPass = {
                        name: pass?.data?.name,
                        description: pass?.data?.description,
                        image: pass?.data?.image,
                        tokenId: id,
                        price: ethers.formatEther(price)
                    };

                    allFunPass.push(newPass);
                    setFunPass(allFunPass);
                }
                console.log(allFunPass);
            }

        } catch (error) {
            console.log(error);
        }
    }


    return (
        <Layout>
            <main
                id="site__main"
                className="2xl:ml-[--w-side]  xl:ml-[--w-side-sm] p-2.5 h-[calc(100vh-var(--m-top))] mt-[--m-top]"
            >
                <div
                    className="lg:flex 2xl:gap-8 gap-6 max-w-[1065px] mx-auto"
                    id="js-oversized"
                >
                    <div className="max-w-[1080px] mx-auto">
                        <div class="page-heading ">
                            <h1 class="page-title"> Fun Pass NFTs </h1>
                        </div>
                        <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2 p-2">
                            {funPass && funPass.map((pass) => (
                                <div key={pass.tokenId} className="group">
                                    <GameCard pass={pass} />
                                </div>
                            ))}
                        </div>

                    </div>
                    <RightSIdeBar />
                </div>
            </main>
        </Layout>
    );
};

export default page;
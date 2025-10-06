"use client";

import Link from "next/link";
import Image from "next/image";

import { motion } from "motion/react";

import BST from "@/public/home/BST.svg";
import AVL from "@/public/home/AVL.svg";
import Heap from "@/public/home/Heap.svg";
import Sort from "@/public/home/Sort.svg";

const hoverAnimation = {
  whileHover: { scale: 1.01 },
  transition: { duration: 0.5 },
};

const HomePage = () => {
  return (
    <div className="grid h-[95vh] w-full grid-cols-3 grid-rows-2 gap-4 p-6">
      <motion.div
        {...hoverAnimation}
        className="relative col-span-1 row-span-1 flex items-center justify-center rounded-lg bg-[#FBC5C0] text-[#B14A40]"
      >
        <Link href="/bst" className="h-full w-full px-4">
          <div className="py-4 text-4xl font-bold">BST Trees</div>
          <div className="">Organize Numbers for Quick Searches</div>
          <div className="absolute right-0 top-0 h-full">
            <Image src={BST} alt="BST" className="h-full" />
          </div>
        </Link>
      </motion.div>

      <motion.div
        {...hoverAnimation}
        className="relative col-span-1 row-span-1 flex items-center justify-center rounded-lg bg-[#F8DD92] text-[#A37903]"
      >
        <Link href="/avl" className="h-full w-full px-4">
          <div className="py-4 text-4xl font-bold">AVL Trees</div>
          <div className="">Self Balancing for Better Lookups</div>
          <div className="absolute right-0 top-0 h-full">
            <Image src={AVL} alt="AVL" className="h-full object-contain" />
          </div>
        </Link>
      </motion.div>

      <motion.div
        {...hoverAnimation}
        className="relative col-span-1 row-span-1 flex items-center justify-center rounded-lg bg-[#BCDDDB] text-[#0B7E76]"
      >
        <Link href="/heap" className="h-full w-full px-4">
          <div className="py-4 text-4xl font-bold">Heaps</div>
          <div className="">Manage Priorities Efficiently</div>
          <div className="absolute right-0 top-0">
            <Image src={Heap} alt="Heap" className="object-contain" />
          </div>
        </Link>
      </motion.div>

      <motion.div
        {...hoverAnimation}
        className="relative col-span-3 row-span-1 flex items-center justify-center rounded-lg bg-[#EDD6F6] text-[#895F98]"
      >
        <Link href="/" className="h-full w-full px-4">
          <div className="py-4 text-4xl font-bold">Sorting</div>
          <div className="">In development!</div>
          <div className="absolute bottom-0 right-8">
            <Image src={Sort} alt="Sort" className="object-contain" />
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default HomePage;

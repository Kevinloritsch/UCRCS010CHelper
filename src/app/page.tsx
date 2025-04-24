import chain from "@/public/chain.png";
import tree from "@/public/tree.png";
import watch from "@/public/watch.png";
import Image from "next/image";

const Home = () => {
  return (
    <div className="relative grid h-full w-full justify-center">
      <p className="z-10 h-20 pt-20 text-center text-7xl text-white">
        UCR CS 010C Helper
      </p>
      <Image
        className="absolute inset-x-0 -top-20 w-full"
        width={1400}
        height={1000}
        src={tree}
        alt="tree"
      />
      <Image
        className="absolute -top-2 left-6"
        height={400}
        src={watch}
        alt="watch"
      />
      <Image
        className="absolute -top-2 right-0"
        height={400}
        src={chain}
        alt="chain"
      />
      <p className="absolute left-[750px] top-96 z-10 text-5xl text-white">
        Big O
      </p>
      <p className="absolute left-[400px] top-[950px] text-5xl text-white">
        {" "}
        Sorting{" "}
      </p>
      <p className="absolute left-[1250px] top-[790px] text-5xl text-white">
        {" "}
        Stacks & <br /> Queues{" "}
      </p>
      <p className="absolute left-[890px] top-[1000px] text-5xl text-white">
        {" "}
        Hashing{" "}
      </p>
      <p className="absolute left-[700px] top-[1170px] text-5xl text-white">
        {" "}
        Trees{" "}
      </p>
      <p className="absolute left-[1210px] top-[1120px] text-5xl text-white">
        {" "}
        Graphs{" "}
      </p>
    </div>
  );
};

export default Home;

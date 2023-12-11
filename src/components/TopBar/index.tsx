import Link from "next/link";
import ConnectButton from "../ConnectButton";
import NavBar from "./NavBar";

const TopBar = () => {
  return (
    <div className="fixed top-0 w-full">
      <div className="relative flex w-full items-center px-4 py-3 shadow-sm">
        <Link href="/">
        <span className="text-lg font-semibold">NFT Marketplace</span>
        </Link>
        <div className="flex-grow">
          <NavBar />
        </div>
        <ConnectButton />
      </div>
    </div>
  );
};

export default TopBar;

"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  return (
    <div className="flex flex-row justify-between items-center py-1.5  mx-2  text-white xl:mx-20 xl:mt-5">
      <div className="flex flex-row items-center">
        <button
          className="text-2xl font-bold tracking-widest font-['Fira_sans']"
          onClick={() => {
            router.push("/");
          }}
        >
          SecuredWal
        </button>
      </div>
      <w3m-button />{" "}
    </div>
  );
}

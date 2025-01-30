import "./globals.css";
import { Web3Modal } from "../context/web3modal";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "SecWal",
  description: "null",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Web3Modal>
          <Navbar />
          {children}
        </Web3Modal>
      </body>
    </html>
  );
}

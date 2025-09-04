"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BarChart3, Menu, X } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCounter, getReadonlyProvider } from "@/services/blockchain.service";

const Header = () => {
  const programReadOnly = useMemo(() => getReadonlyProvider(), []);
  const pathname = usePathname();
  const router = useRouter();

  const fetchData = async () => {
    const count = await getCounter(programReadOnly);
    setTotalPolls(count.total.toNumber());
  };

  const handleSectionChange = (section: "explore" | "dashboard") => {
    if (section === "explore") {
      router.push("/");
    } else {
      router.push("/dashboard");
    }
    console.log(section);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const [activeSection, setActiveSection] = useState<"explore" | "dashboard">(
    pathname === "/dashboard" ? "dashboard" : "explore"
  );

  const [totalPolls, setTotalPolls] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => { 
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setActiveSection(pathname === "/dashboard" ? "dashboard" : "explore");
  }, [pathname]);

  useEffect(() => {
    if (!programReadOnly) return;
    fetchData();
  }, [programReadOnly, fetchData]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black shadow-lg ">
        <div className="max-w-80% mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <h1 className="text-xl font-bold font-mono text-black tracking-wider">
                  VOTANA
                </h1>
                <p className="text-xs text-muted-foreground font-bold tracking-wide">
                  DECENTRALIZED VOTING
                </p>
              </Link>
              <Link href="/create" className="text-primary border-2 border-black shadow-[2px_2px_0_0_#000] px-4 py-1 rounded-none hover:bg-muted">
                  Create
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant={activeSection === "explore" ? "default" : "outline"}
                className={`brutalist-button cursor-pointer ${
                  activeSection === "explore"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-black hover:bg-muted"
                }`}
                onClick={() => handleSectionChange("explore")}
              >
                <Search className="h-4 w-4 mr-2" />
                EXPLORE
              </Button>

              <Button
                variant={activeSection === "dashboard" ? "default" : "outline"}
                className={`brutalist-button cursor-pointer ${
                  activeSection === "dashboard"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-black hover:bg-muted"
                }`}
                onClick={() => handleSectionChange("dashboard")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                DASHBOARD
              </Button>
            </div>

            {/* Stats and Wallet Section */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="px-4 py-2 bg-muted border-2 border-black">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black">
                    TOTAL POLLS:
                  </span>
                  <Badge className="brutalist-badge bg-secondary text-secondary-foreground">
                    {totalPolls}
                  </Badge>
                </div>
              </div>
              {/* Wallet Connection */}
              {isMounted && <WalletMultiButton className="brutalist-button" />}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMobileMenu}
                className="brutalist-button bg-white text-black"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t-4 border-black">
            <div className="px-4 py-4 space-y-3">
              <Button
                variant={activeSection === "explore" ? "default" : "outline"}
                className={`w-full justify-start brutalist-button ${
                  activeSection === "explore"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-black"
                }`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSectionChange("explore");
                }}
              >
                <Search className="h-4 w-4 mr-2" />
                EXPLORE
              </Button>

              <Button
                variant={activeSection === "dashboard" ? "default" : "outline"}
                className={`w-full justify-start brutalist-button ${
                  activeSection === "dashboard"
                    ? "bg-accent text-accent-foreground"
                    : "bg-white text-black"
                }`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSectionChange("dashboard");
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                DASHBOARD
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;

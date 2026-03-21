import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AboutSection from "./components/AboutSection";
import ApplicationForm from "./components/ApplicationForm";
import ContactFooter from "./components/ContactFooter";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import PositionsSection from "./components/PositionsSection";

export default function App() {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    const el = document.getElementById("apply");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Toaster position="top-center" richColors />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <PositionsSection onSelectRole={handleSelectRole} />
        <ApplicationForm
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
        <ContactFooter />
      </main>
    </div>
  );
}

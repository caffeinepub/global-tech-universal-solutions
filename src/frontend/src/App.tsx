import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AboutSection from "./components/AboutSection";
import AdminDashboard from "./components/AdminDashboard";
import ApplicationForm from "./components/ApplicationForm";
import ContactFooter from "./components/ContactFooter";
import HeroSection from "./components/HeroSection";
import LocationPromptBanner from "./components/LocationPromptBanner";
import Navbar from "./components/Navbar";
import PositionsSection from "./components/PositionsSection";
import UnsubscribeSection from "./components/UnsubscribeSection";

export default function App() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showAdmin, setShowAdmin] = useState(false);

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    const el = document.getElementById("apply");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-background font-body">
        <LocationPromptBanner />
        <Toaster position="top-center" richColors />
        <AdminDashboard onBack={() => setShowAdmin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <LocationPromptBanner />
      <Toaster position="top-center" richColors />
      <Navbar onAdminClick={() => setShowAdmin(true)} />
      <main>
        <HeroSection />
        <AboutSection />
        <PositionsSection onSelectRole={handleSelectRole} />
        <ApplicationForm
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
        <UnsubscribeSection />
        <ContactFooter />
      </main>
    </div>
  );
}

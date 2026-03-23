import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AboutSection from "./components/AboutSection";
import AdminDashboard from "./components/AdminDashboard";
import ApplicationForm from "./components/ApplicationForm";
import ContactFooter from "./components/ContactFooter";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import PositionsSection from "./components/PositionsSection";
import UnsubscribeSection from "./components/UnsubscribeSection";
import { createActorWithConfig } from "./config";

export default function App() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        createActorWithConfig()
          .then((actor) =>
            actor.logVisitorLocation(
              pos.coords.latitude,
              pos.coords.longitude,
              navigator.userAgent,
            ),
          )
          .catch(() => {});
      },
      () => {},
      { timeout: 10000 },
    );
  }, []);

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
        <Toaster position="top-center" richColors />
        <AdminDashboard onBack={() => setShowAdmin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
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

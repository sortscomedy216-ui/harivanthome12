import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import SplashScreen from "./pages/SplashScreen";
import HomePage from "./pages/HomePage";
import ProvidersListPage from "./pages/ProvidersListPage";
import ProviderDetailPage from "./pages/ProviderDetailPage";
import ProviderRegistrationPage from "./pages/ProviderRegistrationPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import InstallPage from "./pages/InstallPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import UserProfileSetup from "./pages/UserProfileSetup";
import NotFound from "./pages/NotFound";
import OfflineIndicator from "./components/OfflineIndicator";
import { useDynamicFavicon } from "./hooks/useDynamicFavicon";

const queryClient = new QueryClient();

const AppContent = () => {
  useDynamicFavicon();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <LocationProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/setup-profile" element={<UserProfileSetup />} />
                <Route path="/providers/:category" element={<ProvidersListPage />} />
                <Route path="/provider/:id" element={<ProviderDetailPage />} />
                <Route path="/register-provider" element={<ProviderRegistrationPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/install" element={<InstallPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <OfflineIndicator />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LocationProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

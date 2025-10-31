import { useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import PluginManager from "@/pages/PluginManager";
import PluginWorkspace from "@/pages/PluginWorkspace";
import Settings from "@/pages/Settings";
import DeveloperConsole from "@/pages/DeveloperConsole";

export default function App() {
  const {
    theme: appTheme,
    loadPlugins,
    loadSettings,
    setCurrentUser,
  } = useAppStore();

  useEffect(() => {
    console.log("[App] App component mounted");
    
    // Initialize app data
    const initializeApp = async () => {
      try {
        console.log("[App] Starting app initialization");
        
        // Set default user (in a real app, this would come from authentication)
        setCurrentUser({
          id: "admin",
          username: "admin",
          email: "admin@superapp.local",
          preferences: {},
          createdAt: new Date(),
        });

        // Load initial data
        await Promise.all([loadSettings(), loadPlugins()]);
        console.log("[App] App initialization completed");
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initializeApp();
  }, [loadPlugins, loadSettings, setCurrentUser]);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          appTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/plugins" element={<PluginManager />} />
            <Route path="/workspace" element={<PluginWorkspace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/developer" element={<DeveloperConsole />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

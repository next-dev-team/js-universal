import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Space, Typography, Spin, message } from "antd";
import {
  CloseOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  SettingOutlined,
  BugOutlined,
} from "@ant-design/icons";

interface WebViewElement extends HTMLElement {
  src: string;
  reload: () => void;
  openDevTools: () => void;
  executeJavaScript: (code: string) => void;
  addEventListener: (event: string, handler: (event: unknown) => void) => void;
  removeEventListener: (
    event: string,
    handler: (event: unknown) => void
  ) => void;
}

const { Title, Text } = Typography;

interface PluginWebviewProps {
  pluginId: string;
  pluginName: string;
  pluginUrl: string;
  onClose?: () => void;
  onFullscreen?: () => void;
  onSettings?: () => void;
  isDevelopment?: boolean;
  preloadPath?: string;
}

export default function PluginWebview({
  pluginId,
  pluginName,
  pluginUrl,
  onClose,
  onFullscreen,
  onSettings,
  isDevelopment = false,
  preloadPath,
}: PluginWebviewProps) {
  const webviewRef = useRef<WebViewElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsReady] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine the correct preload script path
  const getPreloadPath = () => {
    if (preloadPath) {
      return preloadPath;
    }

    // Use the built preload scripts from the out directory
    const preloadScript = isDevelopment
      ? "dev-plugin-preload.cjs"
      : "plugin-preload.cjs";

    // Use file:// protocol to access the built preload scripts
    // The out directory is at the project root level
    if (isDevelopment) {
      // In development, construct the path using file:// protocol
      return `file://${process
        .cwd()
        .replace(/\\/g, "/")}/out/preload/${preloadScript}`;
    } else {
      // In production, use a relative path from the app's resource directory
      return `file://${process.resourcesPath}/app/out/preload/${preloadScript}`;
    }
  };

  const handleTestPluginAPI = () => {
    const webview = webviewRef.current;
    if (webview) {
      webview.executeJavaScript(`
        (async () => {
          console.log('[PluginWebview] Testing pluginAPI...');
          console.log('pluginAPI available:', typeof window.pluginAPI !== 'undefined');
          console.log('devPluginAPI available:', typeof window.devPluginAPI !== 'undefined');
          
          if (window.pluginAPI) {
            console.log('Plugin ID:', window.pluginAPI.getPluginId());
            console.log('Is Development:', window.pluginAPI.isDevelopment ? window.pluginAPI.isDevelopment() : 'N/A');
          }
          
          if (window.devPluginAPI) {
            try {
              const devInfo = await window.devPluginAPI.getInfo();
              console.log('Dev Plugin Info:', devInfo);
            } catch (error) {
              console.error('Error getting dev plugin info:', error);
            }
          }
        })();
      `);
    }
  };

  const handleOpenDevTools = () => {
    const webview = webviewRef.current;
    if (webview && typeof webview.openDevTools === "function") {
      webview.openDevTools();
    }
  };

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    console.log(`[PluginWebview ${pluginId}] Setting up event listeners`);

    // Set a loading timeout
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        console.warn(`[PluginWebview ${pluginId}] Loading timeout reached`);
        setLoading(false);
        setError("Plugin loading timed out");
      }
    }, 30000); // 30 second timeout

    const handleLoadStart = () => {
      console.log(`[PluginWebview ${pluginId}] Load started`);
      setLoading(true);
      setError(null);
    };

    const handleLoadStop = () => {
      console.log(`[PluginWebview ${pluginId}] Load stopped`);
      setLoading(false);

      // Clear the loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };

    const handleLoadError = (event: unknown) => {
      console.error(`[PluginWebview ${pluginId}] Load error:`, event);
      setLoading(false);
      setError(
        `Failed to load plugin: ${
          (event as { errorDescription?: string })?.errorDescription ||
          "Unknown error"
        }`
      );
      message.error(`Failed to load plugin ${pluginName}`);
    };

    const handleDomReady = () => {
      console.log(
        `[PluginWebview ${pluginId}] DOM ready - preload script should have injected pluginAPI`
      );
      setIsReady(true);
      setLoading(false);

      // Clear the loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      // Verify that the pluginAPI was injected by the preload script
      webview.executeJavaScript(`
        console.log('[PluginWebview] Verifying pluginAPI injection...');
        console.log('pluginAPI available:', typeof window.pluginAPI !== 'undefined');
        console.log('devPluginAPI available:', typeof window.devPluginAPI !== 'undefined');
        
        if (typeof window.pluginAPI === 'undefined') {
          console.error('[PluginWebview] pluginAPI not found! Preload script may have failed.');
        } else {
          console.log('[PluginWebview] pluginAPI successfully loaded via preload script');
        }
      `);
    };

    const handleFailLoad = (event: unknown) => {
      console.error(`[PluginWebview ${pluginId}] Load failed:`, event);
      setLoading(false);
      setError(
        `Failed to load plugin: ${
          (event as { errorDescription?: string })?.errorDescription ||
          "Unknown error"
        }`
      );
      message.error(`Failed to load plugin ${pluginName}`);
    };

    const handleFinishLoad = () => {
      console.log(`[PluginWebview ${pluginId}] Load finished`);
      setLoading(false);
    };

    const handleNewWindow = (event: unknown) => {
      console.log(`[PluginWebview ${pluginId}] New window requested:`, event);
      // Prevent new windows by default for security
      event.preventDefault?.();
    };

    const handleConsoleMessage = (event: unknown) => {
      console.log(
        `[PluginWebview ${pluginId}] Console:`,
        (event as { message?: string })?.message
      );
    };

    // Add event listeners
    webview.addEventListener("loadstart", handleLoadStart);
    webview.addEventListener("loadstop", handleLoadStop);
    webview.addEventListener("loaderror", handleFailLoad);
    webview.addEventListener("dom-ready", handleDomReady);
    webview.addEventListener("console-message", handleConsoleMessage);

    return () => {
      webview.removeEventListener("loadstart", handleLoadStart);
      webview.removeEventListener("loadstop", handleLoadStop);
      webview.removeEventListener("loaderror", handleFailLoad);
      webview.removeEventListener("dom-ready", handleDomReady);
      webview.removeEventListener("console-message", handleConsoleMessage);

      // Clear any pending timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [pluginId, pluginName, isDevelopment, pluginUrl]);

  const handleReload = () => {
    const webview = webviewRef.current;
    if (webview) {
      console.log(`[PluginWebview ${pluginId}] Attempting to reload webview`);

      // Check if reload method exists
      if (typeof webview.reload === "function") {
        console.log(`[PluginWebview ${pluginId}] Using webview.reload()`);
        webview.reload();
      } else if (typeof webview.src === "string") {
        // Fallback: reload by resetting src
        console.log(
          `[PluginWebview ${pluginId}] Fallback: reloading by resetting src`
        );
        const currentSrc = webview.src;
        webview.src = "";
        setTimeout(() => {
          webview.src = currentSrc;
        }, 100);
      } else {
        // Last resort: reload the entire component
        console.log(
          `[PluginWebview ${pluginId}] Last resort: forcing component reload`
        );
        setLoading(true);
        setError(null);
        setIsReady(false);

        // Force re-render by updating the key
        const timestamp = Date.now();
        webview.setAttribute("data-reload-key", timestamp.toString());

        // Reset src to trigger reload
        setTimeout(() => {
          webview.src = pluginUrl;
        }, 100);
      }
    } else {
      console.error(
        `[PluginWebview ${pluginId}] Webview ref is null, cannot reload`
      );
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Title level={4} className="mb-0">
              {pluginName}
            </Title>
            {isDevelopment && (
              <Text type="secondary" className="text-xs">
                (Dev Mode)
              </Text>
            )}
          </div>
          <Space>
            {isDevelopment && (
              <>
                <Button
                  size="small"
                  icon={<BugOutlined />}
                  onClick={handleTestPluginAPI}
                  title="Test PluginAPI"
                  data-testid={`plugin-test-api-${pluginId}`}
                />
                <Button
                  size="small"
                  icon={<BugOutlined />}
                  onClick={handleOpenDevTools}
                  title="Open DevTools"
                  data-testid={`plugin-devtools-${pluginId}`}
                />
              </>
            )}
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleReload}
              title="Reload Plugin"
              data-testid={`plugin-reload-${pluginId}`}
            />
            {onFullscreen && (
              <Button
                size="small"
                icon={<FullscreenOutlined />}
                onClick={onFullscreen}
                title="Fullscreen"
              />
            )}
            {onSettings && (
              <Button
                size="small"
                icon={<SettingOutlined />}
                onClick={onSettings}
                title="Settings"
              />
            )}
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={onClose}
              title="Close Plugin"
            />
          </Space>
        </div>
      }
      className="h-full"
      bodyStyle={{ padding: 0, height: "calc(100% - 57px)" }}
    >
      <div className="relative h-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <Spin size="large" />
            <Text className="ml-2">Loading plugin...</Text>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center">
              <Text type="danger">{error}</Text>
              <br />
              <Button onClick={handleReload} className="mt-2">
                Retry
              </Button>
            </div>
          </div>
        )}

        <webview
          ref={webviewRef}
          src={pluginUrl}
          style={{ width: "100%", height: "80vh" }}
          preload={getPreloadPath()}
          allowpopups
          webpreferences="contextIsolation=yes,nodeIntegration=no"
          data-plugin-id={pluginId}
        />
      </div>
    </Card>
  );
}

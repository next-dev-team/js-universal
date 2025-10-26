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

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleLoadStart = () => {
      console.log(`[PluginWebview ${pluginId}] Load started: ${pluginUrl}`);
      setLoading(true);
      setError(null);

      // Set a timeout to prevent infinite loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn(
          `[PluginWebview ${pluginId}] Loading timeout after 10 seconds`
        );
        setLoading(false);
        setError("Loading timeout - plugin may not be responding");
      }, 10000);
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
      setIsReady(true);
      setLoading(false);

      // Inject pluginAPI into the webview context
      if (isDevelopment) {
        webview.executeJavaScript(`
          console.log('[PluginWebview] DOM ready, injecting pluginAPI...');
          
          // Create a mock pluginAPI for development
          window.pluginAPI = {
            isDevelopment: () => true,
            getPluginId: () => '${pluginId}',
            getVersion: () => '1.0.0',
            getManifest: () => ({
              id: '${pluginId}',
              name: '${pluginName}',
              version: '1.0.0',
              description: 'Development plugin',
              author: 'Super App Team',
              main: 'index.html',
              permissions: ['storage', 'notifications', 'communication']
            }),
            storage: {
              get: async (key) => {
                console.log('[PluginAPI] Storage get:', key);
                return localStorage.getItem(key);
              },
              set: async (key, value) => {
                console.log('[PluginAPI] Storage set:', key, value);
                localStorage.setItem(key, JSON.stringify(value));
                return true;
              },
              remove: async (key) => {
                console.log('[PluginAPI] Storage remove:', key);
                localStorage.removeItem(key);
                return true;
              },
              clear: async () => {
                console.log('[PluginAPI] Storage clear');
                localStorage.clear();
                return true;
              }
            },
            events: {
              on: (event, callback) => {
                console.log('[PluginAPI] Event listener added:', event);
                window.addEventListener(event, callback);
              },
              off: (event, callback) => {
                console.log('[PluginAPI] Event listener removed:', event);
                window.removeEventListener(event, callback);
              },
              emit: (event, data) => {
                console.log('[PluginAPI] Event emitted:', event, data);
                window.dispatchEvent(new CustomEvent(event, { detail: data }));
              }
            },
            notifications: {
              show: (title, body, options) => {
                console.log('[PluginAPI] Notification:', title, body, options);
                if (Notification.permission === 'granted') {
                  new Notification(title, { body, ...options });
                }
              },
              requestPermission: async () => {
                console.log('[PluginAPI] Requesting notification permission');
                return await Notification.requestPermission();
              }
            },
            communication: {
              send: (channel, data) => {
                console.log('[PluginAPI] Communication send:', channel, data);
                // Mock communication
                return Promise.resolve({ success: true, data });
              },
              receive: (channel, callback) => {
                console.log('[PluginAPI] Communication receive:', channel);
                // Mock communication listener
                window.addEventListener(channel, callback);
              }
            }
          };
          
          // Also expose as devPluginAPI for development-specific features
          window.devPluginAPI = {
            reload: async () => {
              console.log('[DevPluginAPI] Reload requested');
              window.location.reload();
              return { success: true, message: 'Plugin reloaded' };
            },
            getInfo: async () => {
              return {
                id: '${pluginId}',
                name: '${pluginName}',
                version: '1.0.0',
                isDevelopment: true,
                url: '${pluginUrl}'
              };
            }
          };
          
          console.log('[PluginWebview] pluginAPI injected successfully');
        `);
      }
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

  const handleOpenDevTools = () => {
    const webview = webviewRef.current;
    if (webview) {
      webview.openDevTools();
    }
  };

  const handleTestPluginAPI = () => {
    const webview = webviewRef.current;
    if (webview) {
      webview.executeJavaScript(`
        // Test if pluginAPI is available
        if (typeof window.pluginAPI !== 'undefined') {
          console.log('[PluginWebview] pluginAPI is available:', window.pluginAPI);
          
          // Test basic functionality
          try {
            const pluginId = window.pluginAPI.getPluginId();
            const isDev = window.pluginAPI.isDevelopment ? window.pluginAPI.isDevelopment() : false;
            console.log('[PluginWebview] Plugin ID:', pluginId);
            console.log('[PluginWebview] Development mode:', isDev);
            
            // Show success message
            alert('PluginAPI is working!\\nPlugin ID: ' + pluginId + '\\nDev Mode: ' + isDev);
          } catch (error) {
            console.error('[PluginWebview] PluginAPI test failed:', error);
            alert('PluginAPI test failed: ' + error.message);
          }
        } else {
          console.error('[PluginWebview] pluginAPI is not available');
          alert('PluginAPI is not available in the webview context');
        }
      `);
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
          preload={preloadPath}
          allowpopups
          webpreferences="contextIsolation=yes,nodeIntegration=no"
          data-plugin-id={pluginId}
        />
      </div>
    </Card>
  );
}

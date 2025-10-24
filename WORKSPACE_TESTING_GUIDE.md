# 🚀 Plugin Workspace Testing Guide

## 📋 **Current Status**

- ✅ Counter App Dev Server: Running on `http://localhost:3003`
- ✅ Main Electron App: Running with multiple processes
- ✅ Plugin Workspace: Implemented and ready for testing

## 🔄 **Development Flow Explained**

### **Step 1: Start Development Servers**

```bash
# Terminal 1: Start Counter App Dev Server
cd apps/counter-app-dev
npm run dev
# Server runs on http://localhost:3003

# Terminal 2: Start Main Electron App
cd packages/electron
npm run dev
# Main app runs on http://localhost:5174
```

### **Step 2: Auto-Registration Process**

When the Electron app starts, it automatically:

1. **Registers** the counter-app-dev plugin in the webview manager
2. **Launches** the plugin in the workspace
3. **Embeds** it via webview in the main window

### **Step 3: Access Plugin Workspace**

1. Open the Electron app
2. Click **"Plugin Workspace"** in the sidebar
3. You should see the counter-app-dev plugin loaded automatically

## 🧪 **Testing Steps**

### **Test 1: Basic Plugin Loading**

1. Navigate to Plugin Workspace
2. Verify the counter-app-dev plugin appears in a tab
3. Check that it shows "DEV" indicator
4. Verify the plugin loads the counter interface

### **Test 2: PluginAPI Access**

1. In the Plugin Workspace, click the **"Test PluginAPI"** button (bug icon)
2. This should show an alert with:
   - Plugin ID: `counter-app-dev`
   - Development Mode: `true`
3. If successful, the pluginAPI is working correctly

### **Test 3: Plugin Functionality**

1. Test the counter buttons (increment/decrement/reset)
2. Check that the counter value updates
3. Verify development controls work (reload, clear storage, etc.)

### **Test 4: Development Features**

1. Click **"Open DevTools"** button to open webview DevTools
2. Click **"Reload Plugin"** to refresh the webview
3. Test hot reload by making changes to the counter-app-dev files

### **Test 5: Plugin Management**

1. Close the plugin using the X button on the tab
2. Verify the plugin is removed from the workspace
3. Check that the plugin can be relaunched

## 🔧 **Troubleshooting**

### **If Plugin Doesn't Load:**

1. Check that both servers are running:

   ```bash
   # Check counter-app-dev server
   curl http://localhost:3003

   # Check Electron processes
   tasklist | findstr electron
   ```

2. Check browser console for errors
3. Verify the webview is loading the correct URL

### **If PluginAPI Doesn't Work:**

1. Check the webview DevTools console
2. Look for pluginAPI-related errors
3. Verify the preload script is being injected

### **If Port Conflicts:**

- The counter-app-dev server automatically finds available ports
- Update the port in these files if needed:
  - `packages/electron/src/main/plugin-dev-loader.ts`
  - `packages/electron/src/main/index.ts`
  - `packages/electron/src/renderer/components/PluginContainer.tsx`

## 🎯 **Expected Results**

### **Successful Test Results:**

- ✅ Plugin loads in webview tab
- ✅ Counter interface is functional
- ✅ PluginAPI test shows correct plugin ID and dev mode
- ✅ Development controls work
- ✅ Hot reload functions properly
- ✅ Plugin can be closed and reopened

### **Key Features Working:**

- 🔄 **Hot Reload**: Changes to counter-app-dev files reflect immediately
- 🐛 **Debugging**: DevTools accessible for webview debugging
- 🔌 **PluginAPI**: Full access to storage, notifications, communication
- 📱 **Responsive**: Plugin adapts to different window sizes
- 🎨 **Integrated**: Seamless experience within main app

## 🚀 **Next Steps**

Once basic testing is complete, you can:

1. **Add More Plugins**: Create additional development plugins
2. **Test Communication**: Use the message sending features
3. **Performance Testing**: Use the built-in performance test
4. **Storage Testing**: Test plugin data persistence
5. **Notification Testing**: Test system notifications

## 📝 **Notes**

- The webview approach provides better security isolation
- PluginAPI is properly injected into the webview context
- Development plugins get special debugging features
- The system supports both development and production plugins
- Multiple plugins can run simultaneously in tabs

---

**Ready to test!** 🎉 Open the Electron app and navigate to "Plugin Workspace" to see the counter-app-dev plugin in action.

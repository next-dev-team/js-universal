import { exec } from "child_process";
import { platform } from "os";

const isWindows = platform() === "win32";

console.log("Stopping Electron processes...");

if (isWindows) {
  // Windows
  exec("taskkill /f /im electron.exe", (error) => {
    if (error && !error.message.includes("not found")) {
      console.error("Error stopping electron.exe:", error.message);
    }
  });

  exec('taskkill /f /im "Super App.exe"', (error) => {
    if (error && !error.message.includes("not found")) {
      console.error("Error stopping Super App.exe:", error.message);
    }
  });
} else {
  // Unix-like systems
  exec("pkill -f electron", (error) => {
    if (error && !error.message.includes("No matching processes")) {
      console.error("Error stopping electron processes:", error.message);
    }
  });

  exec('pkill -f "Super App"', (error) => {
    if (error && !error.message.includes("No matching processes")) {
      console.error("Error stopping Super App processes:", error.message);
    }
  });
}

console.log("Electron processes stopped.");

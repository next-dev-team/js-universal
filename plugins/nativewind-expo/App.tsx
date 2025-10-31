import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';

import './global.css';

export default function App() {
  return (
    <>
      <ScreenContent title="Home" path="App.tsx">
        <button className="focus:ring-opacity-50 mb-4 rounded-lg border-0 bg-blue-500 px-6 py-3 font-bold text-white shadow-lg transition-all duration-200 ease-in-out hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none active:scale-95">
          Click me
        </button>
        {/* Card */}
        <div className="max-w-sm overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
          <div className="h-48 bg-linear-to-br from-purple-400 via-pink-500 to-red-500"></div>
          <div className="p-6">
            <div className="mb-2 flex items-center">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Technology
              </span>
              <span className="ml-auto text-sm text-gray-500">2 days ago</span>
            </div>
            <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900">
              Getting Started with NativeWind v5
            </h3>
            <p className="mb-4 line-clamp-3 text-sm text-gray-600">
              Learn how to style your React Native apps with the latest version of NativeWind.
              Discover new features and best practices for modern mobile development.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 h-8 w-8 rounded-full bg-gray-300"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Mobile Developer</p>
                </div>
              </div>
              <button className="text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800">
                Read More →
              </button>
            </div>
          </div>
        </div>
      </ScreenContent>
      <StatusBar style="auto" />
    </>
  );
}

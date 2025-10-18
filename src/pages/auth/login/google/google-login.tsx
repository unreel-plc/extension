import { GoogleLoginButton } from "./google-login-button-new";
import { useAuthStore } from "@/stores/auth-store";
import { Navigate } from "react-router-dom";
import logo from "../../../../../public/extension_icon48.png";

const GoogleLoginPage = () => {
  const { authenticated } = useAuthStore();

  if (authenticated) {
    // Close popup if we're in a Chrome extension popup window

    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <img src={logo} alt="SparkReel" className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome to Unreel
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in with your Google account to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginPage;

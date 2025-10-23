import { GoogleLoginButton } from "./google-login-button-new";
import { useAuthStore } from "@/stores/auth-store";
import { Navigate } from "react-router-dom";
import logo from "@/assets/unreel_logo.png";

const GoogleLoginPage = () => {
  const { authenticated } = useAuthStore();

  if (authenticated) {
    // Close popup if we're in a Chrome extension popup window

    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16  flex items-center justify-center mb-4 ">
            <img src={logo} alt="SparkReel" className="w-16 h-16" />
          </div>{" "}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Unreel
          </h1>
          <p className="text-muted-foreground">
            Sign in with your Google account to continue
          </p>
        </div>

        {/* Login Card */}
        <div>
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginPage;

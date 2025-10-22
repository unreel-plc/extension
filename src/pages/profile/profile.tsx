import { useAuthStore } from "@/stores/auth-store";
import useAuthentication from "@/hooks/use-authentication";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Mail, Calendar, Shield, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Profile = () => {
  const { user, isLoading, authenticated } = useAuthStore();
  const { logout } = useAuthentication();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account settings and information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 h-fit">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {getInitials(user.name)}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-card-foreground mb-2">
                  {user.name}
                </h2>
                <div className="flex justify-center mt-2">
                  <Badge
                    variant={user.email_verified ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    {user.email_verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-sm border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Account Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{user.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Account Status
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Badge
                        variant={user.email_verified ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        <Shield className="h-3 w-3" />
                        {user.email_verified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {formatDate(user.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

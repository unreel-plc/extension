import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const HomePage = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <h1>Welcome {user?.name}</h1>
      <ModeToggle />

      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default HomePage;
// bg-gradient-to-br from-slate-50 to-slate-100
// dark:from-slate-900 dark:to-slate-800

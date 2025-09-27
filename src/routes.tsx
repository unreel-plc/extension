import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "./pages/error-page";
import Layout from "./pages/layout";
import GoogleLoginPage from "./pages/auth/login/google/google-login";
import SearchResults from "./pages/search/SearchResults";
import BookmarkDetail from "./pages/search/BookmarkDetail";
import Downloads from "./pages/downloads/downloads";
import Archive from "./pages/archive/archive";
import ArchiveList from "./pages/archive/archive-list";
import ArchiveDetail from "./pages/archive/archive-detail";
import Dashboard from "./pages/dashboard/dashboard";
import Profile from "./pages/profile/profile";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <GoogleLoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <SearchResults />,
      },
      {
        path: "downloads",
        element: <Downloads />,
      },
      {
        path: "detail/:id",
        element: <BookmarkDetail />,
      },
      {
        path: "archive",
        element: <Archive />,
        children: [
          {
            path: "",
            element: <ArchiveList />,
          },
          {
            path: ":id",
            element: <ArchiveDetail />,
          },
        ],
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;

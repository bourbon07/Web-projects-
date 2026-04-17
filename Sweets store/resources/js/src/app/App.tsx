import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "818339131023-pvfi51gnto0cc4en0tq9t14depdqfnl5.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </GoogleOAuthProvider>
  );
}
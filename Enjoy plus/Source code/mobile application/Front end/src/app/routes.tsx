import { createBrowserRouter, Outlet } from "react-router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FloatingBot } from "./components/FloatingBot";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Cart } from "./pages/Cart";
import { Wishlist } from "./pages/Wishlist";
import { OrderHistory } from "./pages/OrderHistory";
import { ProductPage } from "./pages/ProductPage";
import { PackagePage } from "./pages/PackagePage";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { GuestCheckout } from "./pages/GuestCheckout";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminReviews } from "./pages/admin/AdminReviews";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminPackages } from "./pages/admin/AdminPackages";

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ep-bg)" }}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingBot />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "products/:id", Component: ProductPage },
      { path: "packages/:id", Component: PackagePage },
      { path: "cart", Component: Cart },
      { path: "wishlist", Component: Wishlist },
      { path: "orders", Component: OrderHistory },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
      { path: "checkout/guest", Component: GuestCheckout },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "categories", Component: AdminCategories },
      { path: "packages", Component: AdminPackages },
      { path: "orders", Component: AdminOrders },
      { path: "users", Component: AdminUsers },
      { path: "reviews", Component: AdminReviews },
    ],
  },
]);
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function MainLayout() {
  return (
    <div className="h-full w-full flex flex-col bg-bg-base text-text-primary">
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

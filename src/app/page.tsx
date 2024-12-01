import DndExample from "@/components/DndExample";
import { AppSidebar } from "@/components/SidebarDrag";


export default function Home() {
  return (
      <div className="main_grid">
      <div className="sidebar_left">
        <AppSidebar/>
      </div>
      <div className="main_section">
      <DndExample />
      </div>
    </div>
  )
}
import { useState } from "react";
import { MdOutlineFilterCenterFocus } from "react-icons/md";
import {
  Undo2,
  Rows3,
  Columns3,
  Eye,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Toolbar({ onToolSelect, activeTool, layout, mode, centerLayout }) {
  const tools = [
    // { name: "recenter", icon: Undo2, tooltip: "Recenter" },
    {
      name: "layoutToggle",
      icon: layout === "vertical" ? Columns3 : Rows3,
      tooltip: `Switch to ${layout === "vertical" ? "Horizontal" : "Vertical"} Layout`,
    },
    {
      name: "modeToggle",
      icon: mode === "edit" ? Pencil : Eye,
      tooltip: `Switch to ${mode === "edit" ? "View" : "Edit"} Mode`,
    },
    // {
    //   name: "centerLayout",
    //   icon: MdOutlineFilterCenterFocus,
    //   tooltip: "Center chart",
    // }
  ];

  return (
    <div className="fixed top-30 right-6 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg flex gap-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.name}
            onClick={() => onToolSelect(tool.name)}
            className={cn(
              "p-2 rounded-lg hover:bg-gray-200 transition-all",
              activeTool === tool.name && "bg-gray-300"
            )}
            title={tool.tooltip}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
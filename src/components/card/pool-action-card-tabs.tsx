import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";

import { TABS, type Tab } from "./pool-action-card.types";

interface ActionTabsProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export const ActionTabs = ({ activeTab, onChange }: ActionTabsProps) => {
  return (
    <CardHeader className="mb-3 flex flex-row gap-0 p-0">
      <div className="flex w-full border border-neutral-800 bg-neutral-900">
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab;
          return (
            <Button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={[
                "h-8 flex-1 rounded-none border-0 text-xs font-medium",
                index !== 0 && "border-l border-neutral-800",
                isActive
                  ? "bg-pink-600 text-white hover:bg-pink-600"
                  : "bg-transparent text-neutral-300 hover:bg-neutral-800/80",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {tab}
            </Button>
          );
        })}
      </div>
    </CardHeader>
  );
};

import { NavButton } from "../ui/navbutton";

export function NavMenu({
  open,
  activeTab,
  setTab,
  tabs,
}: {
  open: boolean;
  activeTab: string;
  setTab: (tab: string) => void;
  tabs: [];
}) {
  return (
    <div className="max-w-max border-r h-full px-1">
      {/* {tabs.map((menu) => (
        <NavButton
          key={menu.title}
          open={open}
          Icon={menu.icon}
          label={menu.title}
          isActive={activeTab === menu.title}
          onClick={() => setTab(menu.title)}
        />
      ))} */}
    </div>
  );
}

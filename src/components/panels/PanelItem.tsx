import { cn } from "@/lib/utils";

interface PanelItemProps {
  text: string;
  shortcutKey: string;
  children: React.ReactNode;
  onClick?: () => void;
}
const PanelItem = ({
  text,
  shortcutKey,
  children,
  onClick,
}: PanelItemProps) => {
  return (
    <div
      onClick={() => onClick && onClick()}
      className={cn(
        "flex items-center group w-full hover:bg-gray-100 last:rounded-b-lg"
      )}
    >
      <div className="px-4 py-3 opacity-75 flex items-center justify-center cursor-pointer mx-auto">
        {children}
      </div>
      <div className="p-2 text-sm rounded absolute left-[115%] bg-violet-950 text-white flex items-center gap-1 invisible opacity-0 group-hover:visible group-hover:opacity-100  transition-all">
        <p>{text}</p>
        <div className="text-white rounded font-bold bg-violet-500 text-sm w-4 h-4 flex items-center justify-center">
          {shortcutKey}
        </div>
      </div>
    </div>
  );
};

export default PanelItem;

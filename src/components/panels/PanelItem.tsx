import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PanelItemProps {
  icon: JSX.Element;
  text: string;
  shortcutKey: string;
  type: string;
  onClick?: () => void;
  index: number;
  handleSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const PanelItem = forwardRef<HTMLLabelElement, PanelItemProps>(
  ({ type, icon, text, shortcutKey, onClick, index, handleSelectFile }, selectImageRef ) => {
    return (
      <div
        key={type}
        onClick={() => {
          if (onClick !== undefined) {
            onClick();
          }
        }}
        className={cn(
          "flex items-center group w-full hover:bg-gray-100 last:rounded-b-lg",
          {
            "rounded-t-md": index === 0,
          },
        )}
      >
        <div className="px-4 py-3 opacity-75 flex items-center justify-center cursor-pointer mx-auto">
          {type === "imageNode" ? (
            <>
              <label
                htmlFor="selectImage"
                className="grid place-content-center cursor-pointer "
                ref={selectImageRef}
              >
                {icon}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSelectFile}
                className="hidden"
                id="selectImage"
              />
            </>
          ) : (
            icon
          )}
        </div>
        <div className="p-2 text-sm rounded absolute left-[115%] bg-violet-950 text-white flex items-center gap-1 invisible opacity-0 group-hover:visible group-hover:opacity-100  transition-all">
          <p>{text}</p>
          <div className="text-white rounded font-bold bg-violet-500 w-4 h-4 grid place-items-center">
            {shortcutKey}
          </div>
        </div>
      </div>
    );
  },
);

PanelItem.displayName = "PanelItem";

export default PanelItem;

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@nextui-org/input";
import { SearchIcon } from "lucide-react";

export default function CommunityNavbar() {
  return (
    <div className="fixed flex justify-between w-full h-20 bg-gradient-to-b from-default-100 to-transparent dark:from-[#121212]">
      <div
        className={cn(
          `flex gap-8 h-20 items-center cursor-pointer pl-12 pr-12`,
        )}
      >
        <div className="text-sm font-semibold ">Explore</div>
        <div
          className="text-sm text-muted-foreground font-medium
        hover:text-default-800 transition-all duration-150"
        >
          Notifications
        </div>
        <Input
          isClearable
          radius="lg"
          classNames={{
            label: "text-black/50 dark:text-white/90",
            input: [
              "bg-transparent",
              "text-black/90 dark:text-white/90",
              "placeholder:text-default-700/50 dark:placeholder:text-white/60",
            ],
            innerWrapper: "bg-transparent",
            inputWrapper: [
              "bg-default-200/80 rounded-full",
              "dark:bg-default/30",
              "backdrop-blur-xl",
              "backdrop-saturate-200",
              "hover:bg-default-200/70",
              "dark:hover:bg-default/70",
              "group-data-[focus=true]:bg-default-200/50",
              "dark:group-data-[focus=true]:bg-default/60",
              "!cursor-text",
            ],
          }}
          placeholder="Type to search..."
          startContent={
            <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0 h-4 w-4" />
          }
        />
      </div>
      <div className="flex gap-8 h-20 items-center pr-12">
        <Button
          size="default"
          className="bg-maincolor rounded-full text-white w-32 hover:bg-maincolor/80 hover:text-muted-foreground"
        >
          Publish
        </Button>
      </div>
    </div>
  );
}

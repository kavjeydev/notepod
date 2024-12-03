import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";

export function MagicCardDemo() {
  const { theme } = useTheme();
  return (
    <div
      className={
        "flex h-[500px] w-[100vw] pl-20 pr-20 flex-col gap-4 lg:h-[250px] lg:flex-row"
      }
    >
      <MagicCard
        className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
        gradientColor={theme === "dark" ? "#262626" : "#c6c6c6"}
      >
        Magic
      </MagicCard>
      <MagicCard
        className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
        gradientColor={theme === "dark" ? "#262626" : "#c6c6c6"}
      >
        Card
      </MagicCard>
      <MagicCard
        className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
        gradientColor={theme === "dark" ? "#262626" : "#c6c6c6"}
      >
        Card
      </MagicCard>
    </div>
  );
}

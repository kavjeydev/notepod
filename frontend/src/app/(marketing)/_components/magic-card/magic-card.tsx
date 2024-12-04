import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";

export function MagicCardDemo() {
  const { theme } = useTheme();
  return (
    <div
      className={
        "flex h-[500px] w-[100vw] pl-20 pr-20 flex-col gap-4 lg:h-[350px] lg:flex-row"
      }
    >
      <MagicCard
        className="cursor-pointer flex-col shadow-2xl whitespace-nowrap text-4xl bg-gradient-to-tr
        dark:from-black dark:via-black dark:to-[#131313] from-white via-white to-white"
        gradientColor={theme === "dark" ? "#262626" : "#cccccc"}
      >
        <div
          className="h-[350px] w-full flex p-8 font-spaceg font-semibold
        text-4xl text-maincolor "
        >
          Learn
        </div>
      </MagicCard>
      <MagicCard
        className="cursor-pointer flex-col shadow-2xl whitespace-nowrap text-4xl
        font-spaceg  bg-gradient-to-tr dark:from-black dark:via-black dark:to-[#131313] from-white via-white to-white"
        gradientColor={theme === "dark" ? "#262626" : "#cccccc"}
      >
        <div
          className="h-[350px] w-full flex p-8 font-spaceg font-semibold
        text-4xl text-maincolor"
        >
          Write
        </div>
      </MagicCard>
      <MagicCard
        className="cursor-pointer flex-col shadow-2xl whitespace-nowrap text-4xl bg-gradient-to-tr
        dark:from-black dark:via-black dark:to-[#131313] from-white via-white to-white"
        gradientColor={theme === "dark" ? "#262626" : "#cccccc"}
      >
        <div
          className="h-[350px] w-full flex p-8 font-spaceg font-semibold
        text-4xl text-maincolor"
        >
          Publish
        </div>
      </MagicCard>
    </div>
  );
}

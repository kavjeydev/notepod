import {
  ArrowRight,
  BellRing,
  Book,
  CircleArrowOutUpRight,
  Clock,
  Clock1,
  DollarSign,
  Rocket,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { AISearchMock } from "../mock-ai-search/mock-ai-search";
import { Badge } from "@/components/ui/badge";
import IconCloud from "@/components/ui/icon-cloud";
import { useRouter } from "next/navigation";

const slugs = [
  "typescript",
  "javascript",
  "dart",
  "java",
  "react",
  "flutter",
  "android",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "androidstudio",
  "sonarqube",
  "figma",
];

const notifications = [
  {
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
];

type CardProps = React.ComponentProps<typeof Card>;

const arrowVariants = {
  initial: { x: 0 },
  hover: { x: 5 },
};

export function CardDemo({ className, ...props }: CardProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {/* Card 1 */}
        <Card
          className={cn(
            "w-[380px] dark:bg-lightindark/60 bg-lightinlight rounded-3xl",
            className,
          )}
          {...props}
        >
          <CardHeader>
            <div className="flex gap-2 w-full cursor-pointer">
              <Badge
                className="w-fit h-8 pl-4 pr-4 bg-black dark:bg-white
 text-white dark:text-black"
                onClick={() => {
                  router.push("/documents");
                }}
              >
                <Clock className="w-4 h-4 mr-2 fill-third dark:fill-maincolor text-black dark:text-white" />
                Try it yourself
              </Badge>
              <Badge
                className="w-fit h-8 bg-black dark:bg-white
 text-white dark:text-black"
                onClick={() => {
                  router.push("/documents");
                }}
              >
                <CircleArrowOutUpRight className="h-4 w-4" />
              </Badge>
            </div>
            <CardTitle className="pt-8">Learn</CardTitle>
            <CardDescription>
              Deep dive into new codebases with ease.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="relative">
              <div className="bg-[url('/token.jpg')] w-full h-[8.25rem] bg-center bg-cover bg-no-repeat rounded-lg"></div>
              {/* <AISearchMock /> */}
            </div>
          </CardContent>
          {/* <CardFooter className="relative flex flex-col h-full">
          <motion.button
            className=" text-lighttextactive dark:text-textactive font-spaceg text-md
            dark:hover:text-secondcolor m-2
                     brightness-150 flex items-center bg-black p-4"
            initial="initial"
            whileHover="hover"
          >
            Learn More
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 300 }}
              className="ml-2"
            >
              <ArrowRight />
            </motion.span>
          </motion.button>
        </CardFooter> */}
        </Card>

        {/* Card 2 */}
        <Card
          className={cn(
            "w-[800px] dark:bg-lightindark/60 bg-lightinlight rounded-3xl",
            className,
          )}
          {...props}
        >
          <CardHeader>
            <div className="flex gap-2 w-full ">
              <Badge
                className="w-fit h-8 pl-4 pr-4 bg-black dark:bg-white
 text-white dark:text-black"
              >
                <Rocket className="w-4 h-4 mr-2 fill-third dark:fill-maincolor text-black dark:text-white" />
                AI with Pro
              </Badge>
            </div>
            <CardTitle className="pt-8">Write</CardTitle>
            <CardDescription>
              1M+ context tokens for high quality responses.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="relative">
              <AISearchMock />
            </div>
          </CardContent>
          {/* <CardFooter className="relative flex flex-col h-full">
          <motion.button
            className=" text-lighttextactive dark:text-textactive font-spaceg text-md
            dark:hover:text-secondcolor m-2
                     brightness-150 flex items-center bg-black p-4"
            initial="initial"
            whileHover="hover"
          >
            Learn More
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 300 }}
              className="ml-2"
            >
              <ArrowRight />
            </motion.span>
          </motion.button>
        </CardFooter> */}
        </Card>
      </div>
      <div className="flex gap-4">
        {/* Card 3 */}
        <Card
          className={cn(
            "w-[800px] dark:bg-lightindark/60 bg-lightinlight rounded-3xl",
            className,
          )}
          {...props}
        >
          <CardHeader>
            <div className="flex gap-2 w-full ">
              <Badge
                className="w-fit h-8 pl-4 pr-4 bg-black dark:bg-white
 text-white dark:text-black"
              >
                <Book className="w-4 h-4 mr-2 fill-third dark:fill-maincolor text-black dark:text-white" />
                Share your work
              </Badge>
            </div>
            <CardTitle className="pt-8">Publish</CardTitle>
            <CardDescription>
              Share your projects with the world.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="relative">
              <div className="bg-[url('/book.jpg')] w-full h-[11.9rem] bg-center bg-cover bg-no-repeat rounded-lg"></div>
            </div>
          </CardContent>
          {/* <CardFooter className="relative flex flex-col h-full">
          <motion.button
            className=" text-lighttextactive dark:text-textactive font-spaceg text-md
            dark:hover:text-secondcolor m-2
                     brightness-150 flex items-center bg-black p-4"
            initial="initial"
            whileHover="hover"
          >
            Learn More
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 300 }}
              className="ml-2"
            >
              <ArrowRight />
            </motion.span>
          </motion.button>
        </CardFooter> */}
        </Card>

        {/* Card 4 */}
        <Card
          className={cn(
            "w-[380px] h-96 overflow-hidden dark:bg-lightindark/60 bg-gradient-to-br from-indigo-400/80 to-cyan-400/80\
             rounded-3xl",
            className,
          )}
          {...props}
        >
          <CardHeader>
            <div className="flex gap-2 w-full cursor-pointer">
              <Badge
                className="w-fit h-8 pl-4 pr-4 bg-black dark:bg-white
 text-white dark:text-black"
                onClick={() => {
                  router.push("/pricing");
                }}
              >
                <Zap className="w-4 h-4 mr-2 fill-third dark:fill-maincolor text-black dark:text-white" />
                View Pricing
              </Badge>
              <Badge
                className="w-fit h-8 bg-black dark:bg-white
 text-white dark:text-black"
                onClick={() => {
                  router.push("/pricing");
                }}
              >
                <CircleArrowOutUpRight className="h-4 w-4" />
              </Badge>
            </div>
            <CardTitle className="pt-8">Pro Plan</CardTitle>
            <CardDescription className="text-black dark:text-white">
              Get access to exclusive AI models and more!
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="relative">
              <IconCloud iconSlugs={slugs} />
            </div>
          </CardContent>
          {/* <CardFooter className="relative flex flex-col h-full">
          <motion.button
            className=" text-lighttextactive dark:text-textactive font-spaceg text-md
            dark:hover:text-secondcolor m-2
                     brightness-150 flex items-center bg-black p-4"
            initial="initial"
            whileHover="hover"
          >
            Learn More
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 300 }}
              className="ml-2"
            >
              <ArrowRight />
            </motion.span>
          </motion.button>
        </CardFooter> */}
        </Card>
      </div>
    </div>
  );
}

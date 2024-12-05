import { ArrowRight, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import Image from "next/image";
import { AISearch } from "@/app/(main)/_components/ai-seach-bar/ai-search-bar";
import { AISearchMock } from "../mock-ai-search/mock-ai-search";

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
  return (
    <div className="flex gap-8 ">
      {/* Card 1 */}
      <Card
        className={cn(
          "w-[380px] bg-gradient-to-b from-blue-100 via-white to-white \
          dark:from-lime-900 dark:via-black dark:to-black",
          className,
        )}
        {...props}
      >
        <CardHeader>
          <CardTitle>Learn</CardTitle>
          <CardDescription>
            Deep dive into new codebases with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="relative">
            <AISearchMock />
          </div>
        </CardContent>
        <CardFooter className="relative flex flex-col h-full">
          <motion.button
            className="text-maincolor font-spaceg text-md hover:bg-transparent hover:text-black
            dark:hover:text-secondcolor m-2
                     brightness-150 flex items-center"
            initial="initial"
            whileHover="hover"
          >
            Get Started
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 300 }}
              className="ml-2"
            >
              <ArrowRight />
            </motion.span>
          </motion.button>
        </CardFooter>
      </Card>

      {/* Card 2 */}
      <Card
        className={cn(
          "w-[380px] bg-gradient-to-b from-orange-100 via-white to-white \
          dark:from-orange-900 dark:via-black dark:to-black",
          className,
        )}
        {...props}
      >
        <CardHeader>
          <CardTitle>Write</CardTitle>
          <CardDescription>
            1M+ context tokens for high quality responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <BellRing />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Push Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Send notifications to device.
              </p>
            </div>
            <Switch />
          </div>
          <div>
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <motion.button
            className="text-maincolor font-spaceg text-md hover:bg-transparent hover:text-black
            dark:hover:text-secondcolor m-2
                     brightness-150 flex items-center"
            initial="initial"
            whileHover="hover"
          >
            Get Started
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 300 }}
              className="ml-2"
            >
              <ArrowRight />
            </motion.span>
          </motion.button>
        </CardFooter>
      </Card>

      {/* Card 3 */}
      <Card
        className={cn(
          "w-[380px] h-[42rem] bg-gradient-to-b from-lime-100 via-white to-white \
          dark:from-lime-900 dark:via-black dark:to-black",
          className,
        )}
        {...props}
      >
        <CardHeader>
          <CardTitle>Publish</CardTitle>
          <CardDescription>Share your projects with the world.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <BellRing />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Push Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Send notifications to device.
              </p>
            </div>
            <Switch />
          </div>
          <div>
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <motion.button
            className="text-maincolor font-spaceg text-md hover:bg-transparent hover:text-black
            dark:hover:text-secondcolor
                     brightness-150 flex items-center m-2"
            initial="initial"
            whileHover="hover"
          >
            Get Started
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 300 }}
              className="ml-2"
            >
              <ArrowRight />
            </motion.span>
          </motion.button>
        </CardFooter>
      </Card>
    </div>
  );
}

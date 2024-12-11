// Import necessary modules and components
import React, { useEffect, useState } from "react";
import Marquee from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Define the interface for a single review
interface Review {
  name: string;
  username: string;
  body: string;
  dark_img: string;
  light_img: string;
  height: number;
  width: number;
}

// Define the array of reviews with corrected image paths
const reviews: Review[] = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    dark_img: "/stripe_w.svg",
    light_img: "/stripe_d.svg",
    height: 50,
    width: 70,
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    dark_img: "/reddit_w.svg",
    light_img: "/reddit_d.svg",
    height: 50,
    width: 90,
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    dark_img: "/aws_w.svg",
    light_img: "/aws_d.svg",
    height: 50,
    width: 50,
  },
  {
    name: "Stripe",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    dark_img: "/paypal_w.svg",
    light_img: "/paypal_d.svg",
    height: 50,
    width: 90,
  },
  {
    name: "Azure",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    dark_img: "/github_w.svg",
    light_img: "/github_d.svg",
    height: 10,
    width: 76,
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    dark_img: "/netflix_w.svg",
    light_img: "/netflix_d.svg",
    height: 10,
    width: 80,
  },
];

// Split the reviews into two rows for the marquee effect
const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

// Define the props interface for ReviewCard component
interface ReviewCardProps {
  name: string;
  username: string;
  body: string;
  dark_img: string;
  light_img: string;
  height: number;
  width: number;
}

// ReviewCard Component
const ReviewCard: React.FC<ReviewCardProps> = ({
  name,
  username,
  body,
  dark_img,
  light_img,
  height,
  width,
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted before accessing the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent rendering until the component is mounted to avoid theme mismatch
  if (!mounted) return null;

  return (
    <figure
      className={cn(
        "flex items-center justify-center relative w-36 cursor-pointer overflow-hidden rounded-xl",
        // Light mode styles
        "border-white bg-lightlightbg hover:bg-lightlightbg",
        // Dark mode styles
        "dark:border-gray-50/[.1] dark:bg-darkdarkbg dark:hover:bg-darkdarkbg",
      )}
    >
      <div className="flex flex-row items-center gap-0">
        {resolvedTheme === "dark" ? (
          <img
            className="object-contain h-24"
            width={width}
            height={height}
            alt={`${name} logo`}
            src={dark_img}
          />
        ) : (
          <img
            className="object-contain h-24"
            width={width}
            height={height}
            alt={`${name} logo`}
            src={light_img}
          />
        )}
      </div>
    </figure>
  );
};

// MarqueeDemo Component
export const MarqueeDemo: React.FC = () => {
  return (
    <div className="relative ml-0 flex h-[150px] w-full flex-col items-center justify-center overflow-hidden rounded-lg z-[8]">
      {/* First Marquee Row */}
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>

      {/* Second Marquee Row (Reversed) */}
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>

      {/* Gradient Overlays for Left and Right */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-lightlightbg dark:from-darkdarkbg"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-lightlightbg dark:from-darkdarkbg"></div>
    </div>
  );
};

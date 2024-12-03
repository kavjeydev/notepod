import Marquee from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

//3d3d3d
//464646
const reviews = [
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
    dark_img: "paypal_w.svg",
    light_img: "paypal_d.svg",
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
    dark_img: "netflix_w.svg",
    light_img: "netflix_d.svg",
    height: 10,
    width: 80,
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  name,
  username,
  body,
  dark_img,
  light_img,
  height,
  width,
}: {
  dark_img: string;
  light_img: string;
  name: string;
  username: string;
  body: string;
  height: number;
  width: number;
}) => {
  const { theme } = useTheme();
  return (
    <figure
      className={cn(
        " flex items-center justify-center relative w-36 cursor-pointer overflow-hidden rounded-xl",
        // light styles
        "border-white bg-white hover:bg-white",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-black dark:hover:bg-black",
      )}
    >
      <div className="flex flex-row items-center gap-0 ">
        {theme == "dark" ? (
          <img
            className="contain h-24"
            width={width}
            height={height}
            alt=""
            src={dark_img}
          />
        ) : (
          <img
            className="contain h-24"
            width={width}
            height={height}
            alt=""
            src={light_img}
          />
        )}

        {/* <h1 className="font-bold">{name}</h1> */}
      </div>
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div
      className="relative ml-0 flex h-[150px] w-full flex-col items-center justify-center overflow-hidden
    rounded-lg z-[8]"
    >
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-black"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-black"></div>
    </div>
  );
}

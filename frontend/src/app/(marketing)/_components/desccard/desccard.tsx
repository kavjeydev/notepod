import { Card, CardFooter, Button } from "@nextui-org/react";
import styles from "./desccard.module.css";

export default function DescCard() {
  return (
    <div className={styles.outer_container}>
      <Card
        isFooterBlurred
        radius="lg"
        className="border-none h-[400px] w-[400px]"
      >
        <img
          alt="Woman listing to music"
          className="object-cover h-[400px] w-[400px]"
          src="https://nextui.org/images/hero-card.jpeg"
        />
        <CardFooter className="justify-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10  h-[45px]">
          <p className="text-tiny text-white/80">Available Now.</p>
        </CardFooter>
      </Card>
      <Card isFooterBlurred radius="lg" className="border-none">
        <img
          alt="Woman listing to music"
          className="object-cover h-[400px] w-[400px]"
          src="https://nextui.org/images/hero-card.jpeg"
        />
        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          <p className="text-tiny text-white/80">Available soon.</p>
          <Button
            className="text-tiny text-white bg-black/20"
            variant="flat"
            color="default"
            radius="lg"
            size="sm"
          >
            Notify me
          </Button>
        </CardFooter>
      </Card>
      <Card isFooterBlurred radius="lg" className="border-none">
        <img
          alt="Woman listing to music"
          className="object-cover h-[400px] w-[400px]"
          src="https://nextui.org/images/hero-card.jpeg"
        />
        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          <p className="text-tiny text-white/80">Available soon.</p>
          <Button
            className="text-tiny text-white bg-black/20"
            variant="flat"
            color="default"
            radius="lg"
            size="sm"
          >
            Notify me
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

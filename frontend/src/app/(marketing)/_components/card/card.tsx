import {Card, CardHeader, CardBody, CardFooter, Image, Button} from "@nextui-org/react";

export default function App() {
  return (
    <div className="max-w-[900px] gap-2 grid grid-cols-12 grid-rows-2 px-8">
    <Card className="col-span-12 sm:col-span-4 h-[300px]">
      <CardHeader className="absolute z-10 top-1 flex-col !items-start">
        <p className="text-tiny text-white/60 uppercase font-bold">Get Started</p>
        <h4 className="text-white font-medium text-large">Stream the Acme event</h4>
      </CardHeader>
      <Image
        removeWrapper
        alt="Card background"
        className="z-0 w-full h-full object-cover"
        src="https://nextui.org/images/card-example-4.jpeg"
      />
    </Card>
    <Card className="col-span-12 sm:col-span-4 h-[300px]">
      <CardHeader className="absolute z-10 top-1 flex-col !items-start">
        <p className="text-tiny text-white/60 uppercase font-bold">Plant a tree</p>
        <h4 className="text-white font-medium text-large">Contribute to the planet</h4>
      </CardHeader>
      <Image
        removeWrapper
        alt="Card background"
        className="z-0 w-full h-full object-cover"
        src="https://nextui.org/images/card-example-3.jpeg"
      />
    </Card>
    <Card className="col-span-12 sm:col-span-4 h-[300px]">
      <CardHeader className="absolute z-10 top-1 flex-col !items-start">
        <p className="text-tiny text-white/60 uppercase font-bold">Supercharged</p>
        <h4 className="text-white font-medium text-medium">Your personal engineer</h4>
      </CardHeader>
      <Image
        removeWrapper
        alt="Card background"
        className="z-0 w-full h-full object-cover"
        src="https://nextui.org/images/card-example-2.jpeg"
      />
    </Card>
    <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-5">
      <CardHeader className="absolute z-10 top-1 flex-col items-start">
        <p className="text-tiny text-white/60 uppercase font-bold">New</p>
        <h4 className="text-white font-medium text-xl">Diagrams</h4>
      </CardHeader>
      <Image
        removeWrapper
        alt="Card example background"
        className="z-0 w-full h-full scale-150 -translate-y-6 object-cover"
        src="https://www.dropbox.com/scl/fi/s0ajxwo3uodqww8bnp8pz/6461c0ba600af0cbd0144c75_diagram-gpt-thumbnail.png?rlkey=lywkwyb4i5sgwmyly9n67hafh&st=ltqme95w&raw=1"
      />
      <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
        <div>
          <p className="text-black text-tiny">Diagram AI.</p>
          <p className="text-black text-tiny">Available Now.</p>
        </div>
        <Button className="text-tiny" color="primary" radius="full" size="sm">
          View Pricing
        </Button>
      </CardFooter>
    </Card>
    <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-7">
      <CardHeader className="absolute z-10 top-1 flex-col items-start">
        <p className="text-tiny text-white/60 uppercase font-bold">New</p>
        <h4 className="text-white/90 font-medium text-xl">o1-preview</h4>
      </CardHeader>
      <Image
        removeWrapper
        alt="Relaxing app background"
        className="z-0 w-full h-full object-cover"
        src="https://www.dropbox.com/scl/fi/be3awtn3hqqnh008v25dp/o1-research.png?rlkey=8ft37pd6w0m35r3giehk5h0cc&st=4nc92o5a&raw=1"
      />
      <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
        <div className="flex flex-grow gap-2 items-center">
          <Image
            alt="Breathing app icon"
            className="rounded-full w-10 h-11 bg-black"
            src="https://www.dropbox.com/scl/fi/a6e21y40dyk2ys9vizu1k/2a62c34e0d217a7aa14645ce114d84b3.jpg?rlkey=eklp60mjo96z66mu2439y294n&st=2k4cbrxv&raw=1"
          />
          <div className="flex flex-col">
            <p className="text-tiny text-white/60">Available soon.
            </p>
            <p className="text-tiny text-white/60">Supercharge your technical writing.</p>
          </div>
        </div>
        <Button radius="full" size="sm">Notify Me</Button>
      </CardFooter>
    </Card>
  </div>
  );
}
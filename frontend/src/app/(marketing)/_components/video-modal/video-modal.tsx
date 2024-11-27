import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { ArrowRight } from "lucide-react";

export default function VideoModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        onPress={onOpen}
        className="text-text-color bg-bgcolor min-w-[150px] z-[9]"
        size="lg"
        radius="full"
        variant="ghost"
      >
        Watch a demo <span className="mt-[3px]">▶</span>
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="!fixed z-[999999]" // Set z-index higher than navbar
        backdrop="blur"
        size="5xl"
      >
        <ModalContent className="!relative z-[9999999]">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Notepod Demo
              </ModalHeader>
              <ModalBody>
                <video width="1750" height="1500" controls>
                  <source src="/notepod_demo.mp4" type="video/mp4" />
                </video>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

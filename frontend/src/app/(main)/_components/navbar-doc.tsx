"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Divide, MenuIcon } from "lucide-react";
import Title from "./title";
import Banner from "./banner";
import Menu from "./menu";
import Publish from "./publish";
import { SetGithubRepo } from "./set-github-repo";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { createPortal } from "react-dom";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import GitHubRepos from "./repo-list/repo-list";
import { Separator } from "@/components/ui/separator";
import IconPicker from "@/components/icon-picker";
import Toolbar from "@/components/toolbar";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export default function NavbarDoc({ isCollapsed, onResetWidth }: NavbarProps) {
  const params = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const document = useQuery(api.documents.getById, {
    documentId: params.documentId as Id<"documents">,
  });

  if (document === undefined) {
    return (
      <nav className="bg-background dark:bg-darkbg px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (document === null) {
    return null;
  }

  return (
    <div className="z-10 overscroll-contain">
      <nav className="bg-lightlightbg dark:bg-darkbg px-3 py-2 w-full flex items-center gap-x-4 border-b-1 border-default-300">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}

        <div className="flex items-center justify-between w-full">
          <div className="flex">
            <Toolbar initialData={document} />
            <Title initialData={document} />
          </div>

          <div className="flex items-center gap-x-2">
            <div
              className="flex gap-2 items-center smr-4 text-sm font-bold border border-muted-foreground
             pt-1 pb-1 pl-3 pr-3 rounded-full cursor-pointer bg-white dark:bg-black"
              onClick={() => {
                onOpen();
                // open modal that lets you change repo
              }}
            >
              <GitHubLogoIcon />
              {document.publishedUserName}&nbsp;/&nbsp;
              {
                document.githubRepo
                  ?.split("/")
                  [document.githubRepo?.split("/").length - 1].split(".")[0]
              }
            </div>
            <Publish initialData={document} />
            <Menu documentId={document._id} />
          </div>
        </div>
      </nav>
      {document.isArchived && <Banner documentId={document._id} />}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="fixed z-[1000000]"
        backdrop="opaque"
      >
        <ModalContent className="z-[1000001]">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Select Repository
              </ModalHeader>
              <ModalBody>
                <SetGithubRepo
                  params={{
                    documentId: document._id,
                  }}
                />
                <Separator orientation="horizontal" className="mb-4" />
                <GitHubRepos
                  params={{
                    documentId: document._id,
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

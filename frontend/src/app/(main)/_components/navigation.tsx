"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronsLeft,
  House,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
  UserIcon,
  Users,
} from "lucide-react";
import { Truculenta } from "next/font/google";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import UserItem from "./user-item";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Item } from "./item";
import { toast } from "sonner";
import { DocumentList } from "./document-list";
import { useSearch } from "../../../../hooks/use-search";
import {
  PopoverContent,
  Popover,
  PopoverTrigger,
} from "@/components/ui/popover";
import TrashBox from "./trash-box";
import { DragProvider } from "./drag-context";
import { useSettings } from "../../../../hooks/use-settings";
import NavbarDoc from "./navbar-doc";
import { AppSidebar } from "./app-sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Navigation() {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const search = useSearch();
  const createFile = useMutation(api.documents.createFile);
  const settings = useSettings();
  const createFolder = useMutation(api.documents.createFolder);

  const router = useRouter();
  const params = useParams();

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) {
      return;
    }
    let newWidth = e.clientX;

    if (newWidth < 240) {
      newWidth = 240;
    }
    if (newWidth > 480) {
      newWidth = 480;
    }

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`,
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0px" : "calc(100% - 240px)",
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleCreateFile = () => {
    const promise = createFile({ title: "untitled" });

    toast.promise(promise, {
      loading: "Creating a new Pod...",
      success: "New Pod created!",
      error: "Failed to create new Pod",
    });
  };

  const handleCreateFolder = () => {
    const promise = createFolder({ title: "untitled" });

    toast.promise(promise, {
      loading: "Creating a new Pod...",
      success: "New Pod created!",
      error: "Failed to create new Pod",
    });
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "relative group/sidebar h-[100vh] bg-[#FFFFFF] dark:bg-black overflow-y-auto flex w-60 flex-col z-[9] border-r-1",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0",
        )}
      >
        <div
          role="button"
          onClick={collapse}
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-small hover:bg-neutral-300",
            "dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100",
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div>
          <UserItem />
          <Item
            onClick={() => {
              router.push("/");
            }}
            label="Home"
            icon={House}
            height={16}
            width={16}
            id_str={""}
          />
          <Item
            onClick={() => {
              window.open("/community", "_blank");
            }}
            label="Community"
            icon={Users}
            height={16}
            width={16}
            id_str={""}
          />
          <br />
          <Item
            onClick={search.onOpen}
            label="Search"
            icon={Search}
            isSearch
            height={16}
            width={16}
            id_str={""}
          />
          <Item
            onClick={settings.onOpen}
            label="Settings"
            icon={Settings}
            height={16}
            width={16}
            id_str={""}
          />
          <Item
            onClick={handleCreateFile}
            label="New Pod"
            icon={PlusCircle}
            height={16}
            width={16}
            id_str={""}
          />

          <Item
            onClick={handleCreateFolder}
            label="New Folder"
            icon={PlusCircle}
            height={16}
            width={16}
            id_str={""}
          />
        </div>
        <div className="flex flex-col mt-4 h-[calc(100%-300px)] overflow-y-scroll hover:scrollbar-default [&::-webkit-scrollbar-thumb]:bg-default-300 dark:[&::-webkit-scrollbar-thumb]:bg-default-200">
          <div className="flex flex-col h-[100%]">
            <DragProvider>
              <DocumentList />
            </DragProvider>
          </div>

          <div className="absolute dark:bg-[#090909] bg-white bottom-0 w-full h-[125px] pb-2 border-t-1 dark:border-default-300 border-default-300 pt-2 z-[99999]">
            <Item
              onClick={handleCreateFile}
              icon={Plus}
              label="Add a Pod"
              height={16}
              width={16}
              id_str={""}
            />
            <Item
              onClick={handleCreateFolder}
              label="Add a Folder"
              icon={Plus}
              height={16}
              width={16}
              id_str={""}
            />
            <Popover>
              <PopoverTrigger className="w-full mt-4">
                <Item
                  label="Trash"
                  icon={Trash}
                  height={16}
                  width={16}
                  id_str={""}
                />
              </PopoverTrigger>
              <PopoverContent
                side={isMobile ? "bottom" : "right"}
                className="p-0 w-72"
              >
                <TrashBox />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div
          onMouseDown={(event) => {
            handleMouseDown(event);
          }}
          onClick={() => {
            resetWidth();
          }}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full",
        )}
      >
        {!!params.documentId ? (
          <NavbarDoc isCollapsed={isCollapsed} onResetWidth={resetWidth} />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                onClick={resetWidth}
                role="button"
                className="h-6 w-6 text-muted-foreground"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
}

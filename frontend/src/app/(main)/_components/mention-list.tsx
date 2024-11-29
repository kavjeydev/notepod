// // MentionList.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { SuggestionProps } from "@tiptap/suggestion";
// import { MentionableItem } from "./ai-seach-bar/ai-search-bar";

// interface MentionListProps {
//   items: MentionableItem[];
//   command: (item: MentionableItem) => void;
// }

// const MentionList: React.FC<MentionListProps> = ({ items, command }) => {
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   const selectItem = (index: number) => {
//     const item = items[index];
//     if (item) {
//       command(item);
//     }
//   };

//   const onKeyDown = (event: KeyboardEvent) => {
//     if (event.key === "ArrowDown") {
//       setSelectedIndex((prevIndex) =>
//         prevIndex + 1 < items.length ? prevIndex + 1 : 0,
//       );
//       event.preventDefault();
//     } else if (event.key === "ArrowUp") {
//       setSelectedIndex((prevIndex) =>
//         prevIndex - 1 >= 0 ? prevIndex - 1 : items.length - 1,
//       );
//       event.preventDefault();
//     } else if (event.key === "Enter") {
//       selectItem(selectedIndex);
//       event.preventDefault();
//     }
//   };

//   useEffect(() => {
//     const container = containerRef.current;
//     if (container) {
//       container.addEventListener("keydown", onKeyDown);

//       return () => {
//         container.removeEventListener("keydown", onKeyDown);
//       };
//     }
//   }, [selectedIndex, items]);

//   return (
//     <div
//       className="mention-list absolute z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-md mt-2"
//       ref={containerRef}
//     >
//       {items.map((item, index) => (
//         <div
//           key={item.id}
//           className={`p-2 cursor-pointer ${
//             index === selectedIndex ? "bg-gray-200 dark:bg-gray-700" : ""
//           }`}
//           onClick={() => selectItem(index)}
//           onMouseEnter={() => setSelectedIndex(index)}
//         >
//           {item.name}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default MentionList;

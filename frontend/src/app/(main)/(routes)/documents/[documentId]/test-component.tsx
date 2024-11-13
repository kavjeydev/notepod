// // ReactComponentExtension.ts
// import { Node, Command } from "@tiptap/core";
// import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
// import React from "react";

// export const MyComponent = () => {
//   return (
//     <NodeViewWrapper>
//       <div style={{ padding: "10px", backgroundColor: "#f0f0f0" }}>
//         Hello from MyComponent!
//       </div>
//     </NodeViewWrapper>
//   );
// };

// declare module "@tiptap/core" {
//   interface Commands<ReturnType> {
//     reactComponent: {
//       insertReactComponent: () => ReturnType;
//     };
//   }
// }

// const ReactComponentExtension = Node.create({
//   name: "reactComponent",
//   group: "block", // Use 'inline' if you want it inline with text
//   atom: true, // Treat it as an atomic node (no content within)

//   addAttributes() {
//     return {
//       // Define any attributes your component might need
//     };
//   },

//   parseHTML() {
//     return [
//       {
//         tag: 'div[data-type="reactComponent"]',
//       },
//     ];
//   },

//   renderHTML({ HTMLAttributes }) {
//     return ["div", { "data-type": "reactComponent", ...HTMLAttributes }];
//   },

//   addCommands() {
//     return {
//       insertReactComponent:
//         () =>
//         ({ chain }: any) => {
//           return chain()
//             .insertContent({
//               type: this.name,
//               attrs: {}, // Add any attributes here
//             })
//             .run();
//         },
//     };
//   },

//   addNodeView() {
//     return ReactNodeViewRenderer(MyComponent);
//   },
// });

// export default ReactComponentExtension;

import React from "react";
import { buildTextFileTree } from "./utils";

interface ModifiedFilesTreeProps {
  modifiedFiles: string[];
}

export function ModifiedFilesTree({ modifiedFiles }: ModifiedFilesTreeProps) {
  const textFileTree = buildTextFileTree(modifiedFiles);

  return (
    <div
      className="h-[150px] mt-1 border rounded-md p-2 overflow-y-auto text-xs"
      style={{ whiteSpace: "pre-wrap" }}
    >
      {textFileTree.map((item, index) => (
        <div
          key={index}
          style={{
            color: item.isFile ? "inherit" : "gray",
            paddingLeft: `${item.depth * 16}px`,
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}

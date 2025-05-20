import { useQuery } from "@tanstack/react-query";

interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

const fetchFileTree = async (): Promise<{ files: FileTreeNode[] }> => {
  const response = await fetch("/api/files/tree");
  if (!response.ok) {
    throw new Error("Failed to fetch file tree");
  }
  return response.json();
};

// Convert the file tree to our folder tree format
const convertToFileTree = (
  nodes: FileTreeNode[],
  parentKey = "",
): FolderNode[] => {
  return nodes
    .filter((node) => node.type === "directory")
    .map((node) => ({
      key: node.path,
      name: node.name,
      children: node.children
        ? convertToFileTree(node.children, node.path)
        : [],
      isExpanded: false,
    }));
};

interface FolderNode {
  key: string;
  name: string;
  children: FolderNode[];
  isExpanded: boolean;
}

export const useFileTreeQuery = () => {
  return useQuery({
    queryKey: ["fileTree"],
    queryFn: async () => {
      const data = await fetchFileTree();
      const rootNode: FolderNode = {
        key: "",
        name: "Root",
        children: convertToFileTree(data.files || []),
        isExpanded: true,
      };
      return rootNode;
    },
  });
};

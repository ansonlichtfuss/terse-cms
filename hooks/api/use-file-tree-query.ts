import { createQueryHook, queryKeys, ApiClient } from './shared';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

// Convert the file tree to our folder tree format
const convertToFileTree = (nodes: FileTreeNode[], _parentKey = ''): FolderNode[] => {
  return nodes
    .filter((node) => node.type === 'directory')
    .map((node) => ({
      key: node.path,
      name: node.name,
      children: node.children ? convertToFileTree(node.children, node.path) : [],
      isExpanded: false
    }));
};

interface FolderNode {
  key: string;
  name: string;
  children: FolderNode[];
  isExpanded: boolean;
}

export const useFileTreeQuery = createQueryHook(
  queryKeys.fileTree,
  async (client: ApiClient) => {
    const data = await client.get<{ files: FileTreeNode[] }>('/api/files/tree');
    const rootNode: FolderNode = {
      key: '',
      name: 'Root',
      children: convertToFileTree(data.files || []),
      isExpanded: true
    };
    return rootNode;
  }
);

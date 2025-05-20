export const buildTextFileTree = (
  paths: string[],
): Array<{ text: string; isFile: boolean; depth: number }> => {
  const tree: { [key: string]: any } = {};

  paths.forEach((path) => {
    const parts = path.split("/");
    let currentNode = tree;

    parts.forEach((part, index) => {
      if (!currentNode[part]) {
        currentNode[part] = { _is_file: index === parts.length - 1 };
      }
      currentNode = currentNode[part];
    });
  });

  const formatTree = (
    node: any,
    depth: number = 0,
  ): Array<{ text: string; isFile: boolean; depth: number }> => {
    const result: Array<{ text: string; isFile: boolean; depth: number }> = [];
    const keys = Object.keys(node)
      .filter((key) => key !== "_is_file")
      .sort();

    keys.forEach((key) => {
      const isFile = node[key]._is_file;
      const displayedName = isFile ? key : `/${key}`; // Prepend slash for folders

      result.push({ text: displayedName, isFile: isFile, depth: depth }); // Include depth

      if (
        !isFile &&
        Object.keys(node[key]).filter((k) => k !== "_is_file").length > 0
      ) {
        result.push(...formatTree(node[key], depth + 1)); // Increase depth for children
      }
    });

    return result;
  };

  return formatTree(tree); // Start with depth 0
};

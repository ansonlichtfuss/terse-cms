# Report: Opportunities for Tanstack Query Integration

This report identifies areas within the codebase where integrating Tanstack Query could improve data fetching, caching, and state management.

**Identified Opportunities:**

1.  **[`components/git/GitBranchDisplay.tsx`](components/git/GitBranchDisplay.tsx)**
    *   **Opportunity:** The component fetches git branches and handles switching branches. `useQuery` could manage fetching the branch list, providing caching and background updates. Mutations (`useMutation`) could handle the branch switching operation, managing loading and error states.

2.  **[`components/image-item.tsx`](components/image-item.tsx)**
    *   **Opportunity:** Generating alt text for images involves an asynchronous operation. `useMutation` could be used to handle the alt text generation request, managing the loading and success states.

3.  **[`components/move-file-dialog.tsx`](components/move-file-dialog.tsx)**
    *   **Opportunity:** Fetching the file tree structure for the move dialog is a data fetching task. `useQuery` could manage fetching and caching the file tree data.

4.  **[`components/git-history-sidebar.tsx`](components/git-history-sidebar.tsx)**
    *   **Opportunity:** Fetching git history for a specific file is a data fetching operation. `useQuery` could be used to fetch and cache the history based on the file path.

5.  **[`components/dashboard.tsx`](components/dashboard.tsx)**
    *   **Opportunity:** This component handles git commit and revert operations, and potentially fetching file content. `useMutation` can manage the commit and revert processes. If file content is fetched here, `useQuery` would be suitable.

6.  **[`context/GitStatusContext.tsx`](context/GitStatusContext.tsx)**
    *   **Opportunity:** Fetching the git status is a core data fetching task for the application's state. `useQuery` is an excellent fit for managing the git status, providing caching and allowing components to subscribe to status updates.

7.  **[`app/edit/[...path]/page.tsx`](app/edit/[...path]/page.tsx)**
    *   **Opportunity:** Fetching and saving file content are key operations on this page. `useQuery` can manage fetching the file content, and `useMutation` can handle saving the file content.

8.  **[`components/file-browser/FileBrowser.tsx`](components/file-browser/FileBrowser.tsx) and related hooks (`useFileFetching.ts`, `useFileOperations.ts`)**
    *   **Opportunity:** The file browser heavily relies on fetching directory contents and performing file operations. `useQuery` can manage fetching directory listings, and `useMutation` can handle file operations like creating, renaming, moving, and deleting files.

9.  **[`components/media-manager.tsx`](components/media-manager.tsx)**
    *   **Opportunity:** Managing media assets likely involves fetching a list of assets and handling uploads/deletions. `useQuery` can fetch the list of media assets, and `useMutation` can handle upload and delete operations.

**General Opportunities:**

*   **Replacing `useEffect` for Data Fetching:** Many instances of `useEffect` are likely used to trigger data fetching. These can be replaced with `useQuery` or `useMutation`, simplifying component logic and leveraging Tanstack Query's features.
*   **Centralized State Management for Async Data:** Tanstack Query can act as a centralized store for asynchronous data, replacing scattered state management logic (`useState`, `useReducer`) related to loading, error, and data states.
*   **Improved Caching and Performance:** Tanstack Query's built-in caching mechanisms can significantly improve application performance by reducing unnecessary network requests.
*   **Simplified Error Handling and Loading States:** Tanstack Query provides standardized ways to handle loading and error states, making the UI more consistent and easier to develop.

This report provides a starting point for integrating Tanstack Query. Each identified opportunity would require a more detailed analysis to determine the best approach for refactoring.
export function getMarkdownRootDir(): string {
  const USE_MOCK_API = process.env.USE_MOCK_API === 'true';
  const MOCK_ROOT_DIR = 'mock-data/filesystem';
  const MARKDOWN_ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || '/';

  return USE_MOCK_API ? MOCK_ROOT_DIR : MARKDOWN_ROOT_DIR;
}

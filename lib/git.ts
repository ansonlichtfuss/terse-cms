import simpleGit, { SimpleGitOptions } from 'simple-git';

import { getMarkdownRootDir } from './paths';

const options: Partial<SimpleGitOptions> = {
  baseDir: getMarkdownRootDir()
};

export function getGitInstance() {
  return simpleGit(options);
}

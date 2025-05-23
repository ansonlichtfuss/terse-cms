import matter from 'gray-matter';
import { useEffect, useState } from 'react';

export function useFrontMatter(content: string) {
  const [frontMatter, setFrontMatter] = useState<any>({});

  useEffect(() => {
    try {
      const { data } = matter(content);
      setFrontMatter(data || {});
    } catch (error) {
      console.error('Error parsing front matter:', error);
      setFrontMatter({});
    }
  }, [content]);

  return frontMatter;
}

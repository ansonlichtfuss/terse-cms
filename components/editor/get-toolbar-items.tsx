import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo
} from 'lucide-react';

import type { EditorToolbarGroup } from '@/types';

export function getToolbarItems(onImageClick: () => void): EditorToolbarGroup[] {
  return [
    {
      group: 'headings',
      items: [
        {
          icon: <Heading1 className="h-4 w-4" />,
          action: 'heading',
          value: '# ',
          tooltip: 'Heading 1'
        },
        {
          icon: <Heading2 className="h-4 w-4" />,
          action: 'heading',
          value: '## ',
          tooltip: 'Heading 2'
        },
        {
          icon: <Heading3 className="h-4 w-4" />,
          action: 'heading',
          value: '### ',
          tooltip: 'Heading 3'
        }
      ]
    },
    {
      group: 'formatting',
      items: [
        { icon: <Bold className="h-4 w-4" />, action: 'bold', tooltip: 'Bold' },
        {
          icon: <Italic className="h-4 w-4" />,
          action: 'italic',
          tooltip: 'Italic'
        }
      ]
    },
    {
      group: 'lists',
      items: [
        {
          icon: <List className="h-4 w-4" />,
          action: 'list',
          tooltip: 'Bullet List'
        },
        {
          icon: <ListOrdered className="h-4 w-4" />,
          action: 'ordered-list',
          tooltip: 'Numbered List'
        }
      ]
    },
    {
      group: 'elements',
      items: [
        {
          icon: <Link className="h-4 w-4" />,
          action: 'link',
          tooltip: 'Insert Link'
        },
        {
          icon: <ImageIcon className="h-4 w-4" />,
          action: 'image',
          tooltip: 'Insert Image',
          onClick: onImageClick
        },
        {
          icon: <Code className="h-4 w-4" />,
          action: 'code',
          tooltip: 'Code Block'
        },
        {
          icon: <Quote className="h-4 w-4" />,
          action: 'quote',
          tooltip: 'Blockquote'
        }
      ]
    },
    {
      group: 'history',
      items: [
        { icon: <Undo className="h-4 w-4" />, action: 'undo', tooltip: 'Undo' },
        { icon: <Redo className="h-4 w-4" />, action: 'redo', tooltip: 'Redo' }
      ]
    }
  ];
}

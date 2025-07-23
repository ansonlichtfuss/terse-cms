import { describe, expect, it, vi } from 'vitest';

import { getToolbarItems } from '../get-toolbar-items';

describe('getToolbarItems', () => {
  const mockOnImageClick = vi.fn();

  it('returns all toolbar groups in correct order', () => {
    const items = getToolbarItems(mockOnImageClick);

    expect(items).toHaveLength(5);
    expect(items[0].group).toBe('headings');
    expect(items[1].group).toBe('formatting');
    expect(items[2].group).toBe('lists');
    expect(items[3].group).toBe('elements');
    expect(items[4].group).toBe('history');
  });

  it('returns correct heading items', () => {
    const items = getToolbarItems(mockOnImageClick);
    const headingGroup = items[0];

    expect(headingGroup.items).toHaveLength(3);
    expect(headingGroup.items[0]).toMatchObject({
      action: 'heading',
      value: '# ',
      tooltip: 'Heading 1'
    });
    expect(headingGroup.items[1]).toMatchObject({
      action: 'heading',
      value: '## ',
      tooltip: 'Heading 2'
    });
    expect(headingGroup.items[2]).toMatchObject({
      action: 'heading',
      value: '### ',
      tooltip: 'Heading 3'
    });
  });

  it('returns correct formatting items', () => {
    const items = getToolbarItems(mockOnImageClick);
    const formattingGroup = items[1];

    expect(formattingGroup.items).toHaveLength(2);
    expect(formattingGroup.items[0]).toMatchObject({
      action: 'bold',
      tooltip: 'Bold'
    });
    expect(formattingGroup.items[1]).toMatchObject({
      action: 'italic',
      tooltip: 'Italic'
    });
  });

  it('returns correct list items', () => {
    const items = getToolbarItems(mockOnImageClick);
    const listsGroup = items[2];

    expect(listsGroup.items).toHaveLength(2);
    expect(listsGroup.items[0]).toMatchObject({
      action: 'list',
      tooltip: 'Bullet List'
    });
    expect(listsGroup.items[1]).toMatchObject({
      action: 'ordered-list',
      tooltip: 'Numbered List'
    });
  });

  it('returns correct element items with image click handler', () => {
    const items = getToolbarItems(mockOnImageClick);
    const elementsGroup = items[3];

    expect(elementsGroup.items).toHaveLength(4);
    expect(elementsGroup.items[0]).toMatchObject({
      action: 'link',
      tooltip: 'Insert Link'
    });
    expect(elementsGroup.items[1]).toMatchObject({
      action: 'image',
      tooltip: 'Insert Image',
      onClick: mockOnImageClick
    });
    expect(elementsGroup.items[2]).toMatchObject({
      action: 'code',
      tooltip: 'Code Block'
    });
    expect(elementsGroup.items[3]).toMatchObject({
      action: 'quote',
      tooltip: 'Blockquote'
    });
  });

  it('returns correct history items', () => {
    const items = getToolbarItems(mockOnImageClick);
    const historyGroup = items[4];

    expect(historyGroup.items).toHaveLength(2);
    expect(historyGroup.items[0]).toMatchObject({
      action: 'undo',
      tooltip: 'Undo'
    });
    expect(historyGroup.items[1]).toMatchObject({
      action: 'redo',
      tooltip: 'Redo'
    });
  });

  it('includes React icons for all items', () => {
    const items = getToolbarItems(mockOnImageClick);

    items.forEach((group) => {
      group.items.forEach((item) => {
        expect(item.icon).toBeDefined();
        expect(typeof item.icon).toBe('object'); // React element
      });
    });
  });

  it('does not include value property for items that do not need it', () => {
    const items = getToolbarItems(mockOnImageClick);

    // Check formatting items (bold, italic) don't have values
    const formattingGroup = items[1];
    formattingGroup.items.forEach((item) => {
      expect(item.value).toBeUndefined();
    });

    // Check list items don't have values
    const listsGroup = items[2];
    listsGroup.items.forEach((item) => {
      expect(item.value).toBeUndefined();
    });
  });

  it('passes image click handler correctly', () => {
    const customOnImageClick = vi.fn();
    const items = getToolbarItems(customOnImageClick);

    const elementsGroup = items[3];
    const imageItem = elementsGroup.items.find((item) => item.action === 'image');

    expect(imageItem?.onClick).toBe(customOnImageClick);
  });

  it('maintains consistent item structure', () => {
    const items = getToolbarItems(mockOnImageClick);

    items.forEach((group) => {
      expect(group).toHaveProperty('group');
      expect(group).toHaveProperty('items');
      expect(Array.isArray(group.items)).toBe(true);

      group.items.forEach((item) => {
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('action');
        expect(item).toHaveProperty('tooltip');

        // Optional properties should be defined or undefined, not null
        if ('value' in item) {
          expect(typeof item.value === 'string' || item.value === undefined).toBe(true);
        }
        if ('onClick' in item) {
          expect(typeof item.onClick === 'function' || item.onClick === undefined).toBe(true);
        }
      });
    });
  });
});

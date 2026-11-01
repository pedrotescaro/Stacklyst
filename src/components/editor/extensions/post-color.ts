import { Mark } from '@tiptap/core';
import { isPostTextColor } from '@/lib/editor/text-colors';

export const PostColor = Mark.create({
  name: 'postColor',
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => {
          const color = element.getAttribute('data-post-color');
          return isPostTextColor(color) ? color : null;
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span[data-post-color]',
        getAttrs: (element) =>
          isPostTextColor(element.getAttribute('data-post-color')) ? null : false,
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-post-color': HTMLAttributes.color }, 0];
  },
});

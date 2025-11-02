import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageTemplate from './ResizableImageTemplate';

export const CustomResizableImage = Image.extend({
  name: 'image',
  
  draggable: true,
  
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width') || element.style.width,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}`,
          };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height') || element.style.height,
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
            style: `height: ${attributes.height}`,
          };
        },
      },
      align: {
        default: 'left',
        parseHTML: element => {
          const align = element.getAttribute('data-align');
          if (align) return align;
          
          const style = element.style.display;
          if (style === 'block' && element.style.marginLeft === 'auto' && element.style.marginRight === 'auto') {
            return 'center';
          }
          if (element.style.float === 'right') {
            return 'right';
          }
          return 'left';
        },
        renderHTML: attributes => {
          return {
            'data-align': attributes.align,
          };
        },
      },
      displayMode: {
        default: 'float',
        parseHTML: element => {
          return element.getAttribute('data-display-mode') || 'float';
        },
        renderHTML: attributes => {
          return {
            'data-display-mode': attributes.displayMode,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageTemplate);
  },
});

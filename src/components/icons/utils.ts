import { cssInterop } from 'nativewind';

export function wrapIcon(icon: React.ComponentType<any>) {
  return cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: 'color',
        width: 'size',
        height: 'size',
      },
    },
  });
}

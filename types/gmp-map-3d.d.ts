/**
 * Google Maps Platform 3D Map Web Component 类型声明
 * 参考：https://developers.google.com/maps/documentation/javascript/3d-maps
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-map-3d': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          mode?: 'hybrid' | 'unlit';
          center?: string;
          range?: string;
          tilt?: string;
          heading?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};

import type { FC, SVGAttributes } from 'react';

const svgModules = import.meta.glob<
  true,
  string,
  undefined | FC<SVGAttributes<SVGSVGElement>>
>('@/icons/**/*.svg', {
  query: '?react',
  eager: true,
  import: 'default',
});

export default svgModules;

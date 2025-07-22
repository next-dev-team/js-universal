import type { SVGAttributes } from 'react';
import svgModules from '@/components/icon/icons-loader';

export type IconProps = {
  /** Icon name, full name with path */
  name: string;
} & SVGAttributes<SVGSVGElement>;

const Icon = (props: IconProps) => {
  const { name, ...svgProps } = props;

  const SvgIcon = svgModules[`/src/icons/${name}.svg`] || svgModules[`/src/icons/missing-icon.svg`];

  return <>{SvgIcon && <SvgIcon {...svgProps} />}</>;
};
export default Icon;

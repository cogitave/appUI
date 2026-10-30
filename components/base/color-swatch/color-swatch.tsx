'use client';

import {ColorSwatch as AriaColorSwatch,type ColorSwatchProps as AriaColorSwatchProps} from 'react-aria-components';
import {cx} from '@/utils/cx';

export type SwatchSize='small'|'medium'|'large';
export type SwatchShape='circle'|'square';
export type SwatchAppearance='flat'|'gloss';
export type ColorSwatchProps=Omit<AriaColorSwatchProps,'className'|'style'> & {
 size?:SwatchSize;shape?:SwatchShape;appearance?:SwatchAppearance;className?:string;
};

/** The native swatch supplies a localized color name; transparency reveals a checkerboard. */
export function ColorSwatch({size='medium',shape='circle',appearance='flat',className,...props}:ColorSwatchProps){
 return <div className={cx('ui-color-swatch',className)} data-size={size} data-shape={shape} data-appearance={appearance}><AriaColorSwatch {...props} className="ui-color-swatch__color"/></div>;
}

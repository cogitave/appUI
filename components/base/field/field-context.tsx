'use client';

import {createContext, useContext} from 'react';

export const FieldSetDisabledContext = createContext(false);

/** An individual control cannot re-enable itself inside a disabled fieldset. */
export function useFieldDisabled(disabled?: boolean) {
  return useContext(FieldSetDisabledContext) || disabled;
}

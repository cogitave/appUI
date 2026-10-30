export type CheckboxSize = 'sm' | 'md';

export type CheckboxGlyphState = {
  isSelected: boolean;
  isIndeterminate: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isHovered: boolean;
};

export function CheckboxGlyph({ state, size = 'md' }: { state: CheckboxGlyphState; size?: CheckboxSize }) {
  const marked = state.isSelected || state.isIndeterminate;
  return <span className="ui-checkbox__box" data-size={size} data-marked={marked || undefined} data-hovered={state.isHovered || undefined} data-focus-visible={state.isFocusVisible || undefined} data-disabled={state.isDisabled || undefined} aria-hidden="true">
    <svg viewBox="0 0 16 16" fill="none">
      {state.isIndeterminate ? <path d="M4.2 8h7.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : state.isSelected ? <path d="m3.8 8 2.7 2.6 5.7-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="ui-checkbox__tick" /> : null}
    </svg>
  </span>;
}

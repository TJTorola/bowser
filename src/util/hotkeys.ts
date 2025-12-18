import type { Input, Event } from 'electron';

// Largely sourced from https://github.com/mlrv/electron-shortcuts

const inputProperties = ['shift', 'control', 'alt', 'meta'] as const;

type InputProperty = (typeof inputProperties)[number];

type KeyCodes =
  | Modifier
  | LowerAlpha
  | UpperAlpha
  | Digit
  | FunctionKey
  | Punctuation
  | Misc;

// Note that `Option` is left out on purpose to avoid cross-platform issues,
// see https://github.com/electron/electron/blob/master/docs/api/accelerator.md#platform-notice
type Modifier =
  | 'Command'
  | 'Cmd'
  | 'Control'
  | 'Ctrl'
  | 'CommandOrControl'
  | 'CmdOrCtrl'
  | 'Alt'
  | 'AltGr'
  | 'Shift'
  | 'Super';

type NormalizedModifier =
  | 'Cmd'
  | 'Ctrl'
  | 'CmdOrCtrl'
  | 'AltGr'
  | 'Alt'
  | 'Shift'
  | 'Super';

type NonModifier = Exclude<KeyCodes, Modifier>;

type NormalizedNonModifier =
  | LowerAlpha
  | UpperAlpha
  | Digit
  | FunctionKey
  | Punctuation
  | NormalizedMisc;

type LowerAlpha =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';
type UpperAlpha = `${Uppercase<LowerAlpha>}`;
type Digit = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';
type FunctionKey =
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12'
  | 'F13'
  | 'F14'
  | 'F15'
  | 'F16'
  | 'F17'
  | 'F18'
  | 'F19'
  | 'F20'
  | 'F21'
  | 'F22'
  | 'F23'
  | 'F24';
type Punctuation =
  | '!'
  | '@'
  | '#'
  | '$'
  | '%'
  | '^'
  | '&'
  | '*'
  | '('
  | ':'
  | '<'
  | '_'
  | '>'
  | '?'
  | '~'
  | '{'
  | '|'
  | '}'
  | '"'
  | ';'
  | '='
  | ','
  | '\\'
  | '-'
  | '.'
  | '/'
  | '\`'
  | '['
  | ']'
  | "\'";
type Misc =
  | 'Plus'
  | 'Space'
  | 'Tab'
  | 'Backspace'
  | 'Delete'
  | 'Insert'
  | 'Return'
  | 'Enter'
  | 'Up'
  | 'Down'
  | 'Left'
  | 'Right'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'
  | 'Escape'
  | 'Esc'
  | 'VolumeUp'
  | 'VolumeDown'
  | 'VolumeMute'
  | 'MediaNextTrack'
  | 'MediaPreviousTrack'
  | 'MediaStop'
  | 'MediaPlayPause'
  | 'PrintScreen';
type NormalizedMisc =
  | Exclude<Misc, 'Return' | 'Esc'>
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight';

type Separator = '+';

// Split a string given a separator, I.e.
// SplitOnSeparator<"a,b,c", ","> -> ["a", "b", "c"]
// SplitOnSeparator<"a,b,c", "."> -> ["abc"]
type SplitOnSeparator<
  S extends string,
  T extends string,
> = S extends `${infer A}${T}${infer Rest}`
  ? [A, ...SplitOnSeparator<Rest, T>]
  : [S];

// Split on "+"
type SplitOnPlus<S extends string> = SplitOnSeparator<S, Separator>;

// Given a list of Keycodes, split it into `Modifier`s and `NonModifier`s
type Separate<
  S extends string[],
  T extends { mod: Modifier[]; nonMod: NonModifier[] } = {
    mod: [];
    nonMod: [];
  },
> = S['length'] extends 0
  ? T
  : S extends [infer H, ...infer Rest]
    ? Rest extends string[]
      ? H extends Modifier
        ? T extends { mod: [...infer Mods]; nonMod: [...infer NonMods] }
          ? Mods extends Modifier[]
            ? NonMods extends NonModifier[]
              ? Separate<Rest, { mod: [H, ...Mods]; nonMod: NonMods }>
              : never
            : never
          : never
        : H extends NonModifier
          ? T extends { mod: [...infer Mods]; nonMod: [...infer NonMods] }
            ? Mods extends Modifier[]
              ? NonMods extends NonModifier[]
                ? Separate<Rest, { mod: Mods; nonMod: [H, ...NonMods] }>
                : never
              : never
            : never
          : never
      : never
    : never;

// Validate whether a combination of `Modifier`s and `NonModifier`s is valid
// according to the following rules:
// - At least one `Modifier`s
// - Exactly one `NonModifier`
type IsValidCombination<T extends { mod: Modifier[]; nonMod: NonModifier[] }> =
  T['mod']['length'] extends 0
    ? false
    : T['nonMod']['length'] extends 0
      ? false
      : T['nonMod']['length'] extends 1
        ? true
        : false;

// Constrain a string to be a valid accelerator
type Accelerator<S extends string> =
  IsValidCombination<Separate<SplitOnPlus<S>>> extends true ? S : never;

// Available options for registering a shortcut
type RegisterOptions = {
  strict?: boolean;
};

// Given a valid accelerator string, split it into
// its `Modifier`s and `NonModifier`s components
const split = <S extends string>(
  accelerator: Accelerator<S>,
): [Modifier[], NonModifier[]] => {
  const components = accelerator.split('+');

  const modifiers = components.filter((c): c is Modifier => isModifier(c));

  const rest = components.filter((c): c is NonModifier => !isModifier(c));

  return [modifiers, rest];
};

// Given a list of `Modifier`s, return its normalised subset
const normalizeModifiers = (modifiers: Modifier[]): NormalizedModifier[] => [
  ...new Set(modifiers.map(normalizeModifier)),
];

// Given a `NormalizedModifier`, map it to the corresponding
// input property of an Electron Input event
const normalizedModifierToInputProperty = (
  normalizedModifier: NormalizedModifier,
): InputProperty => {
  switch (normalizedModifier) {
    case 'Super':
    case 'Cmd':
      return 'meta';
    case 'Ctrl':
    case 'AltGr':
      return 'control';
    case 'Shift':
      return 'shift';
    case 'Alt':
      return 'alt';
    case 'CmdOrCtrl':
      // https://github.com/electron/electron/blob/master/docs/api/accelerator.md#platform-notice
      return process.platform === 'darwin' ? 'meta' : 'control';
  }
};

const constVoid = (): void => {};

// `Modifier` type guard
const isModifier = (str: string): str is Modifier =>
  [
    'Command',
    'Cmd',
    'Control',
    'Ctrl',
    'CommandOrControl',
    'CmdOrCtrl',
    'Alt',
    'AltGr',
    'Shift',
    'Super',
  ].includes(str);

// Normalize a `Modifier` key to a common subset
const normalizeModifier = (modifier: Modifier): NormalizedModifier => {
  switch (modifier) {
    case 'Cmd':
    case 'Command':
      return 'Cmd';

    case 'CmdOrCtrl':
    case 'CommandOrControl':
      return 'CmdOrCtrl';

    case 'Control':
    case 'Ctrl':
      return 'Ctrl';

    default:
      return modifier;
  }
};

// Normalize a `NonModifier` key to a common subset
const normalizeNonModifier = (nonMod: NonModifier): NormalizedNonModifier => {
  switch (nonMod) {
    case 'Return':
      return 'Enter';

    case 'Esc':
      return 'Escape';

    case 'Up':
      return 'ArrowUp';
    case 'Down':
      return 'ArrowDown';
    case 'Left':
      return 'ArrowLeft';
    case 'Right':
      return 'ArrowRight';

    default:
      return nonMod;
  }
};

const localShortcutMap: Record<string, (_: Event, i: Input) => void> = {};

const getShortcutLocal = <S extends string>(
  accelerator: Accelerator<S>,
  webContents: Electron.WebContents,
) => localShortcutMap[`${accelerator}-${webContents.id}`];

const setShortcutLocal = <S extends string>(
  accelerator: Accelerator<S>,
  webContents: Electron.WebContents,
  handler: (_: Event, i: Input) => void,
): void => {
  localShortcutMap[`${accelerator}-${webContents.id}`] = handler;
};

const deleteShortcutLocal = <S extends string>(
  accelerator: Accelerator<S>,
  webContents: Electron.WebContents,
): void => {
  delete localShortcutMap[`${accelerator}-${webContents.id}`];
};

export const isRegistered = <S extends string>(
  accelerator: Accelerator<S>,
  webContents: Electron.WebContents,
): boolean => {
  return !!getShortcutLocal(accelerator, webContents);
};

// Register a local shortcut for the given
// accelerator string on the given window
export const register = <S extends string>(
  accelerator: Accelerator<S>,
  f: () => void,
  wc: Electron.WebContents,
  options?: RegisterOptions,
): void => {
  // `strict` is false if not specified
  const strict = options?.strict || false;

  // Break down the accelerator into modifiers and non-modifiers,
  // then, find the associated input properties
  const [modifiers, [nonModifier]] = split(accelerator);

  const inputModifiers = normalizeModifiers(modifiers).map(
    normalizedModifierToInputProperty,
  );

  // @ts-expect-error nonModifier cannot be undef and this seems to be unhandled
  const normalizedNonModifier = normalizeNonModifier(nonModifier);

  // The modifiers check to perform when `strict` is enabled
  const modifiersCheckStrict = (i: Input): boolean => {
    const excessInputProperties = inputProperties.filter(
      (p) => !inputModifiers.includes(p),
    );

    return (
      modifiersCheckNonStrict(i) &&
      excessInputProperties.every((mod) => !i[mod])
    );
  };

  // The modifiers check to perform when `strict` is not enabled
  const modifiersCheckNonStrict = (i: Input): boolean =>
    inputModifiers.every((mod) => i[mod]);

  const modifiersCheck: (i: Input) => boolean = strict
    ? modifiersCheckStrict
    : modifiersCheckNonStrict;

  // Ignore key up events, and perform the relevant checks
  // on key down events
  const onKeyUp = (): void => constVoid();
  const onKeyDown = (input: Input): void => {
    return input.key.toLowerCase() === normalizedNonModifier.toLowerCase() &&
      modifiersCheck(input)
      ? f()
      : constVoid();
  };

  // Actual handler to attach to the webContents
  const handler = (_: Event, i: Input): void =>
    i.type === 'keyUp' ? onKeyUp() : onKeyDown(i);

  // If there was a previous shortcut registed with the same accelerator
  // on the same window, override it
  const unregisterPreviousIfNeeded = (wc: Electron.WebContents) =>
    isRegistered(accelerator, wc) ? unregister(accelerator, wc) : constVoid();

  // Actual registration process
  const register = (wc: Electron.WebContents): void => {
    unregisterPreviousIfNeeded(wc);

    // Keep reference to local shortcut in case we need to
    // unregister it later
    setShortcutLocal(accelerator, wc, handler);

    // Attach listener to webContents of the window
    wc.on('before-input-event', handler);
  };

  return register(wc);
};

// Unregister the given shortcut from the given window
export const unregister = <S extends string>(
  accelerator: Accelerator<S>,
  webContents: Electron.WebContents,
): void => {
  const handler = getShortcutLocal(accelerator, webContents);

  const doUnregister = () => {
    webContents.removeListener('before-input-event', handler);
    deleteShortcutLocal(accelerator, webContents);
  };

  !!webContents ? doUnregister() : constVoid();
};

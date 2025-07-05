import koffi from 'koffi';
import type { IpcResponse } from '../../../common/ipc';

export const keyParam = {
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  '0': 96,
  '1': 97,
  '2': 98,
  '3': 99,
  '4': 100,
  '5': 101,
  '6': 102,
  '7': 103,
  '8': 104,
  '9': 105,
  '.': 110,
  '-': 189,
  '/': 111,
  '=': 109,
  ';': 186,
  '\\': 191,
  ',': 188,
  '[': 219,
  '`': 222,
  ']': 221,
  '+': 189,
  backspace: 8,
  underline: 189,
  space: 32,
  shift: 16,
  enter: 13,
  capslock: 20,
  s0: 48,
  s1: 49,
  s2: 50,
  s3: 51,
  s4: 52,
  s5: 53,
  s6: 54,
  s7: 55,
  s8: 56,
  s9: 57,
  '{numpad0}': 48,
  '{numpad1}': 49,
  '{numpad2}': 50,
  '{numpad3}': 51,
  '{numpad4}': 52,
  '{numpad5}': 53,
  '{numpad6}': 54,
  '{numpad7}': 55,
  '{numpad8}': 56,
  '{numpad9}': 57,
  '{numlock}': 144,
  '{numpaddecimal}': 110,
  '{numpaddivide}': 111,
  '{numpadmultiply}': 106,
};

class User32Library {
  static instance: User32Library | undefined;
  private readonly user32Lib: koffi.IKoffiLib | undefined;

  private constructor() {
    if (process.platform === 'win32') {
      this.user32Lib = koffi.load('user32.dll');
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new User32Library();
    }
    return this.instance;
  }

  callDllExample = (): IpcResponse => {
    if (!this.user32Lib || process.platform !== 'win32') {
      return { code: 1, message: '非windows环境' };
    }
    //const MB_OK = 0x0;
    const MB_YESNO = 0x4;
    const MB_ICONQUESTION = 0x20;
    const MB_ICONINFORMATION = 0x40;
    //const IDOK = 1;
    const IDYES = 6;
    //const IDNO = 7;

    // Find functions
    /*const MessageBoxA = user32Lib.func('__stdcall', 'MessageBoxA', 'int', [
      'void *',
      'str',
      'str',
      'uint',
    ]);*/
    const MessageBoxA = this.user32Lib.func(
      'int MessageBoxA(void *hWnd, str lpText, str lpCaption, uint uType)',
    );
    const MessageBoxW = this.user32Lib.func('__stdcall', 'MessageBoxW', 'int', [
      'void *',
      'str16',
      'str16',
      'uint',
    ]);

    const ret = MessageBoxA(
      null,
      'Do you want another message box?',
      'Koffi',
      MB_YESNO | MB_ICONQUESTION,
    );

    if (ret == IDYES) {
      MessageBoxW(null, 'Hello World!', 'Koffi', MB_ICONINFORMATION);
    }
    return { code: 0, message: 'call success' };
  };
  getKeyboardState = () => {
    if (!this.user32Lib || process.platform !== 'win32') {
      return { code: 1, message: '非windows环境' };
    }
    koffi.alias('PBYTE', koffi.pointer('int'));
    const GetKeyboardState = this.user32Lib.func(
      'bool GetKeyboardState(PBYTE lpKeyState)',
    );

    const lpKeyState = Buffer.alloc(256);
    const result = GetKeyboardState(lpKeyState) as boolean;
    koffi.reset();
    return { code: 0, data: { result, lpKeyState } };
  };
}

export default User32Library;

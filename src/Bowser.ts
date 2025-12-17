import Window from './Window.ts';

export default class Bowser {
  windows: Array<Window>;

  constructor() {
    this.windows = [];
  }

  getFocusedWindow = () => {
    return this.windows[0];
  };

  onWindowFocus = (window: Window) => {
    this.windows = [window, ...this.windows.filter((w) => w !== window)];
  };

  // Instead of allowing browserViews to just open new browserViews, override
  // that behavior and instead create and register a new window object.
  openNew = (location: string) => {
    const window = new Window(location);

    window.setWindowOpenHandler((url) => {
      const newWindow = this.openNew(url);
      return newWindow.webContents;
    });

    window.onFocus(() => {
      this.onWindowFocus(window);
    });

    this.windows = [window, ...this.windows];
    return window;
  };

  open = (location: string) => {
    const focusedWindow = this.getFocusedWindow();
    if (focusedWindow) focusedWindow.loadLocation(location);
  };
}

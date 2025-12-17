import Window from './Window.ts';

export default class Browser {
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

  openNew = (location: string) => {
    const window = new Window(location);

    window.browser.view.webContents.setWindowOpenHandler((details) => ({
      action: 'allow',
      createWindow: () => {
        const newWindow = this.openNew(details.url);
        return newWindow.browser.view.webContents;
      },
    }));

    window.browser.on('focus', () => {
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

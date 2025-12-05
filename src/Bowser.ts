import Window from './Window.ts';

export default class Browser {
  windows: Array<Window>;

  constructor() {
    this.windows = [];
  }

  getFocusedBrowser = () => {
    return this.windows[0];
  };

  onWindowFocus = (window: Window) => {
    this.windows = [window, ...this.windows.filter((w) => w !== window)];
  };

  openNew = (url: string) => {
    const window = new Window(url);

    window.browser.webContents.setWindowOpenHandler((details) => ({
      action: 'allow',
      createWindow: () => {
        const newWindow = this.openNew(details.url);
        return newWindow.browser.webContents;
      },
    }));

    window.browser.on('focus', () => {
      this.onWindowFocus(window);
    });

    this.windows = [window, ...this.windows];
    return window;
  };

  open = (url: string) => {
    const focusedBrowser = this.getFocusedBrowser();
    if (focusedBrowser) focusedBrowser.loadURL(url);
  };
}

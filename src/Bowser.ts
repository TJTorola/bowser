import Window from './Window.ts';

export default class Browser {
  windows: Array<Window>;

  constructor() {
    this.windows = [];
  }

  getFocusedBrowser = () => {
    return (
      this.windows.find((window) => window.browser.isFocused()) ||
      this.windows[0]
    );
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

    this.windows.push(window);
    return window;
  };

  open = (url: string) => {
    const focusedBrowser = this.getFocusedBrowser();
    if (focusedBrowser) focusedBrowser.loadURL(url);
  };
}

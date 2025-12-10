import { BrowserWindow } from 'electron';
import * as shortcuts from 'electron-shortcuts';
import { locationToUrl } from './util.ts';

export default class Window {
  browser: BrowserWindow;

  constructor(location: string) {
    this.browser = new BrowserWindow({
      titleBarStyle: 'hidden',
      width: 800,
      height: 600,
      darkTheme: true,
      webPreferences: {
        autoplayPolicy: 'document-user-activation-required',
      },
      show: false,
    });

    this.browser.once('ready-to-show', () => this.browser.show());

    shortcuts.register('Ctrl+h', this.goBack, this.browser);
    shortcuts.register('Ctrl+l', this.goForward, this.browser);
    shortcuts.register('Ctrl+d', this.openDevTools, this.browser);
    shortcuts.register('Ctrl+r', this.reload, this.browser);

    this.loadLocation(location);
  }

  loadLocation = async (location: string) => {
    try {
      await this.browser.loadURL(locationToUrl(location));
    } catch (error) {
      this.browser.loadFile('./src/error.html');
    }
  };

  goBack = () => this.browser.webContents.navigationHistory.goBack();
  goForward = () => this.browser.webContents.navigationHistory.goForward();
  openDevTools = () => this.browser.webContents.openDevTools();
  reload = () => this.browser.webContents.reload();
}

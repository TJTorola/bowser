import { WebContentsView } from 'electron';
import { locationToUrl } from '../util/index.ts';
import * as hotkeys from '../util/hotkeys.ts';

const WEB_PREFERENCES = {
  autoplayPolicy: 'document-user-activation-required' as const,
};

export default class Browser {
  view: WebContentsView;

  constructor() {
    this.view = new WebContentsView({
      webPreferences: WEB_PREFERENCES,
    });

    hotkeys.register('Ctrl+h', this.goBack, this.view.webContents);
    hotkeys.register('Ctrl+l', this.goForward, this.view.webContents);
    hotkeys.register('Ctrl+d', this.openDevTools, this.view.webContents);
    hotkeys.register('Ctrl+r', this.reload, this.view.webContents);
  }

  onUrlChange = (callback: (url: string) => unknown) => {
    this.view.webContents.on('did-navigate', (_, url) => {
      callback(url);
    });
  };

  setWindowOpenHandler = (callback: (url: string) => Electron.WebContents) => {
    this.view.webContents.setWindowOpenHandler((details) => ({
      action: 'allow',
      createWindow: () => {
        return callback(details.url);
      },
    }));
  };

  setBounds = (parentBounds: Electron.Rectangle, navBarHeight: number) => {
    this.view.setBounds({
      x: 0,
      y: 0,
      width: parentBounds.width,
      height: parentBounds.height - navBarHeight,
    });
  };

  loadLocation = async (location: string) => {
    try {
      await this.view.webContents.loadURL(locationToUrl(location));
    } catch (error) {
      this.view.webContents.loadFile('./src/Browser/error.html');
    }
  };

  goBack = () => this.view.webContents.navigationHistory.goBack();
  goForward = () => this.view.webContents.navigationHistory.goForward();
  openDevTools = () => this.view.webContents.openDevTools();
  reload = () => this.view.webContents.reload();
}

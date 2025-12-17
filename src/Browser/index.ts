import { WebContentsView } from 'electron';
import { locationToUrl } from '../util.ts';

const WEB_PREFERENCES = {
  autoplayPolicy: 'document-user-activation-required' as const,
};

export default class Browser {
  view: WebContentsView;

  constructor() {
    this.view = new WebContentsView({
      webPreferences: WEB_PREFERENCES,
    });

    // shortcuts.register('Ctrl+h', this.goBack, this.browser);
    // shortcuts.register('Ctrl+l', this.goForward, this.browser);
    // shortcuts.register('Ctrl+d', this.openDevTools, this.browser);
    // shortcuts.register('Ctrl+r', this.reload, this.browser);
  }

  onUrlChange = (callback: (url: string) => unknown) => {
    this.view.webContents.on('did-navigate', (_, url) => {
      callback(url);
    });
    this.view.webContents.on('did-navigate-in-page', (_, url) => {
      callback(url);
    });
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

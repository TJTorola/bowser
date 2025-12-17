import { BaseWindow, WebContentsView } from 'electron';
import * as shortcuts from 'electron-shortcuts';
import { locationToUrl } from './util.ts';

const NAVBAR_HEIGHT = 20;

export default class Window {
  base: BaseWindow;
  browser: WebContentsView;
  navbar: WebContentsView;

  constructor(location: string) {
    this.base = new BaseWindow({
      titleBarStyle: 'hidden',
      width: 800,
      height: 600,
      darkTheme: true,
      // show: false,
    });

    this.browser = new WebContentsView({
      webPreferences: {
        autoplayPolicy: 'document-user-activation-required',
      },
    });

    this.navbar = new WebContentsView();
    this.navbar.webContents.loadFile('./src/navbar.html');

    this.navbar.webContents.on('console-message', (_e, _l, message) => {
      console.log(`[navbar]: ${message}`);
    });

    this.base.contentView.addChildView(this.browser);
    this.base.contentView.addChildView(this.navbar);
    this.setBounds();

    this.base.on('resize', () => this.setBounds());

    // this.browser.once('ready-to-show', () => this.base.show());

    // shortcuts.register('Ctrl+h', this.goBack, this.browser);
    // shortcuts.register('Ctrl+l', this.goForward, this.browser);
    // shortcuts.register('Ctrl+d', this.openDevTools, this.browser);
    // shortcuts.register('Ctrl+r', this.reload, this.browser);

    this.loadLocation(location);
  }

  setBounds = () => {
    const { width, height } = this.base.getBounds();

    this.browser.setBounds({
      x: 0,
      y: 0,
      width,
      height: height - NAVBAR_HEIGHT,
    });

    this.navbar.setBounds({
      x: 0,
      y: height - NAVBAR_HEIGHT,
      width,
      height: NAVBAR_HEIGHT,
    });
  };

  loadLocation = async (location: string) => {
    try {
      await this.browser.webContents.loadURL(locationToUrl(location));
    } catch (error) {
      this.browser.webContents.loadFile('./src/error.html');
    }
  };

  goBack = () => this.browser.webContents.navigationHistory.goBack();
  goForward = () => this.browser.webContents.navigationHistory.goForward();
  openDevTools = () => this.browser.webContents.openDevTools();
  reload = () => this.browser.webContents.reload();
}

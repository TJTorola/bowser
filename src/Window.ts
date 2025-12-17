import { BaseWindow, WebContentsView } from 'electron';
import * as shortcuts from 'electron-shortcuts';
import { locationToUrl } from './util.ts';
import NavBar from './NavBar/index.ts';

export default class Window {
  base: BaseWindow;
  browser: WebContentsView;
  navBar: NavBar;

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

    this.navBar = new NavBar();

    this.browser.webContents.on('did-navigate', (_, url) => {
      this.navBar.updateUrl(url);
    });
    this.browser.webContents.on('did-navigate-in-page', (_, url) => {
      this.navBar.updateUrl(url);
    });

    this.base.contentView.addChildView(this.browser);
    this.base.contentView.addChildView(this.navBar.view);
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
    const bounds = this.base.getBounds();

    this.browser.setBounds({
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height - this.navBar.height,
    });

    this.navBar.setBounds(bounds);
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

import { BaseWindow } from 'electron';
import NavBar from './NavBar/index.ts';
import Browser from './Browser/index.ts';

export default class Window {
  #base: BaseWindow;
  #browser: Browser;
  #navBar: NavBar;

  constructor(location: string) {
    this.#base = new BaseWindow({
      titleBarStyle: 'hidden',
      width: 800,
      height: 600,
      darkTheme: true,
    });

    this.#browser = new Browser();
    this.#navBar = new NavBar();
    this.#browser.onUrlChange(this.updateUrl);

    this.#base.contentView.addChildView(this.#browser.view);
    this.#base.contentView.addChildView(this.#navBar.view);
    this.setBounds();

    this.#base.on('resize', () => this.setBounds());

    this.loadLocation(location);
  }

  get webContents() {
    return this.#browser.view.webContents;
  }

  setWindowOpenHandler = (callback: (url: string) => Electron.WebContents) => {
    this.#browser.setWindowOpenHandler(callback);
  };

  onFocus = (callback: () => unknown) => {
    this.#base.on('focus', () => {
      callback();
    });
  };

  updateUrl = (url: string) => {
    this.#base.title = url;
    this.#navBar.updateUrl(url);
  };

  loadLocation = (location: string) => {
    this.#browser.loadLocation(location);
  };

  setBounds = () => {
    const bounds = this.#base.getBounds();

    this.#browser.setBounds(bounds, this.#navBar.height);
    this.#navBar.setBounds(bounds);
  };
}

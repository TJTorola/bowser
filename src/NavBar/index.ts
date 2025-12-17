import { WebContentsView } from 'electron';

const INITIAL_HEIGHT = 24;

export default class NavBar {
  height = INITIAL_HEIGHT;

  view: WebContentsView;

  constructor() {
    this.view = new WebContentsView();

    this.view = new WebContentsView();
    this.view.webContents.loadFile('./src/NavBar/index.html');

    this.view.webContents.on('console-message', (_e, _l, message) => {
      console.log(`[navbar]: ${message}`);
    });
  }

  setBounds = (parentBounds: Electron.Rectangle) => {
    this.view.setBounds({
      x: 0,
      y: parentBounds.height - this.height,
      width: parentBounds.width,
      height: this.height,
    });
  };

  updateUrl = (url: string) => {
    if (url.replace(/'/g, "\\'") !== url) {
      console.log(
        'Found potential javascript injection in URL, refusing to update',
      );
      console.log(`URL: '${url}'`);
      return;
    }

    this.view.webContents
      .executeJavaScript(
        `
        document.getElementById('current-url').textContent = '${url}';`,
      )
      .catch((err) => {
        console.log('Failed to updateNavbarUrl');
        console.log(err);
      });
  };
}

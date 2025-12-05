import { app } from 'electron';
import Bowser from './Bowser.ts';

const [command, ...rest] = process.argv.slice(2);
if (app.requestSingleInstanceLock({ command, rest })) {
  app.whenReady().then(() => {
    const bowser = new Bowser();

    if (command === 'open' || command === 'open-new') {
      const location = rest.join(' ');
      bowser.openNew(location || 'https://apod.nasa.gov');
    } else {
      throw new Error(`Unknown command "${command}"`);
    }

    app.on(
      'second-instance',
      (_event, _argv, _workingDirectory, additionalData) => {
        const { command, rest } = additionalData as {
          command: string;
          rest: string[];
        };

        if (command === 'open') {
          const location = rest.join(' ');
          bowser.open(location || 'https://apod.nasa.gov');
        } else if (command === 'open-new') {
          const location = rest.join(' ');
          bowser.openNew(location || 'https://apod.nasa.gov');
        } else {
          throw new Error(`Unknown command "${command}"`);
        }
      },
    );
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });
} else {
  app.quit();
}

import { app } from 'electron';
import Bowser from './Bowser.ts';

const [command, ...rest] = process.argv.slice(2);
if (app.requestSingleInstanceLock({ command, rest })) {
  app.whenReady().then(() => {
    const bowser = new Bowser();

    if (command === 'open' || command === 'open-new') {
      bowser.openNew(rest[0] || 'https://apod.nasa.gov');
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
          bowser.open(rest[0] || 'https://apod.nasa.gov');
        } else if (command === 'open-new') {
          bowser.openNew(rest[0] || 'https://apod.nasa.gov');
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

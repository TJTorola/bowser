import { mkdir, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const getXdgDataHome = () => {
  const { XDG_DATA_HOME, HOME } = process.env;
  if (XDG_DATA_HOME) return XDG_DATA_HOME;
  if (!HOME) {
    throw new Error(
      'Cannot determine data directory without $XDG_DATA_HOME or $HOME',
    );
  }

  return `${HOME}/.local/share`;
};

const getDataPath = async () => {
  const dataPath = `${getXdgDataHome()}/bowser`;
  try {
    await mkdir(dataPath, { recursive: true });
  } catch (err) {
    console.log(`Could not create data directory: "${dataPath}"`);
    throw err;
  }

  return dataPath;
};

let dataPath: null | string = null;
const cachedDataPath = async () => {
  if (dataPath) return dataPath;
  dataPath = await getDataPath();
  return dataPath;
};

type HistoryData = {
  url: string;
};

const HISTORY_HEADER = 'URL,Date';
const getHistoryCsvPath = async () => {
  const historyCsvPath = `${await cachedDataPath()}/history.csv`;
  if (!existsSync(historyCsvPath)) {
    appendFile(historyCsvPath, HISTORY_HEADER);
  }

  return historyCsvPath;
};

export const writeHistoryLine = async ({ url }: HistoryData) =>
  appendFile(await getHistoryCsvPath(), `${url},${Date()}\n`);

export const getHistory = async (): Promise<
  Array<HistoryData & { date: Date }>
> => {
  const text = await Bun.file(await getHistoryCsvPath()).text();
  const rows = text.split('\n').map((row) => row.split(','));
  return rows
    .map(([url, dateStr], idx) => {
      if (!url) {
        console.log(`No URL present, skipping row<${idx}>`);
        return null;
      }
      const date = new Date(dateStr || '');
      // @ts-expect-error ts doesn't like this date checking trickery
      if (isNaN(date)) {
        console.log(`Invalid date value '${dateStr}', skipping row<${idx}>`);
        return null;
      }

      return { url, date };
    })
    .filter((row) => row !== null);
};

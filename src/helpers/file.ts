import * as path from 'path'
import * as fs from 'fs'

export const readSystemFile = (fileName: string, encoding: string | null | undefined = 'utf8'): string | undefined => {
  fileName = path.normalize(fileName);
  try {
    // @ts-ignore
    return fs.readFileSync(fileName, { encoding });
  } catch (e) {
    return undefined;
  }
}

import ts from 'typescript/lib/tsserverlibrary';
import * as glob from 'glob'
import path from 'path'
import { create } from './factory/create'

export interface PluginConfig {
  features: {
    diagnostics: boolean | Array<'semantic' | 'syntactic' | 'suggestion'>;
    quickInfo: boolean;
  };
  directories: Array<{
    kind: 'component' | 'composition-function';
    name: string;
    path: string;
  }>;
}

function getExternalFiles(project: ts.server.ConfiguredProject) {
  // FIXME
  console.log('[vue-ts-plugin] vue files')
  console.log(`__dirname: ${__dirname}`)
  const rootDir = path.resolve(__dirname, '../../../../')
  const vueFiles = glob.sync(path.resolve(rootDir, './**/*.vue'))
  console.log(vueFiles)
  return vueFiles
}

const moduleFactory: ts.server.PluginModuleFactory = ({ typescript: _ts }) => {
  return { create: create(_ts), getExternalFiles };
};

export default moduleFactory;

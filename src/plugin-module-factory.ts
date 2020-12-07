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
  const rootDir = path.resolve(process.cwd(), '../../../')
  const vueFiles = glob.sync(path.resolve(rootDir, './**/*.vue'))
  return vueFiles
}

const moduleFactory: ts.server.PluginModuleFactory = ({ typescript: _ts }) => {
  return { create: create(_ts) };
};

export default moduleFactory;

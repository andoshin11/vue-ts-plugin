import { PluginContext } from '../../context'
import { tryPatchMethod } from '../pathcer'
import { patchGetScriptFileNames } from './getScriptFileNames'
import { patchGetScriptSnapshot } from './getScriptSnapshot'
import { patchResolveModuleNames } from './resolveModuleNames'
import { patchGetCompilationSettings } from './getCompilationSettings'
import { readSystemFile } from '../../../helpers/file'

export type ScriptVersions = Map<string, { scriptSnapshot: ts.IScriptSnapshot, version: number }>

export function patchLanguageServiceHost(context: PluginContext) {
  const scriptVersions: ScriptVersions = new Map()

  tryPatchMethod(context.languageServiceHost, 'readFile', delegate => readSystemFile)
  tryPatchMethod(context.languageServiceHost, 'getScriptVersion', delegate => {
    return function (fileName) {

      const scriptVersion = scriptVersions.get(fileName)
      return scriptVersion ? scriptVersion.version + '' : delegate(fileName)
    }
  })
  patchGetScriptFileNames(context)
  patchGetScriptSnapshot(context, scriptVersions)
  patchResolveModuleNames(context)
  patchGetCompilationSettings(context)
}

import { PluginContext } from '../../context'
import { tryPatchMethod } from '../pathcer'
import { patchGetScriptFileNames } from './getScriptFileNames'
import { patchGetScriptSnapshot } from './getScriptSnapshot'
import { patchResolveModuleNames } from './resolveModuleNames'
import { patchGetCompilationSettings } from './getCompilationSettings'
import { readSystemFile } from '../../../helpers/file'

export function patchLanguageServiceHost(context: PluginContext) {
  tryPatchMethod(context.languageServiceHost, 'readFile', delegate => readSystemFile)
  patchGetScriptFileNames(context)
  patchGetScriptSnapshot(context)
  patchResolveModuleNames(context)
  patchGetCompilationSettings(context)
}

import { PluginContext } from '../../context'
import { tryPatchMethod } from '../pathcer'
import { GLOBAL_TYPES_FILE, isRawVueFile, toTSVueFIleName } from '../../../../../vue-type-audit' // FIXME: use public package

export function patchGetScriptFileNames(context: PluginContext) {
  tryPatchMethod(context.languageServiceHost, 'getScriptFileNames', delegate => {
    return () => {
      const fileNames = delegate()
      const tsVueFileNames = fileNames.filter(isRawVueFile).map(toTSVueFIleName)

      return [...fileNames, ...tsVueFileNames, GLOBAL_TYPES_FILE.name]
    }
  })
}

import { PluginContext } from '../../context'
import { tryPatchMethod } from '../pathcer'

export function patchGetCompilationSettings(context: PluginContext) {
  tryPatchMethod(context.languageServiceHost, 'getCompilationSettings', delegate => {
    return () => {
      const settings = delegate()

      settings.jsx = context._ts.JsxEmit.Preserve

      return settings
    }
  })
}

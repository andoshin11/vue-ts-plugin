import { PluginContext } from '../../context'
import { tryPatchMethod } from '../pathcer'
import { isTSVueFile, toRawVueFileName } from 'vue-type-audit'

export function patchReadFile(context: PluginContext) {
  tryPatchMethod(context.serviceHost, 'readFile', delegate => {
    context.logger(`[patch] Override readFile to check containing file for virtual files. (ServiceHost)`);

    return fileName => {
      if (isTSVueFile(fileName)) {
        const rawVueFileName = toRawVueFileName(fileName)
        const document = context.store.get(rawVueFileName)
        if (!document) return
        return document.getText()
      }

      return delegate ? delegate(fileName) : context._ts.sys.readFile(fileName)
    }
  })
}

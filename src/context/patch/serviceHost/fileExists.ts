import { PluginContext } from '../../context'
import { tryPatchMethod } from '../pathcer'
import { isTSVueFile, toRawVueFileName } from 'vue-type-audit'

export function patchFileExists(context: PluginContext) {
  tryPatchMethod(context.serviceHost, 'fileExists', (delegate = context._ts.sys.fileExists) => {
    context.logger(`[patch] Override fileExists to check containing file for virtual files. (ServiceHost)`)

    return fileName => {
      context.logger(`Checking file exists: ${fileName}`)
      if (fileName.endsWith('.vue.ts') && isTSVueFile(fileName)) {
        fileName = toRawVueFileName(fileName)
      }

      return delegate(fileName)
    }
  })
}

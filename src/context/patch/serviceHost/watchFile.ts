import { PluginContext } from '../../context'
import { tryPatchMethod } from '../pathcer'
import { isTSVueFile } from 'vue-type-audit'

export function patchWatchFile(context: PluginContext) {
  tryPatchMethod(context.serviceHost, 'watchFile', delegate => {
    context.logger(`[patch] Override watchFile to watch virtual files. (ServiceHost)`);

    return (fileName, callback, pollingInterval, options) => {
      // context.logger(`Inside watchFile: ${fileName}`)
      if (isTSVueFile(fileName)) {
        context.watchVirtualFile(fileName, callback)

        return {
          close() {
            context.stopVirtualFileWatcher(fileName, callback)
          }
        }
      }

      return delegate(fileName, callback, pollingInterval, options)
    }
  })
}

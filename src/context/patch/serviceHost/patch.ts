import { PluginContext } from '../../context'
import { patchWatchFile } from './watchFile'
import { patchFileExists } from './fileExists'
import { patchReadFile } from './readFile'

export function patchServiceHost(context: PluginContext) {
  patchWatchFile(context)
  patchFileExists(context)
  patchReadFile(context)
}

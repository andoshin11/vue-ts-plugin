import fs from 'fs'
import { PluginContext } from '../../context'
import { readSystemFile } from '../../../helpers/file'
import { tryPatchMethod } from '../pathcer'
import { GLOBAL_TYPES_FILE, isRawVueFile, isTSVueFile, toRawVueFileName, transformVueFile } from '../../../../../vue-type-audit' // FIXME: use public package

export function patchGetScriptSnapshot(context: PluginContext) {
  const { fileEntry, sourcemapEntry, virtualFileEntry, _ts, logger, projectService } = context

  tryPatchMethod(context.languageServiceHost, 'getScriptSnapshot', delegate => {
    return function(fileName) {
      logger(`getting script snapshot: ${fileName}`)

      projectService.getOrCreateScriptInfoForNormalizedPath(
        _ts.server.toNormalizedPath(fileName),
        false
      )

      // recover file name
      if (isTSVueFile(fileName)) {
        fileName = toRawVueFileName(fileName)
      }

      // Do not use cache until we figure out how to get text change event
      // if (fileEntry.has(fileName)) return fileEntry.get(fileName)!.scriptSnapshot

      // resolve GLOBAL_TYPE_FILE
      if (fileName === GLOBAL_TYPES_FILE.name) {
        const scriptSnapshot = _ts.ScriptSnapshot.fromString(GLOBAL_TYPES_FILE.content)
        fileEntry.set(fileName, { scriptSnapshot })
        return scriptSnapshot
      }

      if (!fs.existsSync(fileName)) {
        return undefined
      }
      let content = readSystemFile(fileName)
      if (!content) return undefined


      // transform Vue file
      if (isRawVueFile(fileName)) {
        fileEntry.set(fileName, { scriptSnapshot: _ts.ScriptSnapshot.fromString(content) })
        const { transformedContent } = transformVueFile(fileName, content, sourcemapEntry, _ts)
        virtualFileEntry.set(fileName, transformedContent)
        fs.writeFileSync(fileName + '.ts', transformedContent) // for debug
        return _ts.ScriptSnapshot.fromString(transformedContent)
      }

      const scriptSnapshot = _ts.ScriptSnapshot.fromString(content)
      fileEntry.set(fileName, { scriptSnapshot })
      return scriptSnapshot
    }
  })
}

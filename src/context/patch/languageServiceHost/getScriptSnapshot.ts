import fs from 'fs'
import tss from 'typescript/lib/tsserverlibrary'
import { PluginContext } from '../../context'
import { readSystemFile } from '../../../helpers/file'
import { tryPatchMethod } from '../pathcer'
import { GLOBAL_TYPES_FILE, isRawVueFile, isTSVueFile, toRawVueFileName, transformVueFile, getFullTextFromSnapshot, toTSVueFIleName } from 'vue-type-audit'
import { ScriptVersions } from './patch'

function updateScriptVersions(fileName: string, scriptSnapshot: tss.IScriptSnapshot, scriptVersions: ScriptVersions) {
  if (scriptVersions.has(fileName)) {
    const current = scriptVersions.get(fileName)!
    if (getFullTextFromSnapshot(current.scriptSnapshot) !== getFullTextFromSnapshot(scriptSnapshot)) {
      scriptVersions.set(fileName, { scriptSnapshot, version: current.version + 1 })
    }
  } else {
    scriptVersions.set(fileName, { scriptSnapshot, version: 0 })
  }
}

export function patchGetScriptSnapshot(context: PluginContext, scriptVersions: ScriptVersions) {
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

      // resolve GLOBAL_TYPE_FILE
      if (fileName === GLOBAL_TYPES_FILE.name) {
        const scriptSnapshot = _ts.ScriptSnapshot.fromString(GLOBAL_TYPES_FILE.content)
        fileEntry.set(fileName, { scriptSnapshot })
        updateScriptVersions(fileName, scriptSnapshot, scriptVersions)
        return scriptSnapshot
      }

      if (!fs.existsSync(fileName)) {
        return undefined
      }
      let content = readSystemFile(fileName)
      if (!content) return undefined

      // transform Vue file
      if (isRawVueFile(fileName)) {
        const snapshot = _ts.ScriptSnapshot.fromString(content)
        fileEntry.set(fileName, { scriptSnapshot: snapshot })
        updateScriptVersions(fileName, snapshot, scriptVersions)
        const { transformedContent } = transformVueFile(fileName, content, sourcemapEntry, _ts)
        virtualFileEntry.set(fileName, transformedContent)
        const transformed = _ts.ScriptSnapshot.fromString(transformedContent)

        updateScriptVersions(toTSVueFIleName(fileName), transformed, scriptVersions)
        // fs.writeFileSync(fileName + '.ts', transformedContent) // for debug
        return transformed
      }

      const scriptSnapshot = _ts.ScriptSnapshot.fromString(content)
      fileEntry.set(fileName, { scriptSnapshot })
      updateScriptVersions(fileName, scriptSnapshot, scriptVersions)
      return scriptSnapshot
    }
  })
}

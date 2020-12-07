import fs from 'fs'
import path from 'path'
import { PluginContext } from '../../context'
import { tryPatchMethod } from '../pathcer'
import { readSystemFile } from '../../../helpers/file'
import { isTSVueFile, toRawVueFileName, GLOBAL_TYPES_FILE, isRawVueFile, toTSVueFIleName, RawVueFileName } from '../../../../../vue-type-audit' // FIXME: use public package

export function patchResolveModuleNames(context: PluginContext) {
  const { fileEntry, sourcemapEntry, virtualFileEntry, projectService, _ts, logger } = context

  const readSystemFileWithFallback = (
    filePath: string,
    encoding?: string | undefined
  ) => {
    return _ts.sys.readFile(filePath, encoding) || readSystemFile(filePath, encoding)
  }

  const moduleResolutionHost: ts.ModuleResolutionHost = {
    fileExists: fileName => {
      let existed = false
      if (isTSVueFile(fileName)) {
        existed = fs.existsSync(toRawVueFileName(fileName))
      } else {
        existed = _ts.sys.fileExists(fileName) || readSystemFile(fileName) !== undefined
      }
      return existed
    },
    readFile: fileName => {
      if (fileName === GLOBAL_TYPES_FILE.name) {
        return GLOBAL_TYPES_FILE.content
      }

      // recover file name
      if (isTSVueFile(fileName)) {
        logger(`reading file: ${fileName}`)
        fileName = toRawVueFileName(fileName)
      }

      // Do not use cache until we figure out how to get text change event
      // if (fileEntry.has(fileName)) {
      //   const snapshot = fileEntry.get(fileName)!.scriptSnapshot
      //   return getFullTextFromSnapshot(snapshot)
      // }
      return readSystemFileWithFallback(fileName)
    },
    realpath: _ts.sys.realpath ? path => {
        return _ts.sys.realpath!(path)
    } : undefined,
    directoryExists: _ts.sys.directoryExists,
    getCurrentDirectory: _ts.sys.getCurrentDirectory,
    getDirectories: _ts.sys.getDirectories
  }


  tryPatchMethod(context.languageServiceHost, 'readFile', delegate => {
    return moduleResolutionHost.readFile
  })

  tryPatchMethod(context.languageServiceHost, 'resolveModuleNames', delegate => {
    return function (moduleNames, containingFile, reusedNames, redirectedReference, options) {
      
      const ret: (ts.ResolvedModule | undefined)[] = moduleNames.map(name => {
        // _logger(`resolving module: ${name}`)
        if (name === GLOBAL_TYPES_FILE.identifier) {
          const resolved: ts.ResolvedModule = {
            resolvedFileName: GLOBAL_TYPES_FILE.name
          }
          return resolved
        }

        if (isRawVueFile(name)) {
          // logger(`resolving module: ${name}`)

          // Register virtual TS file
          // projectService.getOrCreateScriptInfoForNormalizedPath(
          //   _ts.server.toNormalizedPath(toTSVueFIleName(name)),
          //   false
          // )
          // projectService.getOrCreateScriptInfoForNormalizedPath(
          //   _ts.server.toNormalizedPath(name),
          //   false
          // )
          const absPath = path.resolve(path.dirname(containingFile), name) as RawVueFileName
          logger(`resolvedFileName: ${toTSVueFIleName(absPath)}`)
          context.tryCreateScriptInfo(name)
          const resolved: ts.ResolvedModule = {
            resolvedFileName: toTSVueFIleName(absPath)
          }
          return resolved
        }

        const { resolvedModule } = _ts.resolveModuleName(
            name,
            containingFile,
            options,
            moduleResolutionHost
        );
        return resolvedModule
      });
      return ret;
    }
  })
}

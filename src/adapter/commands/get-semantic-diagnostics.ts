import ts from 'typescript'
import { GetSemanticDiagnostics } from '../types'
import { Logger, SourcemapEntry, FileEntry, VirtualFileEntry } from '../../types'
import { isRawVueFile, translateTSVuefileDiagnostic } from 'vue-type-audit'

export function getSemanticDiagnostics(
  delegate: GetSemanticDiagnostics,
  logger: Logger,
  sourcemapEntry: SourcemapEntry,
  fileEntry: FileEntry,
  virtualFileEntry: VirtualFileEntry,
  typeChecker: ts.TypeChecker,
  _ts: typeof ts,
  fileName: string,
): ts.Diagnostic[] {
  logger('Inside getSemanticDiagnostics')
  logger(fileName)

  const diagnostics = delegate(fileName)
  if (!isRawVueFile(fileName)) return diagnostics

  function transformDiagnostic(diagnostic: ts.Diagnostic): ts.Diagnostic {
    const { file } = diagnostic
    console.log('Inspecting diagnostics for: ' + file!.fileName)

    try {
      return translateTSVuefileDiagnostic(diagnostic, sourcemapEntry, typeChecker, _ts, undefined, fileEntry)
    } catch (e) {
      return diagnostic
      // throw e
    }
  }

  return diagnostics.filter(d => !!d.file && isRawVueFile(d.file.fileName)).map(transformDiagnostic)
}

import ts from 'typescript'
import { GetQuickInfoAtPosition } from '../types'
import { Logger, SourcemapEntry, FileEntry, VirtualFileEntry } from '../../types'
import { getGeneratedPositionFor, pos2location, RawVueFileName, location2pos, isRawVueFile, toTSVueFIleName, getFullTextFromSnapshot, getOriginalPositionFor } from 'vue-type-audit'

export function getQuickInfoAtPosition(
  delegate: GetQuickInfoAtPosition,
  logger: Logger,
  sourcemapEntry: SourcemapEntry,
  fileEntry: FileEntry,
  virtualFileEntry: VirtualFileEntry,
  program: ts.Program,
  fileName: string,
  position: number,
): ts.QuickInfo | undefined {
  logger('Inside getQuickInfoAtPosition')
  logger(fileName)
  if (!isRawVueFile(fileName)) return delegate(fileName, position)
  const file = fileEntry.get(fileName)
  if (!file) return delegate(fileName, position)
  const text = getFullTextFromSnapshot(file.scriptSnapshot)
  const loc = pos2location(text, position)

  const generatedPosition = getGeneratedPositionFor(fileName as RawVueFileName, loc, sourcemapEntry)
  const virtualText = virtualFileEntry.get(fileName)
  if (!virtualText) return delegate(fileName, position)
  const virtualPosition = location2pos(virtualText, generatedPosition)
  const result = delegate(fileName, virtualPosition)
  if (!result) return result

  // display on Vue file
  const { textSpan: { start, length } } = result
  const virtualStartLC = pos2location(virtualText, start)
  const virtualEndLC = pos2location(virtualText, start + length)
  const displayStartLc = getOriginalPositionFor(toTSVueFIleName(fileName), virtualStartLC, sourcemapEntry)
  const displayEndLc = getOriginalPositionFor(toTSVueFIleName(fileName), virtualEndLC, sourcemapEntry)
  const displayStartPos = location2pos(text, displayStartLc)
  const displayEndPos = location2pos(text, displayEndLc) 

  return {
    ...result,
    textSpan: {
      start: displayStartPos,
      length: displayEndPos - displayStartPos
    }
  }
}
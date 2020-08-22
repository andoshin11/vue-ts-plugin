import ts from 'typescript'
import { RawSourceMap } from 'source-map'

export type Logger = (msg: any) => void

export type FileEntry = Map<string, { scriptSnapshot: ts.IScriptSnapshot }>

export type SourcemapEntry = Map<string, { map?: RawSourceMap }>

export type VirtualFileEntry = Map<string, string>

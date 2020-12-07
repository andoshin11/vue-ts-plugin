import tss from 'typescript/lib/tsserverlibrary'
import { Logger, FileEntry, SourcemapEntry, VirtualFileEntry } from '../types'
import { isTSVueFile, toRawVueFileName, RawVueFileName } from 'vue-type-audit'
import * as patch from './patch'

export class PluginContext {
  private watchers = new Map<string, Map<string, Set<ts.FileWatcherCallback>>>();

  // will be set lazily after PluginContext.load
  private _projectService!: ts.server.ProjectService
  private _serverHost!: ts.server.ServerHost
  private _languageService!: ts.LanguageService
  private _languageServiceHost!: ts.LanguageServiceHost

  public readonly moduleResolutionHistory = new Map<string, Map<string, string>>();

  public fileEntry: FileEntry = new Map()

  constructor(
    public logger: Logger,
    public virtualFileEntry: VirtualFileEntry,
    public sourcemapEntry: SourcemapEntry,
    public _ts: typeof tss
  ) {}

  load(info: ts.server.PluginCreateInfo) {
    this.logger(`Loading Plugin Context: ${info.project.getProjectName()}`)

    this._serverHost = info.serverHost
    this._projectService = info.project.projectService
    this._languageService = info.languageService
    this._languageServiceHost = info.languageServiceHost

    patch.patchProjectService(this)
    patch.patchServiceHost(this)
    patch.patchLanguageServiceHost(this)
  }

  public get serviceHost() {
    return this._serverHost;
  }

  public get projectService() {
    return this._projectService;
  }

  public get languageServiceHost() {
    return this._languageServiceHost
  }

  public get program() {
    const program = this._languageService.getProgram();
    if (!program) {
      // Program is very very unlikely to be undefined.
      throw new Error('No program in language service!');
    }
    return program;
  }

  /**
   * Watcher
   */

  private getWatchers(fileName: string) {
    this.logger(`getting watchers for ${fileName}`)
    const rawVueFileName = isTSVueFile(fileName) ? toRawVueFileName(fileName) : fileName as RawVueFileName
    if (!this.watchers.has(rawVueFileName)) {
      this.watchers.set(rawVueFileName, new Map())
    }

    return this.watchers.get(rawVueFileName)!
  }

  public watchVirtualFile(fileName: string, callback: ts.FileWatcherCallback) {
    const watchers = this.getWatchers(fileName)
    if (!watchers.has(fileName)) {
      watchers.set(fileName, new Set())
    }

    watchers.get(fileName)!.add(callback)
  }

  public triggerVirtualFileWatchers(fileName: string, baseEvent: ts.FileWatcherEventKind) {
    const watchers = this.getWatchers(fileName)

    if (isTSVueFile(fileName)) {
      if (watchers.has(fileName)) {
        watchers.get(fileName)!.forEach(cb => {
          cb(fileName, baseEvent)
        })
      }
    } else {
      watchers.forEach(cbs => {
        cbs.forEach(cb => {
          cb(fileName, baseEvent)
        })
      })
    }
  }

  public stopVirtualFileWatcher(fileName: string, callback: ts.FileWatcherCallback) {
    const watchers = this.getWatchers(fileName)!.get(fileName);

    if (watchers) {
      watchers.delete(callback);
    }
  }
}

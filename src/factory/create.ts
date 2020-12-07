import tss from 'typescript/lib/tsserverlibrary'
import { createLogger } from '../logger/create'
import { VirtualFileEntry, SourcemapEntry } from '../types'
import { PluginContext } from '../context'
import { Adapter } from '../adapter'
import { LanguageServiceProxyBuilder } from './builder'

export const create = (_ts: typeof tss): tss.server.PluginModule['create'] => (info: tss.server.PluginCreateInfo) => {
  const logger = createLogger(info)
  logger('config: ' + JSON.stringify(info.config))

  const program = info.languageService.getProgram()
  if (!program) {
    throw new Error('There is no TS program on the project!')
  }

  const virtualFileEntry: VirtualFileEntry = new Map()
  const sourcemapEntry: SourcemapEntry = new Map()

  const context = new PluginContext(logger, virtualFileEntry, sourcemapEntry, _ts)
  context.load(info)
  const adapter = new Adapter(context)

  const proxy = new LanguageServiceProxyBuilder(info)
  // .wrap('getCompletionsAtPosition', delegate => adapter.getCompletionAtPosition.bind(adapter, delegate))
  // .wrap('getSyntacticDiagnostics', delegate => adapter.getSyntacticDiagnostics.bind(adapter, delegate))
  .wrap('getSemanticDiagnostics', delegate => adapter.getSemanticDiagnostics.bind(adapter, delegate))
  .wrap('getQuickInfoAtPosition', delegate => adapter.getQuickInfoAtPosition.bind(adapter, delegate))
  .build();

  return proxy;
}

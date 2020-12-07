import { GetQuickInfoAtPosition, GetSemanticDiagnostics, GetSyntacticDiagnostics } from './types'
import * as commands from './commands'
import { PluginContext } from '../context'

type Args<T> = T extends (...args: infer A) => any ? A : never;

export class Adapter {
  constructor(private context: PluginContext) {
  }

  getQuickInfoAtPosition(delegate: GetQuickInfoAtPosition, ...args: Args<GetQuickInfoAtPosition>) {
    const { logger, sourcemapEntry, fileEntry, virtualFileEntry, program } = this.context
    return commands.getQuickInfoAtPosition(delegate, logger, sourcemapEntry, fileEntry, virtualFileEntry, program, ...args)
  }

  getSemanticDiagnostics(delegate: GetSemanticDiagnostics, ...args: Args<GetSemanticDiagnostics>) {
    const { logger, sourcemapEntry, program, _ts, fileEntry, virtualFileEntry } = this.context
    return commands.getSemanticDiagnostics(delegate, logger, sourcemapEntry, fileEntry, virtualFileEntry,  program.getTypeChecker(), _ts, ...args)
  }

  getSyntacticDiagnostics(delegate: GetSyntacticDiagnostics, ...args: Args<GetSyntacticDiagnostics>) {
    const { logger } = this.context
    return commands.getSyntacticDiagnostics(delegate, logger, ...args)
  }
}

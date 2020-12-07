import ts from 'typescript'
import { GetSyntacticDiagnostics } from '../types'
import { Logger } from '../../types'

export function getSyntacticDiagnostics(
  delegate: GetSyntacticDiagnostics,
  logger: Logger,
  fileName: string,
) {
  logger('Inside getSyntacticDiagnostics')
  logger(fileName)
  const diagnostics = delegate(fileName)
  diagnostics.forEach(d => {
    const summary = {
      fileName: d.file.fileName,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n')
    }
    logger(JSON.stringify(summary))
  })
  return diagnostics
}

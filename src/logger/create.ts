import tss from 'typescript/lib/tsserverlibrary'
import { Logger } from '../types'

export const createLogger = (info: tss.server.PluginCreateInfo): Logger => msg => {
  info.project.projectService.logger.info(`[vue-ts] ${msg}`)
}

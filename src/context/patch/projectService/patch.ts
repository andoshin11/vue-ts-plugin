import ts from 'typescript/lib/tsserverlibrary';
import { PluginContext } from '../../context'
import { tryPatchMethod } from '../pathcer'

export function patchProjectService(context: PluginContext) {
  patchExtraFileExtensions(context);
}

function patchExtraFileExtensions(context: PluginContext) {
  const extraFileExtensions: ts.server.HostConfiguration['extraFileExtensions'] = [
    { extension: 'vue', isMixedContent: false, scriptKind: context._ts.ScriptKind.Deferred },
  ];

  tryPatchMethod(context.projectService, 'setHostConfiguration', delegate => {
    context.logger(`[patch] Add support for vue extension. (ProjectService)`)
    return args => {
      const current = ((context.projectService as any).hostConfiguration as ts.server.HostConfiguration)
      .extraFileExtensions;

      if (args.extraFileExtensions) {
        args.extraFileExtensions.push(...extraFileExtensions);
        context.logger(`extraFileExtensions: ${JSON.stringify(args.extraFileExtensions)}`);
      } else if (!current || !current.some(ext => ext.extension === 'vue')) {
        args.extraFileExtensions = [...extraFileExtensions];
      }

      return delegate(args)
    }
  })

  const _extraFileExtensions = ((context.projectService as any).hostConfiguration as ts.server.HostConfiguration).extraFileExtensions

  if (_extraFileExtensions && _extraFileExtensions.some(ext => ext.extension === 'vue')) {
    return;
  }

  // Enable .vue after enhancing the language server.
  context.projectService.setHostConfiguration({ extraFileExtensions: [] });
}

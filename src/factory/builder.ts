import tss from 'typescript/lib/tsserverlibrary';

type LanguageServiceMethodWrapper<K extends keyof tss.LanguageService> = (
  delegate: tss.LanguageService[K],
  info?: tss.server.PluginCreateInfo,
) => tss.LanguageService[K];

export class LanguageServiceProxyBuilder {
  private _wrappers: any[] = [];

  constructor(private _info: tss.server.PluginCreateInfo) {}

  wrap<K extends keyof tss.LanguageService, Q extends LanguageServiceMethodWrapper<K>>(name: K, wrapper: Q) {
    this._wrappers.push({ name, wrapper });
    return this;
  }

  build(): tss.LanguageService {
    const ret = this._info.languageService;
    this._wrappers.forEach(({ name, wrapper }) => {
      (ret as any)[name] = wrapper(this._info.languageService[name as keyof tss.LanguageService], this._info);
    });
    return ret;
  }
}

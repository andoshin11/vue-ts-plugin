import ts from 'typescript'

export type GetQuickInfoAtPosition = ts.LanguageService['getQuickInfoAtPosition']
export type GetSemanticDiagnostics = ts.LanguageService['getSemanticDiagnostics']
export type GetSyntacticDiagnostics = ts.LanguageService['getSyntacticDiagnostics']

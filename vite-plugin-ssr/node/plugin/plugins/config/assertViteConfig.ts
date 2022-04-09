export { assertViteConfig }
export { assertAndMergeUserInput }
export type { VpsConfig }

import { assert, assertUsage, hasProp, isObject } from '../../../utils'

type VpsConfig = {
  pageFiles?: { include?: string[] }
  prerender?:
    | boolean
    | {
        partial?: boolean
        noExtraDir?: boolean
        parallel?: number
      }
  disableBuildChaining?: boolean
}

function assertAndMergeUserInput(fromPluginOptions: unknown, fromViteConfig: unknown): VpsConfig {
  assertVpsConfig(
    fromPluginOptions,
    (configName: string, configNameInObject: string) =>
      `[vite.config.js][\`ssr({ ${configNameInObject} })\`] \`${configName}\``,
  )
  assertVpsConfig(fromViteConfig, (configName: string) => `vite.config.js#vitePluginSsr.${configName}`)
  const vitePluginSsr: VpsConfig = {}

  vitePluginSsr.disableBuildChaining =
    fromPluginOptions.disableBuildChaining ?? fromViteConfig.disableBuildChaining ?? false

  vitePluginSsr.prerender = false
  if (fromPluginOptions.prerender || fromViteConfig.prerender) {
    const prerenderUserOptions = typeof fromPluginOptions.prerender === 'boolean' ? {} : fromPluginOptions.prerender ?? {}
    const prerenderViteConfig = typeof fromViteConfig.prerender === 'boolean' ? {} : fromViteConfig.prerender ?? {}
    vitePluginSsr.prerender = {
      partial: prerenderUserOptions.partial ?? prerenderViteConfig.partial ?? false,
      noExtraDir: prerenderUserOptions.noExtraDir ?? prerenderViteConfig.noExtraDir ?? false,
      parallel: prerenderUserOptions.parallel ?? prerenderViteConfig.parallel ?? undefined,
    }
  }

  vitePluginSsr.pageFiles = {
    include: [...(fromPluginOptions.pageFiles?.include ?? []), ...(fromViteConfig.pageFiles?.include ?? [])],
  }

  assertVpsConfig(vitePluginSsr, null)
  return vitePluginSsr
}

function assertVpsConfig(
  vitePluginSsr: unknown,
  userInputFormat: null | ((configName: string, configNameInObject: string) => string),
): asserts vitePluginSsr is VpsConfig {
  assert(isObject(vitePluginSsr))
  assertConfig(
    'disableBuildChaining',
    'should be a boolean (or undefined)',
    hasProp(vitePluginSsr, 'disableBuildChaining', 'boolean') ||
      hasProp(vitePluginSsr, 'disableBuildChaining', 'undefined'),
  )
  assertPageFilesConfig(vitePluginSsr)
  assertPrerenderConfig(vitePluginSsr)

  return

  function assertPrerenderConfig(
    vitePluginSsr: Record<string, unknown>,
  ): asserts vitePluginSsr is Pick<VpsConfig, 'prerender'> {
    assertConfig(
      'prerender',
      'should be an object or a boolean',
      hasProp(vitePluginSsr, 'prerender', 'object') ||
        hasProp(vitePluginSsr, 'prerender', 'boolean') ||
        hasProp(vitePluginSsr, 'prerender', 'undefined'),
    )

    const prerender = vitePluginSsr.prerender ?? {}
    if (prerender && typeof prerender !== 'boolean') {
      assertConfig(
        'prerender.partial',
        'should be a boolean (or undefined)',
        hasProp(prerender, 'partial', 'undefined') || hasProp(prerender, 'partial', 'boolean'),
      )
      assertConfig(
        'prerender.noExtraDir',
        'should be a boolean (or undefined)',
        hasProp(prerender, 'noExtraDir', 'undefined') || hasProp(prerender, 'noExtraDir', 'boolean'),
      )
      assertConfig(
        'prerender.parallel',
        'should be a number (or undefined)',
        hasProp(prerender, 'parallel', 'undefined') || hasProp(prerender, 'parallel', 'number'),
      )
    }
  }

  function assertPageFilesConfig(
    vitePluginSsr: Record<string, unknown>,
  ): asserts vitePluginSsr is Pick<VpsConfig, 'pageFiles'> {
    assertConfig(
      'pageFiles',
      'should be an object (or undefined)',
      hasProp(vitePluginSsr, 'pageFiles', 'undefined') || hasProp(vitePluginSsr, 'pageFiles', 'object'),
    )
    if (!vitePluginSsr.pageFiles) {
      return
    }
    if (vitePluginSsr.pageFiles?.include !== undefined) {
      assertConfig(
        'pageFiles.include',
        'should be a string array (or undefined)',
        hasProp(vitePluginSsr.pageFiles, 'include', 'string[]'),
      )
    }
  }

  function assertConfig(configName: string, errMsg: string, condition: boolean): asserts condition {
    if (!userInputFormat) {
      assert(condition)
    } else {
      const configPath = configName.split('.')
      assert(configPath.length <= 2)
      const configNameInObject = configPath.length === 2 ? `${configPath[0]}: { ${configPath[1]} }` : configName
      assertUsage(condition, `${userInputFormat(configName, configNameInObject)} ${errMsg}`)
    }
  }
}

function assertViteConfig<T extends Record<string, unknown>>(
  viteConfig: T,
): asserts viteConfig is T & { vitePluginSsr: VpsConfig } {
  assert(hasProp(viteConfig, 'vitePluginSsr', 'object'))
  const { vitePluginSsr } = viteConfig
  assertVpsConfig(vitePluginSsr, null)
}
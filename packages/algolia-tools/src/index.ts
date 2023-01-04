import type {
  IndexInterface,
  IndexConstructor,
  AlgoliaToolsModule,
  ExPluginInput,
  ExPlugin,
} from './types'
import {
  AlgoliaIndexManager,
  AlgoliaIndexManagerInternal,
} from './util/AlgoliaIndexManager'
export { default as AlgoliaProjectManager } from './util/AlgoliaProjectManager'

export {
  IndexInterface,
  IndexConstructor,
  AlgoliaIndexManager,
  ExPluginInput,
  ExPlugin,
  AlgoliaToolsModule,
}

type ExtractPluginType<P extends ExPlugin<any, any>> = {
  [key in P['id']]: P['prototype']
}

type ExtractPluginsType<P extends ExPluginInput<any, any>[]> = {
  [index in Extract<keyof P, number>]: P[index] extends Exclude<
    P[index],
    Array<any>
  >
    ? ExtractPluginType<P[index]>
    : P[index] extends Extract<P[index], Array<any>>
    ? ExtractPluginType<P[index][0]>
    : Record<string, any>
}[number]

export default <Plugins extends ExPluginInput<any, any>[]>(
  args: AlgoliaIndexManagerInternal,
  indices: {
    [collectionName: string]: IndexConstructor<ExtractPluginsType<Plugins>>
  },
  option?: { plugins?: Plugins }
): AlgoliaToolsModule<ExtractPluginsType<Plugins>> => {
  const algoliaIndexManager = new AlgoliaIndexManager(args)
  const exInstances = option?.plugins?.reduce((current, pluginClass) => {
    const [_pluginClass, config = {}] = Array.isArray(pluginClass)
      ? pluginClass
      : [pluginClass]
    return {
      ...current,
      [_pluginClass.id]: new _pluginClass({ algoliaIndexManager, ...config }),
    }
  }, {})
  return {
    algoliaIndexManager,
    indices: Object.keys(indices).reduce((result, index) => {
      return {
        ...result,
        [index]: new indices[index]({
          algoliaIndexManager: algoliaIndexManager,
          ...exInstances,
        }),
      }
    }, {}),
    ...exInstances,
  }
}

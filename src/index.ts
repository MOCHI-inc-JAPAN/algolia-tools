import type {
  IndexInterface,
  IndexConstructor,
  AlgoliaToolsModule,
  ExPlugin,
} from './types'
import {
  AlgoliaIndexManager,
  AlgoliaIndexManagerInternal,
} from './util/AlgoliaIndexManager'
export { default as AlgoliaProjectManager } from './util/AlgoliaProjectManager'
import FirebaseInvoke from './plugin/FirebaseInvoke'

export { IndexInterface, IndexConstructor, AlgoliaIndexManager, FirebaseInvoke }

type ExtractPluginType<P extends ExPlugin<any, any>[]> = {
  [index in Extract<keyof P, number>]: {
    [key in P[index]['id']]: P[index]['prototype']
  }
}[number]

export default <Plugins extends ExPlugin<any, any>[]>(
  args: AlgoliaIndexManagerInternal,
  indices: {
    [collectionName: string]: IndexConstructor<ExtractPluginType<Plugins>>
  },
  option?: { plugins?: Plugins }
): AlgoliaToolsModule & ExtractPluginType<Plugins> => {
  const algoliaManager = new AlgoliaIndexManager(args)
  const exInstances = option?.plugins?.reduce((current, pluginClass) => {
    return {
      ...current,
      [pluginClass.id]: new pluginClass(algoliaManager),
    }
  }, {})
  return {
    algoliaManager,
    indices: Object.keys(indices).reduce((result, index) => {
      return {
        ...result,
        [index]: new indices[index]({
          algoliaManager: algoliaManager,
          ...exInstances,
        }),
      }
    }, {}),
    ...exInstances,
  }
}

export { createAlgoliaCommanderPlugin } from './generate-commands/algolia'
export { createFirestoreCommanderPlugin } from './plugin/generate-commands/firestore'

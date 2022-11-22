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
import FirebaseInvoke from './plugin/FirebaseInvoke'

export { IndexInterface, IndexConstructor, AlgoliaIndexManager, FirebaseInvoke }

export default <Plugins extends ExPlugin<any, any>[]>(
  args: AlgoliaIndexManagerInternal,
  indices: {
    [collectionName: string]: IndexConstructor
  },
  option?: { plugins?: Plugins }
): AlgoliaToolsModule &
  {
    [index in Extract<keyof Plugins, number>]: {
      [key in Plugins[index]['id']]: Plugins[index]['prototype']
    }
  }[number] => {
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
export { createFirestoreCommanderPlugin } from './generate-commands/firestore'

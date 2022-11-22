import type {
  IndexInterface,
  IndexConstructor,
  AlgoliaToolsModule,
} from './types'
import {
  AlgoliaIndexManager,
  AlgoliaIndexManagerInternal,
} from './util/AlgoliaIndexManager'
import FirebaseInvoke from './plugin/FirebaseInvoke'

export { IndexInterface, IndexConstructor, AlgoliaIndexManager, FirebaseInvoke }

export default (
  args: AlgoliaIndexManagerInternal,
  indices: {
    [collectionName: string]: IndexConstructor
  }
): AlgoliaToolsModule => {
  const algoliaManager = new AlgoliaIndexManager(args)
  return {
    algoliaManager,
    indices: Object.keys(indices).reduce((result, index) => {
      return {
        ...result,
        [index]: new indices[index]({
          algoliaManager: algoliaManager,
        }),
      }
    }, {}),
  }
}

export { createAlgoliaCommanderPlugin } from './generate-commands/algolia'
export { createFirestoreCommanderPlugin } from './generate-commands/firestore'

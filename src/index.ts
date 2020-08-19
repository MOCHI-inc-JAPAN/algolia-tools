import type {
  IndexInterface,
  IndexConstructor,
  AlgoliaToolsModule,
} from './types'
import {
  AlgoliaIndexManager,
  AlgoliaIndexManagerInternal,
} from './util/AlgoliaIndexManager'

export { IndexInterface, IndexConstructor, AlgoliaIndexManager }

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

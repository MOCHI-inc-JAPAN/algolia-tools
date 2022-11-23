import algoliaModule from '../../account/algoliaAccount'
import AlgoliaProjectManager from '../../../src/util/AlgoliaProjectManager'
import { createAlgoliaCommanderPlugin } from '../../../src/generate-commands/algolia'

const algoliaTasks = new AlgoliaProjectManager(algoliaModule)

export default createAlgoliaCommanderPlugin(algoliaTasks)

import algoliasearch from 'algoliasearch'
import algoliaManager from '../../src'
import { IndexConstructor } from '../../src/types'
import { getConfigFromPackageJson, Config } from '../../src/util/configParser'
import { ALGOLIA_ID, ALGOLIA_ADMIN_KEY, INDEX_NAMESPACE } from '../const'
import * as path from 'path'

type AlgoliaProjectModule = {
  [collectionName: string]: IndexConstructor
}

const cwd = process.cwd()
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: Required<Config> | Error = getConfigFromPackageJson(cwd)

if (config instanceof Error) throw config

// eslint-disable-next-line @typescript-eslint/no-var-requires
const algoliaProjectModule: AlgoliaProjectModule = require(path.join(
  __dirname,
  config.orgModulePath
)).default

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY)

export default algoliaManager(
  {
    client,
    indexNamespace: INDEX_NAMESPACE || '',
  },
  algoliaProjectModule
)

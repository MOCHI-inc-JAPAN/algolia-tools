import algoliasearch from 'algoliasearch'
import algoliaManager, {
  IndexConstructor,
  ExPlugin,
} from '@mochi-inc-japan/algolia-tools'
import { getConfigFromPackageJson, Config } from '../../src/utils/configParser'
import { CommanderPlugin } from '../../src/'
import { ALGOLIA_ID, ALGOLIA_ADMIN_KEY, INDEX_NAMESPACE } from './const'
import * as path from 'path'
import { existsSync } from 'fs'

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

let plugins = undefined
let commanderPlugins: CommanderPlugin[] | undefined = undefined
const configPath = path.resolve(
  cwd,
  config.configPath || 'algolia-tools.config.js'
)

if (existsSync(configPath)) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const configPlugins: {
    plugins: ExPlugin<any, any>[] | undefined
    commanderPlugins: CommanderPlugin[] | undefined
  } = require(configPath)
  if (configPlugins.plugins) {
    plugins = {
      plugins: configPlugins.plugins,
    }
  }
  if (configPlugins.commanderPlugins) {
    commanderPlugins = configPlugins?.commanderPlugins
  }
}

commanderPlugins?.forEach((p) => {
  if (typeof p.onInit === 'function') {
    p.onInit()
  }
})

export default algoliaManager(
  {
    client,
    indexNamespace: INDEX_NAMESPACE || '',
  },
  algoliaProjectModule,
  plugins
)

export { commanderPlugins }

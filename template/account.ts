import algoliasearch from 'algoliasearch'
import algoliaFirebaseManager from '../src'
import { IndexManagerConstructor } from '../src/types'
import admin from 'firebase-admin'
import path from 'path'
import { getConfigFromPackageJson, Config } from '../src/util/configParser'

type AlgoliaProjectModule = {
  [collectionName: string]: IndexManagerConstructor
}

const cwd = process.cwd()
const config: Required<Config> | Error = await getConfigFromPackageJson(
  cwd
).catch((e) => e)

if (config instanceof Error) throw config

// TODO: enable user to specify path each
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount: admin.ServiceAccount = require(path.join(
  cwd,
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || config.firebaseServiceAccountPath
)) as admin.ServiceAccount

const algoliaProjectModule: AlgoliaProjectModule = await import(
  config.modulePath
)

export const ALGOLIA_ID = process.env.ALGOLIA_ID || ''
export const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || ''
export const PROJECT_ID = serviceAccount.projectId
export const ALGOLIA_SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
})

admin.firestore().settings({
  timestampsInSnapshots: true,
})

export const indexNamespace =
  process.env.INDEX_NAMESPACE || `${serviceAccount.projectId}_`

export default algoliaFirebaseManager(
  {
    admin,
    client,
    indexNamespace,
  },
  algoliaProjectModule
)

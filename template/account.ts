import algoliasearch from 'algoliasearch'
import algoliaFirebaseManager from '../src'
import { IndexConstructor } from '../src/types'
import * as admin from 'firebase-admin'
import * as path from 'path'
import { getConfigFromPackageJson, Config } from '../src/util/configParser'

type AlgoliaProjectModule = {
  [collectionName: string]: IndexConstructor
}

const cwd = process.cwd()
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: Required<Config> | Error = getConfigFromPackageJson(cwd)

if (config instanceof Error) throw config

// TODO: enable user to specify path each

const useFirebaseAccount =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || config.firebaseServiceAccountPath

let serviceAccount: admin.ServiceAccount | undefined
if (useFirebaseAccount) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  serviceAccount = require(path.join(
    cwd,
    useFirebaseAccount
  )) as admin.ServiceAccount

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
  })

  admin.firestore().settings({
    timestampsInSnapshots: true,
  })
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const algoliaProjectModule: AlgoliaProjectModule = require(path.join(
  __dirname,
  config.orgModulePath
))

export const ALGOLIA_ID = process.env.ALGOLIA_ID || ''
export const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || ''
export const PROJECT_ID = serviceAccount && serviceAccount.projectId
export const ALGOLIA_SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY)

export const indexNamespace =
  process.env.INDEX_NAMESPACE ||
  (serviceAccount && `${serviceAccount.projectId}_`) ||
  ''

export default algoliaFirebaseManager(
  {
    admin,
    client,
    indexNamespace,
  },
  algoliaProjectModule
)

import algoliasearch from 'algoliasearch'
// TODO: serviceAccountをどこからでも読めるようにする
import algoliaFirebaseManager from '../src'
import admin from 'firebase-admin'
import path from 'path'

// TODO: enable user to specify path each
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount: admin.ServiceAccount = require(path.join(
  process.cwd(),
  'firebase-services.json'
)) as admin.ServiceAccount

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
  // TODO: enable user to specify path
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../hogehoge')
)

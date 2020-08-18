import * as admin from 'firebase-admin'
import { getConfigFromPackageJson, Config } from '../../src/util/configParser'
import * as path from 'path'

const cwd = process.cwd()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: Required<Config> | Error = getConfigFromPackageJson(cwd)

if (config instanceof Error) throw config

export const useFirebaseAccount =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || config.firebaseServiceAccountPath

let serviceAccount: admin.ServiceAccount | undefined
export const PROJECT_ID = serviceAccount && serviceAccount.project_id
if (useFirebaseAccount) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  serviceAccount = require(path.join(
    cwd,
    useFirebaseAccount
  )) as admin.ServiceAccount

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  })

  admin.firestore().settings({
    timestampsInSnapshots: true,
  })
}

export default admin

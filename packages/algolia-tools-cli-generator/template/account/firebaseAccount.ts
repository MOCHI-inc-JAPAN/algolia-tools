/* eslint-disable @typescript-eslint/no-var-requires */
import * as admin from 'firebase-admin'
import { getConfigFromPackageJson, Config } from '../../src/util/configParser'
import * as path from 'path'

const cwd = process.cwd()

const config: Required<Config> | Error = getConfigFromPackageJson(cwd)

if (config instanceof Error) throw config

export const useFirebaseAccount =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || config.firebaseServiceAccountPath

type ServiceAccountJson = {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
}
let PROJECT_ID: undefined | string = undefined
if (useFirebaseAccount) {
  const serviceAccount:
    | admin.ServiceAccount
    | ServiceAccountJson
    | undefined = require(path.join(
    cwd,
    useFirebaseAccount
  )) as admin.ServiceAccount
  if (serviceAccount && (serviceAccount as ServiceAccountJson).project_id) {
    PROJECT_ID = (serviceAccount as ServiceAccountJson).project_id
  }
  if (serviceAccount && (serviceAccount as admin.ServiceAccount).projectId) {
    PROJECT_ID = (serviceAccount as admin.ServiceAccount).projectId
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: `https://${PROJECT_ID}.firebaseio.com`,
  })

  admin.firestore().settings({
    timestampsInSnapshots: true,
  })
}

export default admin

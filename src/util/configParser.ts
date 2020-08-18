import * as path from 'path'
import { existsSync } from 'fs'

const FIELD = 'aftools'
const PACKAGE_JSON = 'package.json'

export type Config = {
  packageName: string
  firebaseServiceAccountPath?: string
  modulePath: string
  out?: string
  orgModulePath: string
}

export const getConfigFromPackageJson = (
  dir: string
): Required<Config> | Error => {
  const packageJsonPath = path.join(dir, PACKAGE_JSON)
  if (!existsSync(packageJsonPath)) {
    return Error('package.json does not exist on root directory')
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(packageJsonPath)[FIELD]
  if (!config) {
    return Error(`"${FIELD}" property does not exist on package.json`)
  }
  const modulePath = path.join(dir, config.modulePath)
  const firebaseServiceAccountPath = config.firebaseServiceAccountPath
    ? path.join(dir, config.firebaseServiceAccountPath)
    : ''
  const out = path.join(dir, config.out || 'bin')
  if (!modulePath) {
    return Error(`"${modulePath}" property does not exist on package.json`)
  }
  return {
    packageName: config.name,
    modulePath,
    firebaseServiceAccountPath,
    out,
    orgModulePath: config.modulePath,
  }
}

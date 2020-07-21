import path from 'path'
import { existsSync } from 'fs'

const FIELD = 'aftools'
const PACKAGE_JSON = 'package.json'

export type Config = {
  firebaseServiceAccountPath?: string
  modulePath: string
  out?: string
}

export const getConfigFromPackageJson = async (
  dir: string
): Promise<Required<Config> | Error> => {
  const packageJsonPath = path.join(dir, PACKAGE_JSON)
  if (!existsSync(packageJsonPath)) {
    return Error('package.json does not exist on root directory')
  }
  const config = (await import(packageJsonPath))[FIELD]
  if (!config) {
    return Error(`"${FIELD}" property does not exist on package.json`)
  }
  const modulePath = path.join(dir, config.modulePath)
  const firebaseServiceAccountPath =
    path.join(dir, config.firebaseServiceAccountPath) || ''
  const out = path.join(dir, config.out || 'bin')
  if (!modulePath) {
    return Error(`"${modulePath}" property does not exist on package.json`)
  }
  return {
    modulePath,
    firebaseServiceAccountPath,
    out,
  }
}

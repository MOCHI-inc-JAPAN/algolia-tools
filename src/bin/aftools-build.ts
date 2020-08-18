#!/usr/bin/env node

import { getConfigFromPackageJson } from '../util/configParser'
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

let packageName = '@mochi-inc-japan/algolia-firebase-tools'

if (!fs.existsSync(path.join(process.cwd(), 'node_modules', packageName))) {
  packageName = 'algolia-firebase-tools'
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules', packageName)))
    throw Error('package path wrong')
}

const config = getConfigFromPackageJson(process.cwd())

if (config instanceof Error) {
  console.error(config.message)
  process.exit(1)
}
execSync(
  `npx tsc -p ./node_modules/${packageName}/template --outDir ${config.out}`
)
execSync(
  `npx tsc ${path.join(
    config.modulePath,
    fs.lstatSync(config.modulePath).isDirectory() ? 'index' : ''
  )} --module CommonJs --outDir ${path.join(
    config.out,
    'template/account',
    config.orgModulePath
  )}`
)

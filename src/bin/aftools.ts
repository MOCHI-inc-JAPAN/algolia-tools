#!/usr/bin/env node

import * as program from 'commander'
import { getConfigFromPackageJson } from '../util/configParser'
import * as path from 'path'
import * as fs from 'fs'
import * as dotenv from 'dotenv'

const config = getConfigFromPackageJson(process.cwd())
if (config instanceof Error) {
  console.error(config.message)
  process.exit(1)
}
const execRoot = process.cwd()

if (config.envFile) {
  const envPath = path.resolve(execRoot, config.envFile)
  dotenv.config({
    path: envPath,
  })
} else {
  if (fs.existsSync(path.resolve(execRoot, '.env'))) {
    dotenv.config()
  }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
require(path.join(config.out, 'template')).default(program)

program.parse(process.argv)
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

#!/usr/bin/env node

import * as program from 'commander'
import { getConfigFromPackageJson } from '../util/configParser'
import * as path from 'path'

const config = getConfigFromPackageJson(process.cwd())
if (config instanceof Error) {
  console.error(config.message)
  process.exit(1)
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
require(path.join(config.out, 'template'))(program)

process.exit()

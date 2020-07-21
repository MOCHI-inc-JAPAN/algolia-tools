#!/usr/bin/env node

import program from 'commander'
import path from 'path'
import { generate } from '../lib/generate'
import { watch } from '../lib/watch'
import { getConfigFromPackageJson, Config } from '../util/configParser'

program.option('-w, --watch', 'watch file change').parse(process.argv)

getConfigFromPackageJson(process.cwd()).then(async (config) => {
  if (config instanceof Error) {
    console.error(config.message)
    process.exit(1)
  }
  ;(await import(config.out)).default()

  process.exit()
})

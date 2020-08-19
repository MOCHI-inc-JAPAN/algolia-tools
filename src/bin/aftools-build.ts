#!/usr/bin/env node

import { getConfigFromPackageJson } from '../util/configParser'
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import { getReadFileName } from '../util/fileUtility'

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
let out = execSync(
  `npx tsc -p ./node_modules/${packageName}/template --outDir ${config.out}`
)

console.log(out.toString())

const compile = (dfiles: string[] = []) => {
  return `npx tsc ${path.join(
    config.modulePath,
    fs.lstatSync(config.modulePath).isDirectory() ? 'index' : ''
  )} --module CommonJs --outDir ${path.join(
    config.out,
    'template/account'
  )} --rootDir ${process.cwd()} ${process.argv
    .slice(2)
    .join(' ')} ${dfiles.join(' ')}`
}

if (config.dFiles) {
  getReadFileName(config.dFiles, [/.d.ts$/]).then((files) => {
    const script = compile(files)
    console.log(script)
    out = execSync(script)
    console.log(out.toString())
  })
} else {
  const script = compile()
  console.log(script)
  out = execSync(script)
}

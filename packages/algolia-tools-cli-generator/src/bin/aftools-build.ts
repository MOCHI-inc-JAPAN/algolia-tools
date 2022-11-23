#!/usr/bin/env node

import { Config, getConfigFromPackageJson } from '../configParser'
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import { getReadFileName } from '../fileUtility'

let packageName = '@mochi-inc-japan/algolia-tools-cli-generator'

// TODO: node_modulesを使うのはyarnでは非推奨になるのでそのうち対応する

if (!fs.existsSync(path.join(process.cwd(), 'node_modules', packageName))) {
  packageName = 'algolia-tools-cli-generator'
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules', packageName)))
    throw Error('package path wrong')
}

const config = getConfigFromPackageJson(process.cwd())

if (config instanceof Error) {
  console.error(config.message)
  process.exit(1)
}

const argsParse = (args: string[]) => {
  return args.filter((v) => v !== '--verbose')
}

const compile = (config: Required<Config>, dfiles: string[] = []) => {
  return `npx tsc ${path.join(
    config.modulePath,
    fs.lstatSync(config.modulePath).isDirectory() ? 'index' : ''
  )} --module CommonJs --outDir ${path.join(
    config.out,
    'template/account'
  )} --rootDir ${process.cwd()} ${argsParse(process.argv)
    .slice(2)
    .join(' ')} ${dfiles.join(' ')}`
}

const isVerbose = process.argv.some((v) => v === '--verbose')

if (isVerbose) {
  console.log(`config: \n${JSON.stringify(config, null, 2)}`)
}

let out = execSync(
  `npx tsc -p ${process.cwd()}/node_modules/${packageName}/template --outDir ${
    config.out
  }`
)

console.log(out.toString())

if (config.dFiles) {
  getReadFileName(config.dFiles, [/^\./, /.d.ts$/]).then((files) => {
    const script = compile(config, files)
    if (isVerbose) {
      console.log(`script: ${script}`)
    }
    out = execSync(script)
    console.log(out.toString())
  })
} else {
  const script = compile(config)
  if (isVerbose) {
    console.log(`script: ${script}`)
  }
  out = execSync(script)
}

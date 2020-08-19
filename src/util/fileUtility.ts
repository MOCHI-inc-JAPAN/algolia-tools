import * as path from 'path'
import * as fs from 'fs'

export async function* getFiles(
  dir: string,
  match?: RegExp[]
): AsyncGenerator<string> {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res, match)
    } else {
      if (match && !match.some((cond) => dirent.name.match(cond))) {
        continue
      }
      yield res
    }
  }
}

export async function getReadFileName(
  dirs: string[],
  match?: RegExp[]
): Promise<string[]> {
  const result: string[] = []
  for (const dir of dirs) {
    if (fs.statSync(dir).isFile()) {
      if (!match || match.some((cond) => dir.match(cond)))
        result.push(path.resolve(dir))
    } else {
      for await (const fileName of getFiles(dir, match)) {
        result.push(fileName)
      }
    }
  }
  return result
}

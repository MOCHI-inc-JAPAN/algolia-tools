import { getReadFileName } from './fileUtility'
import * as path from 'path'

describe('readFileName', () => {
  it('success', async () => {
    const result = await getReadFileName(
      ['fixtures'].map((v) => path.resolve(__dirname, '../../', v))
    )
    expect(result.sort()).toEqual(
      ['hierarchy/fake.d.ts', 'file.d.ts', 'invalidfile.txt']
        .map(
          (v) =>
            `${path.resolve(__dirname, '../../', 'fixtures/exampleFiles', v)}`
        )
        .sort()
    )
  })
  it('success with condition', async () => {
    const result = await getReadFileName(
      ['fixtures'].map((v) => path.resolve(__dirname, '../../', v)),
      [/.d.ts$/]
    )
    expect(result.sort()).toEqual(
      ['hierarchy/fake.d.ts', 'file.d.ts']
        .map(
          (v) =>
            `${path.resolve(__dirname, '../../', 'fixtures/exampleFiles', v)}`
        )
        .sort()
    )
  })
  it('success with specified file', async () => {
    const result = await getReadFileName(
      [
        'fixtures/exampleFiles/hierarchy',
        'fixtures/exampleFiles/file.d.ts',
        'fixtures/exampleFiles/invalidfile.txt',
      ].map((v) => path.resolve(__dirname, '../../', v)),
      [/.d.ts$/]
    )
    expect(result.sort()).toEqual(
      ['hierarchy/fake.d.ts', 'file.d.ts']
        .map(
          (v) =>
            `${path.resolve(__dirname, '../../', 'fixtures/exampleFiles', v)}`
        )
        .sort()
    )
  })
})

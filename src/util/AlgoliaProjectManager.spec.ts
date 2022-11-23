const writeFileMock = jest.fn().mockResolvedValue('test')
jest.mock('fs', () => ({
  promises: {
    writeFile: writeFileMock,
    readFile: jest.requireActual('fs').promises.readFile,
  },
  readdirSync: jest.requireActual('fs').readdirSync,
  readFileSync: jest.requireActual('fs').readFileSync,
  readFile: jest.requireActual('fs').readFile,
  writeFile: jest
    .fn()
    .mockImplementation((path: string, file: any, _callback: any) => {
      return { path, file: JSON.stringify(file) }
    }),
}))

import * as fs from 'fs'

import { Settings } from '@algolia/client-search'
import algoliaSearch from 'algoliasearch'
import * as path from 'path'
import indices from '../mock/indexManagers'
import { AlgoliaIndexManager } from './AlgoliaIndexManager'
import AlgoliaProjectManager from './AlgoliaProjectManager'

describe('provisionAlgoliaIndexAll', () => {
  it('apply namespace json', async () => {
    const clientMock = algoliaSearch('dummy', 'dummy')
    const algoliaIndexManager = new AlgoliaIndexManager({
      client: clientMock,
      indexNamespace: 'namespace_',
    })
    const invoker = new AlgoliaProjectManager({
      algoliaIndexManager,
      indices: Object.keys(indices).reduce((result, index) => {
        return {
          ...result,
          [index]: new (indices as any)[index]({
            algoliaIndexManager: algoliaIndexManager,
          }) as any,
        }
      }, {}),
      indexConfigDir: path.resolve('./src/fixtures/local'),
    })
    await invoker.provisionAlgoliaIndexAll()
    expect(clientMock.initIndex).toBeCalledWith('namespace_hasprimary')
    expect(clientMock.initIndex).toBeCalledWith('namespace_hasreplicas')
    expect(clientMock.initIndex).toBeCalledWith('namespace_normal')
    expect(clientMock.initIndex('dummy').setSettings).toBeCalledWith({
      dummy: 'dummy',
    })
    expect(clientMock.initIndex('dummy').setSettings).toBeCalledWith({
      dummy: 'dummy',
      replicas: ['namespace_replica_1', 'namespace_replica_2'],
    })
    expect(clientMock.initIndex('dummy').setSettings).toBeCalledWith({
      dummy: 'dummy',
      primary: 'namespace_replica',
    })
  })
})

describe('provisionAlgoliaIndexAll', () => {
  it('replaced namespace json', async () => {
    const clientMock = algoliaSearch('dummy', 'dummy')
    const algoliaIndexManager = new AlgoliaIndexManager({
      client: clientMock,
      indexNamespace: 'namespace_',
    })

    jest
      .spyOn(algoliaIndexManager, 'getIndexSetting')
      .mockImplementation(async () => {
        const remoteFileDir = path.resolve('./src/fixtures/local')
        const files = fs.readdirSync(remoteFileDir)
        return files.map((file) => {
          return JSON.parse(
            fs.readFileSync(path.resolve(remoteFileDir, file)).toString()
          ) as Settings
        })
      })

    const invoker = new AlgoliaProjectManager({
      algoliaIndexManager: algoliaIndexManager,
      indices: Object.keys(indices).reduce((result, index) => {
        return {
          ...result,
          [index]: new (indices as any)[index]({
            algoliaIndexManager: algoliaIndexManager,
          }) as any,
        }
      }, {}),
      indexConfigDir: path.resolve('./src/fixtures/local'),
    })

    await invoker.backupAlgoliaIndexSettingAll()
    expect(writeFileMock.mock.calls[0][0]).toBe(
      path.resolve('./src/fixtures/local', 'hasprimary.json')
    )
    expect(JSON.parse(writeFileMock.mock.calls[0][1])).toStrictEqual({
      dummy: 'dummy',
      primary: 'replica',
    })
    expect(writeFileMock.mock.calls[1][0]).toBe(
      path.resolve('./src/fixtures/local', 'hasreplicas.json')
    )
    expect(JSON.parse(writeFileMock.mock.calls[1][1])).toStrictEqual({
      dummy: 'dummy',
      replicas: ['replica_1', 'replica_2'],
    })
    expect(writeFileMock.mock.calls[2][0]).toBe(
      path.resolve('./src/fixtures/local', 'normal.json')
    )
    expect(JSON.parse(writeFileMock.mock.calls[2][1])).toStrictEqual({
      dummy: 'dummy',
    })
  })
  it('sort apply json', async () => {
    const clientMock = algoliaSearch('dummy', 'dummy')
    const algoliaIndexManager = new AlgoliaIndexManager({
      client: clientMock,
      indexNamespace: 'namespace_',
    })
    const invoker = new AlgoliaProjectManager({
      algoliaIndexManager: algoliaIndexManager,
      indices: Object.keys(indices).reduce((result, index) => {
        return {
          ...result,
          [index]: new (indices as any)[index]({
            algoliaIndexManager: algoliaIndexManager,
          }) as any,
        }
      }, {}),
      indexConfigDir: path.resolve('./src/fixtures/local'),
    })
    const applyJson = [
      {
        dummy: 'dummy',

        replicas: ['dummy'],
      },
      {
        dummy: 'dummy',
        primary: 'test',
      },
      {
        dummy: 'dummy',
      },
    ]
    applyJson.sort((a, b) => {
      return invoker['applySortValue'](a) - invoker['applySortValue'](b)
    })
    expect(applyJson).toStrictEqual([
      {
        dummy: 'dummy',
      },
      {
        dummy: 'dummy',

        replicas: ['dummy'],
      },
      {
        dummy: 'dummy',
        primary: 'test',
      },
    ])
  })
  it('sort delete order json', async () => {
    const clientMock = algoliaSearch('dummy', 'dummy')
    const algoliaIndexManager = new AlgoliaIndexManager({
      client: clientMock,
      indexNamespace: 'namespace_',
    })
    const invoker = new AlgoliaProjectManager({
      algoliaIndexManager: algoliaIndexManager,
      indices: Object.keys(indices).reduce((result, index) => {
        return {
          ...result,
          [index]: new (indices as any)[index]({
            algoliaIndexManager: algoliaIndexManager,
          }) as any,
        }
      }, {}),
      indexConfigDir: path.resolve('./src/fixtures/local'),
    })
    const applyJson = [
      {
        dummy: 'dummy',

        replicas: ['dummy'],
      },
      {
        dummy: 'dummy',
        primary: 'test',
      },
      {
        dummy: 'dummy',
      },
    ]
    applyJson.sort((a, b) => {
      return invoker['deleteSortValue'](a) - invoker['deleteSortValue'](b)
    })
    expect(applyJson).toStrictEqual([
      {
        dummy: 'dummy',
      },

      {
        dummy: 'dummy',

        replicas: ['dummy'],
      },
      {
        dummy: 'dummy',
        primary: 'test',
      },
    ])
  })
})

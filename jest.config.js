module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],

  moduleNameMapper: {
    // src ディレクトリをエイリアスのルートに設定
    '^~/(.+)': '<rootDir>/src/$1',
    // test 時に CSS ファイルを読み込まないようにする設定
    '\\.css$': '<rootDir>/node_modules/jest-css-modules',
  },
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/jest/tsconfig.json',
    },
  },
}

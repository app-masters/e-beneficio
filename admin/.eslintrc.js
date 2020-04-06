module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:react/recommended',
    // 'plugin:jsdoc/recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'prettier/react',
    'prettier/@typescript-eslint' // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
  ],
  plugins: ['filenames', 'jsdoc', 'import'],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    }
  },
  rules: {
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/display-name': 'off',
    '@typescript-eslint/camelcase': 'off',
    'filenames/match-exported': [2, 'camel'],
    'jsdoc/require-jsdoc': [
      2,
      { require: { ArrowFunctionExpression: true, FunctionExpression: true, MethodDefinition: true } }
    ],
    'jsdoc/require-description': [2],
    '@typescript-eslint/no-var-requires': 'off',
    'react/no-unescaped-entities': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto' // Fixes mismatching windows/unix file end of lines
      }
    ]
  },
  overrides: [
    {
      files: ['pages/**'],
      rules: {
        'filenames/match-exported': 'off'
      }
    }
  ],
  settings: {
    react: {
      version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
    },
    jsdoc: {
      mode: 'typescript'
    }
  }
};

const fs = require('fs');
const path = require('path');
const typescript = require('typescript');

module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/i18n/locales/**',
    '!node_modules/**'
  ],
  output: './',
  options: {
    debug: false,
    func: {
      list: ['i18next.t', 'i18n.t', 't'],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    trans: false, // Use custom transform instead of default acorn-trans
    lngs: ['en', 'es', 'zh', 'hi', 'ar', 'pt', 'fr', 'ru', 'de', 'ja'],
    ns: ['translation'],
    defaultLng: 'en',
    defaultNs: 'translation',
    defaultValue: '__NOT_TRANSLATED__',
    resource: {
      loadPath: 'src/i18n/locales/{{lng}}.json',
      savePath: 'src/i18n/locales/{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: false,
    keySeparator: '.',
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    }
  },
  transform: function customTransform(file, enc, done) {
    "use strict";
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    const extension = path.extname(file.path);

    if (['.ts', '.tsx'].includes(extension)) {
      try {
        // Transpile TypeScript to JavaScript with React JSX support
        const { outputText } = typescript.transpileModule(content, {
          compilerOptions: {
            target: typescript.ScriptTarget.ES2020,
            jsx: typescript.JsxEmit.React,
            module: typescript.ModuleKind.CommonJS
          }
        });
        parser.parseFuncFromString(outputText, { list: ['t', 'i18n.t', 'i18next.t'] });
      } catch (err) {
        console.error(`Error transpiling ${file.path}:`, err);
      }
    } else if (['.js', '.jsx'].includes(extension)) {
      parser.parseFuncFromString(content, { list: ['t', 'i18n.t', 'i18next.t'] });
    }

    done();
  }
};

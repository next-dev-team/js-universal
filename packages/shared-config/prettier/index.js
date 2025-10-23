// Prettier configuration
export default {
  // Print width
  printWidth: 100,
  
  // Tab width
  tabWidth: 2,
  
  // Use tabs instead of spaces
  useTabs: false,
  
  // Semicolons
  semi: true,
  
  // Use single quotes instead of double quotes
  singleQuote: true,
  
  // Quote properties in objects consistently
  quoteProps: 'as-needed',
  
  // Use single quotes in JSX
  jsxSingleQuote: true,
  
  // Trailing commas
  trailingComma: 'es5',
  
  // Spaces between brackets in object literals
  bracketSpacing: true,
  
  // Put > of multi-line JSX elements at the end of the last line
  bracketSameLine: false,
  
  // Include parentheses around a sole arrow function parameter
  arrowParens: 'avoid',
  
  // Range formatting
  rangeStart: 0,
  rangeEnd: Infinity,
  
  // Parser
  parser: undefined,
  
  // File path
  filepath: undefined,
  
  // Require pragma
  requirePragma: false,
  
  // Insert pragma
  insertPragma: false,
  
  // Prose wrap
  proseWrap: 'preserve',
  
  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',
  
  // Vue files script and style tags indentation
  vueIndentScriptAndStyle: false,
  
  // End of line
  endOfLine: 'lf',
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // Single attribute per line in HTML, Vue and JSX
  singleAttributePerLine: false,
  
  // Override settings for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.{yaml,yml}',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.{css,scss,less}',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.{html,vue}',
      options: {
        singleQuote: false,
        bracketSameLine: true,
      },
    },
  ],
};
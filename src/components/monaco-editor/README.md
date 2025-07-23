# Monaco Editor Component

A powerful, feature-rich code editor component built on top of Monaco Editor (the editor that powers VS Code).

## Features

### Core Functionality
- **Syntax Highlighting**: Support for 20+ programming languages
- **IntelliSense**: Code completion, error detection, and suggestions
- **Multi-theme Support**: Light and dark themes
- **Auto-save**: Configurable auto-save functionality
- **Keyboard Shortcuts**: VS Code-like keyboard shortcuts

### UI Features
- **Toolbar**: Save, reload, fullscreen, and close actions
- **Status Indicators**: Unsaved changes indicator
- **Fullscreen Mode**: Expandable to full screen (F11)
- **Responsive Design**: Mobile-friendly layout
- **Loading States**: Smooth loading experience

### Advanced Features
- **File Path Detection**: Automatic language detection from file extensions
- **Unsaved Changes Warning**: Prevents accidental data loss
- **Context Menu Integration**: Right-click actions
- **Accessibility**: WCAG compliant

## Usage

### Basic Usage

```tsx
import MonacoEditor from '../monaco-editor';

function MyComponent() {
  const [content, setContent] = useState('console.log("Hello World");');

  return (
    <MonacoEditor
      content={content}
      language="javascript"
      onChange={setContent}
      onSave={(content) => console.log('Saved:', content)}
    />
  );
}
```

### Advanced Usage

```tsx
import MonacoEditor from '../monaco-editor';

function AdvancedEditor() {
  const handleSave = async (content: string, filePath?: string) => {
    // Save to file system or API
    await saveFile(filePath, content);
  };

  return (
    <MonacoEditor
      filePath="/path/to/file.tsx"
      content={fileContent}
      theme="vs-dark"
      height={600}
      autoSave={true}
      autoSaveDelay={3000}
      onSave={handleSave}
      onClose={() => setEditorOpen(false)}
      showToolbar={true}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filePath` | `string` | - | Path to the file being edited |
| `content` | `string` | `''` | Initial content of the editor |
| `language` | `string` | `'typescript'` | Programming language for syntax highlighting |
| `theme` | `'vs-dark' \| 'light'` | `'vs-dark'` | Editor theme |
| `readOnly` | `boolean` | `false` | Whether the editor is read-only |
| `height` | `string \| number` | `'400px'` | Height of the editor |
| `width` | `string \| number` | `'100%'` | Width of the editor |
| `onSave` | `(content: string, filePath?: string) => Promise<void> \| void` | - | Callback when save is triggered |
| `onClose` | `() => void` | - | Callback when close is triggered |
| `onChange` | `(content: string) => void` | - | Callback when content changes |
| `className` | `string` | - | Additional CSS class |
| `showToolbar` | `boolean` | `true` | Whether to show the toolbar |
| `autoSave` | `boolean` | `false` | Enable auto-save functionality |
| `autoSaveDelay` | `number` | `2000` | Auto-save delay in milliseconds |

## Supported Languages

The editor automatically detects language from file extensions:

- **Web**: HTML, CSS, SCSS, Less
- **JavaScript**: JS, JSX, TS, TSX
- **Frameworks**: Vue
- **Data**: JSON, YAML, XML
- **Documentation**: Markdown
- **Backend**: Python, Java, Go, Rust, PHP, Ruby, C/C++, C#

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `Cmd+S` | Save file |
| `Ctrl+W` / `Cmd+W` | Close editor |
| `F11` | Toggle fullscreen |
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Y` / `Cmd+Shift+Z` | Redo |
| `Ctrl+F` / `Cmd+F` | Find |
| `Ctrl+H` / `Cmd+H` | Find and replace |

## Integration with Quick Actions

The Monaco Editor integrates seamlessly with the Quick Actions component:

```tsx
// In QuickActions component
const handleEditInMonaco = (filePath: string) => {
  setEditorFile({ path: filePath, content, language });
  setEditorVisible(true);
};

// Context menu item
{
  key: 'edit-monaco',
  label: 'Edit in Monaco',
  icon: <EditOutlined />,
  onClick: () => handleEditInMonaco(`${project.path}/src/App.tsx`),
}
```

## Styling

The component includes comprehensive CSS for:
- Responsive design
- Dark/light theme support
- Fullscreen animations
- Mobile optimizations
- Print styles
- Accessibility features

## Browser Compatibility

- Chrome 63+
- Firefox 58+
- Safari 13+
- Edge 79+

## Performance

- **Lazy Loading**: Monaco Editor is loaded on demand
- **Virtual Scrolling**: Handles large files efficiently
- **Debounced Auto-save**: Prevents excessive save operations
- **Memory Management**: Proper cleanup on unmount

## Accessibility

- Screen reader support
- Keyboard navigation
- High contrast mode support
- Focus management
- ARIA labels and descriptions

## Error Handling

- Graceful fallback for unsupported browsers
- Error boundaries for crash recovery
- User-friendly error messages
- Automatic retry mechanisms

## Future Enhancements

- [ ] Multi-tab support
- [ ] Git integration
- [ ] Live collaboration
- [ ] Plugin system
- [ ] Custom themes
- [ ] File tree integration
- [ ] Search across files
- [ ] Code formatting
- [ ] Linting integration
- [ ] Debugging support
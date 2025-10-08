import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  FORMAT_TEXT_COMMAND, 
  UNDO_COMMAND, 
  REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  TextFormatType,
  ElementFormatType
} from 'lexical';
import { $getSelection, $isRangeSelection } from 'lexical';
import { Bold, Italic, Underline, RotateCcw, RotateCw, ChevronDown, LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { $patchStyleText } from '@lexical/selection';

const FONT_FAMILY_OPTIONS = [
  'Verdana',
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia'
];

const FONT_SIZE_OPTIONS = [
  '8pt',
  '9pt',
  '10pt',
  '11pt',
  '12pt',
  '14pt',
  '16pt',
  '18pt'
];

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [fontFamily, setFontFamily] = useState('Verdana');
  const [fontSize, setFontSize] = useState('10pt');
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);

  const updateFormat = (format: string, value: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (format === 'font-family') {
          setFontFamily(value);
          $patchStyleText(selection, {
            fontFamily: value
          });
        } else if (format === 'font-size') {
          setFontSize(value);
          $patchStyleText(selection, {
            fontSize: value
          });
        }
      }
    });
  };

  return (
    <div className="border-b flex items-center gap-1 px-4 py-2">
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className="p-1 hover:bg-gray-100 rounded"
        aria-label="Format text as bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className="p-1 hover:bg-gray-100 rounded"
        aria-label="Format text as italics"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className="p-1 hover:bg-gray-100 rounded"
        aria-label="Format text to underlined"
      >
        <Underline className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <button 
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button 
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <RotateCw className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <div className="relative">
        <button 
          onClick={() => setShowFontFamily(!showFontFamily)}
          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-sm"
        >
          <span>{fontFamily}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        {showFontFamily && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-50">
            {FONT_FAMILY_OPTIONS.map((font) => (
              <button
                key={font}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  setShowFontFamily(false);
                  updateFormat('font-family', font);
                }}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <button 
          onClick={() => setShowFontSize(!showFontSize)}
          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-sm"
        >
          <span>{fontSize}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        {showFontSize && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-50">
            {FONT_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  setShowFontSize(false);
                  updateFormat('font-size', size);
                }}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <button className="p-1 hover:bg-gray-100 rounded">
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
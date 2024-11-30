import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  //$isHeadingNode,
} from "@lexical/rich-text";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  ElementNode,
  TextNode,
  //LexicalCommand,
  //COMMAND_PRIORITY_NORMAL,
  //createCommand,
  TextFormatType,
  $createTextNode,
  ElementFormatType,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { 
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  INSERT_TABLE_COMMAND,
  //TableNode,
  //TableCellNode,
  //TableRowNode
} from '@lexical/table';
import { UNDO_COMMAND, REDO_COMMAND } from "lexical";
import { Undo2, Redo2 } from "lucide-react"; 
import { useUndoRedoState } from './hooks/useUndoRedoState';
//import { DialogTrigger } from "@/components/ui/dialog";
import { StyledPdfDownload } from './StyledDownload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { $createLinkNode } from '@lexical/link';
import { useState, useCallback, useEffect } from "react";
import { FindReplace } from './findReplace';
import { Search } from 'lucide-react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  //Quote,
  Link,
 //Image,
  //CheckSquare,
  Code,
  TextQuote,
  Highlighter,
  PaintBucket,
  //Type,
  Table,
} from "lucide-react";

interface ColorPickerProps {
  onSelect: (color: string) => void;
}
/*
interface TableInsertPayload {
  rows: string;
  columns: string;
  includeHeaders?: boolean;
}*/

const ColorPicker = ({ onSelect }: ColorPickerProps) => {
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080'
  ];

  return (
    <div className="absolute mt-1 p-2 bg-white rounded-md shadow-lg grid grid-cols-5 gap-1 z-50">
      {colors.map((color) => (
        <button
          key={color}
          className="w-6 h-6 rounded-full border border-gray-200"
          style={{ backgroundColor: color }}
          onClick={() => onSelect(color)}
        />
      ))}
    </div>
  );
};

const TableDialog = ({ 
  isOpen, 
  onClose, 
  onInsert 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onInsert: (rows: string, cols: string) => void;
}) => {
  const [rows, setRows] = useState("3");
  const [cols, setCols] = useState("3");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
          <DialogDescription>
            Enter the number of rows and columns for your table.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rows" className="text-right">
              Rows
            </Label>
            <Input
              id="rows"
              type="number"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className="col-span-3"
              min="1"
              max="10"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="columns" className="text-right">
              Columns
            </Label>
            <Input
              id="columns"
              type="number"
              value={cols}
              onChange={(e) => setCols(e.target.value)}
              className="col-span-3"
              min="1"
              max="10"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => {
              onInsert(rows, cols);
              onClose();
            }}
          >
            Insert Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function EnhancedToolbar() {
  const [editor] = useLexicalComposerContext();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [isCodeBlock, setIsCodeBlock] = useState(false);
  const [fontSize, setFontSize] = useState("normal");
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const { canUndo, canRedo, undo, redo } = useUndoRedoState();

  const fontSizes = {
    "small": "0.875rem",
    "normal": "1rem",
    "large": "1.25rem",
    "xlarge": "1.5rem"
  };

  const handleFormatText = useCallback((format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }, [editor]);

  const handleAlignment = useCallback((alignment: ElementFormatType) => {
    editor.update(() => {
      const selection = $getSelection();
      
      if (!selection) {
        console.warn('No selection found');
        return;
      }

      if (!$isRangeSelection(selection)) {
        console.warn('Selection is not a range selection');
        return;
      }

      // Get selected nodes or the current parent node if no specific selection
      const nodes = selection.getNodes();
      
      if (nodes.length === 0) {
        const anchor = selection.anchor;
        const topLevelNode = anchor.getNode().getTopLevelElement();
        if (topLevelNode instanceof ElementNode) {
          topLevelNode.setFormat(alignment);
        }
        return;
      }

      // Apply alignment to all selected nodes
      nodes.forEach((node) => {
        // Get the top-level parent element for inline nodes
        const topLevelNode = node.getTopLevelElement();
        
        if (topLevelNode instanceof ElementNode) {
          topLevelNode.setFormat(alignment);
        }
      });
    });
  }, [editor]);

  const handleHeading = useCallback((tag: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  }, [editor]);

  const handleList = useCallback((type: "ordered" | "unordered") => {
    if (type === "ordered") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  }, [editor]);

  const handleQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }, [editor]);

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const linkNode = $createLinkNode(url);
          const text = selection.getTextContent() || url;
          const textNode = $createTextNode(text);
          linkNode.append(textNode);
          selection.insertNodes([linkNode]);
        }
      });
    }
  }, [editor]);

  const handleTable = useCallback((rows: string, cols: string) => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows,
      columns: cols,
      includeHeaders: true
    });
  }, [editor]);

  const handleInlineStyle = useCallback((property: string, value: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if (node instanceof TextNode) {
            const element = node;
            const styleString = element.getStyle() ?? '';
            const styleMap = new Map<string, string>(
              styleString.split(';')
                .filter(s => s.includes(':'))
                .map(s => {
                  const [key, val] = s.split(':');
                  return [key.trim(), val.trim()];
                })
            );
            styleMap.set(property, value);
            const newStyle = Array.from(styleMap.entries())
              .map(([k, v]) => `${k}: ${v}`)
              .join(';');
            element.setStyle(newStyle);
          }
        });
      }
    });
  }, [editor]);

  const handleColor = useCallback((color: string) => {
    handleInlineStyle('color', color);
    setShowColorPicker(false);
  }, [handleInlineStyle]);

  const handleBgColor = useCallback((color: string) => {
    handleInlineStyle('background-color', color);
    setShowBgColorPicker(false);
  }, [handleInlineStyle]);

  const handleFontSize = useCallback((size: string) => {
    handleInlineStyle('font-size', fontSizes[size as keyof typeof fontSizes]);
    setFontSize(size);
  }, [handleInlineStyle, fontSizes]);

  const handleCodeBlock = useCallback(() => {
    setIsCodeBlock(!isCodeBlock);
    if (!isCodeBlock) {
      handleInlineStyle('font-family', 'monospace');
      handleInlineStyle('background-color', '#f5f5f5');
      handleInlineStyle('padding', '2px 4px');
      handleInlineStyle('border-radius', '4px');
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.getNodes().forEach((node) => {
            if (node instanceof TextNode) {
              node.setStyle('');
            }
          });
        }
      });
    }
  }, [editor, isCodeBlock, handleInlineStyle]);

  const buttonClass = "p-2 hover:bg-gray-100 rounded-lg";
  const activeButtonClass = "p-2 bg-gray-200 rounded-lg";

  const handleUndo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [editor]);

  const handleRedo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  // Add keyboard listener for undo/redo
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
        if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button onClick={() => handleFormatText('bold')} className={buttonClass}>
          <Bold size={20} />
        </button>
        <button onClick={() => handleFormatText('italic')} className={buttonClass}>
          <Italic size={20} />
        </button>
        <button onClick={() => handleFormatText('underline')} className={buttonClass}>
          <Underline size={20} />
        </button>
        <button onClick={() => handleFormatText('strikethrough')} className={buttonClass}>
          <Strikethrough size={20} />
        </button>
      </div>


      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
      <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className={buttonClass}
          title="Undo (Ctrl/⌘+Z)"
        >
          <Undo2 size={20} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className={buttonClass}
          title="Redo (Ctrl/⌘+Y or Ctrl/⌘+Shift+Z)"
        >
          <Redo2 size={20} />
        </Button>
      </div>


      {/* Alignment */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button onClick={() => handleAlignment('left')} className={buttonClass}>
          <AlignLeft size={20} />
        </button>
        <button onClick={() => handleAlignment('center')} className={buttonClass}>
          <AlignCenter size={20} />
        </button>
        <button onClick={() => handleAlignment('right')} className={buttonClass}>
          <AlignRight size={20} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button onClick={() => handleList('unordered')} className={buttonClass}>
          <List size={20} />
        </button>
        <button onClick={() => handleList('ordered')} className={buttonClass}>
          <ListOrdered size={20} />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button onClick={() => handleHeading('h1')} className={buttonClass}>
          <Heading1 size={20} />
        </button>
        <button onClick={() => handleHeading('h2')} className={buttonClass}>
          <Heading2 size={20} />
        </button>
        <button onClick={() => handleHeading('h3')} className={buttonClass}>
          <Heading3 size={20} />
        </button>
      </div>

      {/* Colors */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <div className="relative">
          <button onClick={() => setShowColorPicker(!showColorPicker)} className={buttonClass}>
            <PaintBucket size={20} />
          </button>
          {showColorPicker && <ColorPicker onSelect={handleColor} />}
        </div>
        <div className="relative">
          <button onClick={() => setShowBgColorPicker(!showBgColorPicker)} className={buttonClass}>
            <Highlighter size={20} />
          </button>
          {showBgColorPicker && <ColorPicker onSelect={handleBgColor} />}
        </div>
      </div>

      {/* Font Size */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <select
          value={fontSize}
          onChange={(e) => handleFontSize(e.target.value)}
          className="p-1 border rounded-md"
        >
          <option value="small">Small</option>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
          <option value="xlarge">Extra Large</option>
        </select>
      </div>

      {/* Other Tools */}
      <div className="flex items-center gap-1">
        <button onClick={handleLink} className={buttonClass}>
          <Link size={20} />
        </button>
        <button onClick={() => setIsTableDialogOpen(true)} className={buttonClass}>
          <Table size={20} />
        </button>
        <button onClick={handleQuote} className={buttonClass}>
          <TextQuote size={20} />
        </button>
        <button onClick={handleCodeBlock} className={isCodeBlock ? activeButtonClass : buttonClass}>
          <Code size={20} />
        </button>
        <button 
          onClick={() => setIsFindReplaceOpen(true)} 
          className={buttonClass}
          title="Find and Replace"
        >
          <Search size={20} />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <StyledPdfDownload />
        {/* Other right-aligned items */}
      </div>

      {/* Table Dialog */}
      <TableDialog
        isOpen={isTableDialogOpen}
        onClose={() => setIsTableDialogOpen(false)}
        onInsert={handleTable}
      />
      {/* Add the FindReplace component */}
      <FindReplace
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
      />
    </div>
  );
}
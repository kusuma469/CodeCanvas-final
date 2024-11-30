import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
 // $getRoot,
  //$createTextNode,
  //TextNode,
  //$createParagraphNode,
  $getSelection,
  $isRangeSelection,
  //RangeSelection,
  //LexicalNode,
  //LexicalEditor,
  $isTextNode
} from "lexical";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react-dom";

// Get word suggestions from Datamuse
const getWordSuggestions = async (word: string): Promise<string[]> => {
  console.log('Fetching suggestions for word:', word);
  
  if (!word || word.length < 2) return [];

  try {
    // Fetch similar sounding words and spelled-like words
    const [soundsLikeRes, spelledLikeRes] = await Promise.all([
      fetch(`https://api.datamuse.com/words?sl=${encodeURIComponent(word)}`),
      fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}*&max=3`)
    ]);

    const [soundsLikeWords, spelledLikeWords] = await Promise.all([
      soundsLikeRes.json(),
      spelledLikeRes.json()
    ]);

    // Combine and deduplicate suggestions
    const suggestions = [...new Set([
      ...soundsLikeWords.map((item: { word: string }) => item.word),
      ...spelledLikeWords.map((item: { word: string }) => item.word)
    ])].filter(suggestion => suggestion !== word);

    console.log('Word suggestions:', suggestions);
    return suggestions;
  } catch (error) {
    console.error('Error fetching word suggestions:', error);
    return [];
  }
};

// Improved next words suggestion function
const getNextWords = async (text: string): Promise<string[]> => {
  console.log('Fetching next words for:', text);
  
  if (!text) return [];

  try {
    // Get the last few words for context
    const words = text.trim().split(/\s+/);
    let contextWords = '';
    
    // Get last 2-3 words for better context
    if (words.length >= 3) {
      contextWords = words.slice(-3).join(' ');
    } else if (words.length >= 2) {
      contextWords = words.slice(-2).join(' ');
    } else {
      contextWords = words[0] || '';
    }

    // Multiple API calls for better suggestions
    const [followingWords, relatedWords, triggerWords] = await Promise.all([
      // Words that frequently follow
      fetch(`https://api.datamuse.com/words?lc=${encodeURIComponent(contextWords)}&max=3`),
      // Related words
      fetch(`https://api.datamuse.com/words?rel_trg=${encodeURIComponent(words[words.length - 1])}&max=3`),
      // Words triggered by context
      fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(words[words.length - 1])}&max=3`)
    ]);

    const [followingData, relatedData, triggerData] = await Promise.all([
      followingWords.json(),
      relatedWords.json(),
      triggerWords.json()
    ]);

    console.log('API responses:', {
      following: followingData,
      related: relatedData,
      trigger: triggerData
    });

    // Combine suggestions from different sources
    const nextWordSuggestions = [
      ...followingData.map((item: { word: string }) => item.word),
      ...relatedData.map((item: { word: string }) => item.word),
      ...triggerData.map((item: { word: string }) => item.word)
    ];

    // Remove duplicates and format complete sentences
    const uniqueNextWords = [...new Set(nextWordSuggestions)];
    
    // Format suggestions as complete phrases
    const completeSuggestions = uniqueNextWords.map(word => {
      // Keep original text and add the suggestion
      const originalText = text.trim();
      return `${originalText} ${word}`;
    });

    console.log('Complete suggestions:', completeSuggestions);
    return completeSuggestions;
  } catch (error) {
    console.error('Error fetching next words:', error);
    return [];
  }
};

export function SpellCheckPlugin() {
  const [editor] = useLexicalComposerContext();
  const [suggestions, setSuggestions] = useState<{
    words: string[];
    sentences: string[];
  }>({ words: [], sentences: [] });
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [lastProcessedText, setLastProcessedText] = useState<string>("");

  // Get current cursor position
  const getTextCursorPosition = useCallback((): { x: number; y: number } | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (rect.width === 0 && rect.height === 0) return null;

    return {
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY
    };
  }, []);

  // Handle text updates and fetch suggestions
  const updateSuggestions = useCallback(async (text: string) => {
    console.log('Updating suggestions for text:', text);
    
    // Avoid processing the same text multiple times
    if (!text || text === lastProcessedText) return;
    setLastProcessedText(text);

    const words = text.split(/\s+/);
    const lastWord = words[words.length - 1];

    try {
      // Get both word and sentence suggestions
      const [wordSuggestions, nextWords] = await Promise.all([
        lastWord?.length >= 3 ? getWordSuggestions(lastWord) : Promise.resolve([]),
        text.length >= 3 ? getNextWords(text) : Promise.resolve([])
      ]);

      // Only update state if we have suggestions
      if (wordSuggestions.length > 0 || nextWords.length > 0) {
        setSuggestions({
          words: wordSuggestions,
          sentences: nextWords
        });
        setSelectedWord(lastWord);

        const position = getTextCursorPosition();
        setMenuPosition(position);
      } else {
        setSuggestions({ words: [], sentences: [] });
        setMenuPosition(null);
      }
    } catch (error) {
      console.error('Error updating suggestions:', error);
    }
  }, [getTextCursorPosition, lastProcessedText]);


  // Handle selection of a suggestion
  const handleSuggestionSelect = useCallback((suggestion: string, type: 'word' | 'sentence') => {
    editor.update(() => {
      const selection = $getSelection();
      if (!selection || !$isRangeSelection(selection)) return;

      if (type === 'word' && selectedWord) {
        // Replace the last word with the selected suggestion
        const node = selection.anchor.getNode();
        if ($isTextNode(node)) {
          const text = node.getTextContent();
          const newText = text.replace(selectedWord, suggestion);
          node.setTextContent(newText);
        }
      } else if (type === 'sentence') {
        // Replace entire text with the selected suggestion
        const node = selection.anchor.getNode();
        if ($isTextNode(node)) {
          node.setTextContent(suggestion);
        }
      }
    });

    // Clear suggestions after selection
    setSuggestions({ words: [], sentences: [] });
    setMenuPosition(null);
    setSelectedWord(null);
  }, [editor, selectedWord]);

  // Set up editor listener
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleTextChange = () => {
      editor.update(() => {
        const selection = $getSelection();
        if (!selection || !$isRangeSelection(selection)) return;

        const node = selection.anchor.getNode();
        if (!$isTextNode(node)) return;

        const text = node.getTextContent();
        
        // Debounce the suggestions update
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          updateSuggestions(text);
        }, 300);
      });
    };

    const removeListener = editor.registerUpdateListener(handleTextChange);

    return () => {
      removeListener();
      clearTimeout(timeoutId);
    };
  }, [editor, updateSuggestions]);

  // Render suggestions menu
  return menuPosition && (suggestions.words.length > 0 || suggestions.sentences.length > 0) ? (
    <SuggestionsMenu
      suggestions={suggestions}
      position={menuPosition}
      onSelect={handleSuggestionSelect}
      onClose={() => {
        setSuggestions({ words: [], sentences: [] });
        setMenuPosition(null);
        setSelectedWord(null);
      }}
    />
  ) : null;
}

// Suggestions menu component
function SuggestionsMenu({
  suggestions,
  position,
  onSelect,
  onClose
}: {
  suggestions: { words: string[]; sentences: string[] };
  position: { x: number; y: number };
  onSelect: (text: string, type: 'word' | 'sentence') => void;
  onClose: () => void;
}) {
  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    middleware: [offset(6), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const floating = refs.floating.current;
      if (floating && !(floating as HTMLElement).contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [refs.floating, onClose]);

  return createPortal(
    <div
      ref={refs.floating as React.RefObject<HTMLDivElement>}
      style={{
        ...floatingStyles,
        position: "absolute",
        top: position.y,
        left: position.x,
        zIndex: 9999,
      }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px] max-w-[300px]"
    >
      {suggestions.words.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-semibold text-gray-500 mb-1">Word Suggestions</div>
          <div className="space-y-1">
            {suggestions.words.map((word, index) => (
              <button
                key={`word-${index}`}
                onClick={() => onSelect(word, 'word')}
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {suggestions.sentences.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">Complete With</div>
          <div className="space-y-1">
            {suggestions.sentences.map((sentence, index) => (
              <button
                key={`sentence-${index}`}
                onClick={() => onSelect(sentence, 'sentence')}
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                {sentence}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

export default SpellCheckPlugin;
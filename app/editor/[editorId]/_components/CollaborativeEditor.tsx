import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { EditorView } from "@codemirror/view";
import { Extension, EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { useCallback, useEffect, useState, useRef } from "react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useSelf, useStorage, useMutation } from "@liveblocks/react/suspense";
import { LiveObject, JsonObject } from "@liveblocks/client";
import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
} from "@codemirror/commands";
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap,
} from "@codemirror/language";
import {
  closeBrackets,
  closeBracketsKeymap,
  autocompletion,
  completionKeymap,
} from "@codemirror/autocomplete";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "./Avatars";
import { Toolbar } from "./Toolbar";

interface UserInfo {
  name: string;
  picture?: string;
  color?: string;
}

interface CompilationState extends JsonObject {
  output: string;
  compiledBy: string;
  timestamp: number;
}

interface CollaborativeEditorProps {
  documentId: string;
  defaultValue?: string;
}

const basicSetup: Extension = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  autocompletion(),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...closeBracketsKeymap,
    ...completionKeymap,
  ]),
];

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  defaultValue,
}) => {
  const room = useRoom();
  const [element, setElement] = useState<HTMLElement>();
  const [yUndoManager, setYUndoManager] = useState<Y.UndoManager>();
  const editorViewRef = useRef<EditorView>();
  const [isCompiling, setIsCompiling] = useState(false);

  const userInfo = useSelf((me) => me.info) as UserInfo;
  
  // Get compilation state from LiveBlocks storage
  const compilationState = useStorage((root) => root.compilationState);

  // Initialize compilation state if it doesn't exist
  const initializeCompilationState = useMutation(({ storage }) => {
    const existing = storage.get('compilationState');
    if (!existing) {
      const initialState = new LiveObject<CompilationState>({
        output: '',
        compiledBy: '',
        timestamp: Date.now()
      });
      storage.set('compilationState', initialState);
    }
  }, []);

  // Update compilation state with batch mutation
  const updateCompilationState = useMutation(({ storage }, newState: Partial<CompilationState>) => {
    storage.set('compilationState', new LiveObject<CompilationState>({
      output: (storage.get('compilationState') as any)?.output ?? '',
      compiledBy: (storage.get('compilationState') as any)?.compiledBy ?? '',
      timestamp: (storage.get('compilationState') as any)?.timestamp ?? Date.now(),
      ...newState
    }));
  }, []);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  // Handle compilation
  const handleCompile = async () => {
    if (!editorViewRef.current) return;
    
    const code = editorViewRef.current.state.doc.toString();
    if (!code.trim()) {
      updateCompilationState({
        output: "Error: No code to compile",
        compiledBy: userInfo.name,
        timestamp: Date.now()
      });
      return;
    }

    setIsCompiling(true);
    try {
      updateCompilationState({
        output: "Compiling...",
        compiledBy: userInfo.name,
        timestamp: Date.now()
      });

      const response = await fetch('http://localhost:5000/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: 'python'
        }),
      });

      const data = await response.json();
      
      updateCompilationState({
        output: data.output || data.error || 'Unknown error occurred',
        compiledBy: userInfo.name,
        timestamp: Date.now()
      });
    } catch (error) {
      updateCompilationState({
        output: `Error: ${(error as Error).message}`,
        compiledBy: userInfo.name,
        timestamp: Date.now()
      });
    } finally {
      setIsCompiling(false);
    }
  };

  // Initialize editor and compilation state
  useEffect(() => {
    if (!element || !room || !userInfo) return;

    let provider: LiveblocksYjsProvider;
    let ydoc: Y.Doc;

    try {
      // Initialize compilation state
      initializeCompilationState();

      // Create Yjs document and provider
      ydoc = new Y.Doc();
      provider = new LiveblocksYjsProvider(room as any, ydoc);
      const ytext = ydoc.getText("codemirror");
      
      // Set initial content if provided
      if (defaultValue && ytext.toString() === '') {
        ytext.insert(0, defaultValue);
      }
      
      const undoManager = new Y.UndoManager(ytext);
      setYUndoManager(undoManager);

      // Set awareness state
      provider.awareness.setLocalStateField("user", {
        name: userInfo.name,
        color: userInfo.color || "#000000",
        colorLight: (userInfo.color || "#000000") + "80",
      });

      // Create editor state with Python language support
      const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [
          basicSetup,
          python(),
          yCollab(ytext, provider.awareness, { undoManager }),
        ],
      });

      // Create and store editor view
      const view = new EditorView({
        state,
        parent: element,
      });
      editorViewRef.current = view;

      return () => {
        view.destroy();
        provider?.destroy();
        ydoc?.destroy();
      };
    } catch (error) {
      console.error("Error initializing editor:", error);
    }
  }, [element, room, userInfo, defaultValue, initializeCompilationState]);

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <div className={styles.toolbar}>
          {yUndoManager ? <Toolbar yUndoManager={yUndoManager} /> : null}
        </div>
        <Avatars />
      </div>
      <div className={styles.editorContainer} ref={ref}></div>
      <div className={styles.compileSection}>
        <button 
          onClick={handleCompile}
          className={styles.compileButton}
          disabled={isCompiling}
        >
          {isCompiling ? 'Running...' : 'Run Python Code'}
        </button>
        <div className={styles.outputContainer}>
          <h3>Output:</h3>
          <pre className={styles.output}>
            {compilationState ? (
              <>
                {compilationState.output}
                {compilationState.compiledBy && (
                  <div className={styles.compilationInfo}>
                    <span className={styles.compiler}>
                      Run by: {compilationState.compiledBy}
                    </span>
                    <span className={styles.timestamp}>
                      at {new Date(compilationState.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </>
            ) : (
              'No output yet'
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};
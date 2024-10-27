"use client";

import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import {java} from "@codemirror/lang-java"
import { python } from "@codemirror/lang-python"; // Import Python language support
import { useCallback, useEffect, useState, useRef } from "react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "./Avatars";
import { Toolbar } from "./Toolbar";

// Supported languages
const languages = {
  javascript: {
    name: 'JavaScript',
    mode: javascript(),
  },
  python: {
    name: 'Python',
    mode: python(),
  },
  java: {
    name: 'Java',
    mode: java(),
  },
};

export function CollaborativeEditor() {
  const room = useRoom();
  const [element, setElement] = useState<HTMLElement>();
  const [yUndoManager, setYUndoManager] = useState<Y.UndoManager>();
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java'>('javascript'); // Default language
  const [output, setOutput] = useState<string>(''); // Output from the compilation
  const viewRef = useRef<EditorView | null>(null); // Create a ref for EditorView

  // Get user info from Liveblocks authentication endpoint
  const userInfo = useSelf((me) => me.info);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  // Set up Liveblocks Yjs provider and attach CodeMirror editor
  useEffect(() => {
    let provider: LiveblocksYjsProvider;
    let ydoc: Y.Doc;

    if (!element || !room || !userInfo) {
      return;
    }

    // Create Yjs provider and document
    ydoc = new Y.Doc();
    provider = new LiveblocksYjsProvider(room as any, ydoc);
    const ytext = ydoc.getText("codemirror");
    const undoManager = new Y.UndoManager(ytext);
    setYUndoManager(undoManager);

    // Attach user info to Yjs
    provider.awareness.setLocalStateField("user", {
      name: userInfo.name,
      color: userInfo.color,
      colorLight: userInfo.color + "80", // 6-digit hex code at 50% opacity
    });

    // Set up CodeMirror and extensions
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        languages[selectedLanguage].mode, // Use selected language mode
        yCollab(ytext, provider.awareness, { undoManager }),
      ],
    });

    // Attach CodeMirror to element
    const view = new EditorView({
      state,
      parent: element,
    });

    viewRef.current = view; // Store view in the ref

    return () => {
      ydoc?.destroy();
      provider?.destroy();
      view?.destroy();
    };
  }, [element, room, userInfo, selectedLanguage]);

  // Compile code based on selected language
  const handleCompile = async () => {
    const code = viewRef.current?.state.doc.toString(); // Get code from the editor
    if (!code) {
      setOutput("Error: No code to compile");
      return;
  }
    //let result;

    try {
      const response = await fetch('http://localhost:5000/execute', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code,language: selectedLanguage  }), // Send code to the server
      });

      const data = await response.json();

      if (response.ok) {
          setOutput(data.output); // Display output
      } else {
          setOutput(`Error: ${data.error || 'Unknown error occurred'}`); // Display error
      }
  } catch (error) {
      const typedError = error as Error;
      setOutput(`Error: ${typedError.message}`);
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <div>
          {yUndoManager ? <Toolbar yUndoManager={yUndoManager} /> : null}
        </div>
        <Avatars />
      </div>
      <div className={styles.languageSelector}>
        <label htmlFor="language">Choose Language: </label>
        <select
          id="language"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value as 'javascript' | 'python' | 'java')} // Type assertion for value
        >
          {Object.keys(languages).map((langKey) => (
            <option key={langKey} value={langKey}>
              {languages[langKey as keyof typeof languages].name} {/* Cast langKey to LanguageKey */}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.editorContainer} ref={ref}></div>
      <button onClick={handleCompile}>Compile</button>
      <div className={styles.outputContainer}>
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

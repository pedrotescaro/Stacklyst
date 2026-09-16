import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  undo,
  redo,
} from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (s: string) => void };
  }
}
const post = (data: unknown) => window.ReactNativeWebView?.postMessage(JSON.stringify(data));
const languageSlot = new Compartment(),
  editableSlot = new Compartment();
const syntax = (language: string) =>
  language === 'PYTHON'
    ? python()
    : language === 'RUST'
      ? rust()
      : language === 'JAVA'
        ? java()
        : language === 'CPP'
          ? cpp()
          : javascript({ typescript: language === 'TS' });
let view: EditorView | undefined;
let suppress = false;
let editable = true;
let language = '';
function receive(event: MessageEvent) {
  let message;
  try {
    message = JSON.parse(event.data);
  } catch {
    return;
  }
  if (!message || typeof message !== 'object') return;
  if (
    message.type === 'init' &&
    typeof message.code === 'string' &&
    message.code.length <= 20000 &&
    typeof message.language === 'string'
  ) {
    const nextEditable = message.editable !== false;
    suppress = true;
    if (view) {
      const effects = [];
      if (language !== message.language)
        effects.push(languageSlot.reconfigure(syntax(message.language)));
      if (editable !== nextEditable)
        effects.push(
          editableSlot.reconfigure([
            EditorView.editable.of(nextEditable),
            EditorState.readOnly.of(!nextEditable),
          ])
        );
      view.dispatch({
        changes:
          view.state.doc.toString() !== message.code
            ? { from: 0, to: view.state.doc.length, insert: message.code }
            : undefined,
        effects,
      });
    } else {
      view = new EditorView({
        parent: document.getElementById('editor')!,
        state: EditorState.create({
          doc: message.code,
          extensions: [
            lineNumbers(),
            history(),
            highlightActiveLine(),
            keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
            languageSlot.of(syntax(message.language)),
            editableSlot.of([
              EditorView.editable.of(nextEditable),
              EditorState.readOnly.of(!nextEditable),
            ]),
            oneDark,
            EditorView.lineWrapping,
            EditorState.transactionFilter.of((transaction) =>
              transaction.newDoc.length <= 20000 ? transaction : []
            ),
            EditorView.contentAttributes.of({
              'aria-label': 'Editor de código',
              autocapitalize: 'off',
              autocorrect: 'off',
              spellcheck: 'false',
            }),
            EditorView.updateListener.of((update) => {
              if (update.docChanged && !suppress)
                post({ type: 'change', code: update.state.doc.toString() });
            }),
          ],
        }),
      });
    }
    language = message.language;
    editable = nextEditable;
    suppress = false;
  }
  if (!view || !editable) return;
  if (message.type === 'insert' && typeof message.text === 'string' && message.text.length < 30) {
    view.dispatch(view.state.replaceSelection(message.text));
    view.focus();
  }
  if (message.type === 'undo') undo(view);
  if (message.type === 'redo') redo(view);
}
window.addEventListener('message', receive);
document.addEventListener('message', receive as EventListener);
window.addEventListener('pagehide', () => view?.destroy());
post({ type: 'ready' });

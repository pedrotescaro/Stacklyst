import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const rootRequire = createRequire(new URL('../../../package.json', import.meta.url));
const React = rootRequire('react');
const { createRoot } = rootRequire('react-dom/client');
const { JSDOM } = rootRequire('jsdom');
const dom = new JSDOM('<!doctype html><div id="app"></div>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__snippetClipboard = [];
const require = createRequire(import.meta.url);
const directory = await mkdtemp(join(tmpdir(), 'stacklyst-snippets-'));
const output = join(directory, 'snippets.cjs');
const stubs = {
  'react-native': `import React from 'react';
    export const View=({children})=>React.createElement('div',null,children);
    export const TouchableWithoutFeedback=View;
    export const Text=({children,selectable,style})=>React.createElement('span',{'data-selectable':selectable||undefined,'data-color':style?.color},children);
    export const TextInput=({value,onChangeText,accessibilityLabel,editable})=>React.createElement('textarea',{'aria-label':accessibilityLabel,value,disabled:editable===false,onChange:()=>{},onInput:event=>onChangeText(event.target.value)});
    export const Pressable=({children,onPress,disabled,accessibilityLabel})=>React.createElement('button',{onClick:onPress,disabled,'aria-label':accessibilityLabel},children);
    export const ScrollView=({children,horizontal})=>React.createElement('div',{'data-horizontal':horizontal||undefined},children);
    export const Image=()=>null;
    export const Linking={openURL:async()=>{}};
    export const Platform={OS:'web',select:options=>options.web??options.default};
    export const StyleSheet={create:value=>value,flatten:value=>Array.isArray(value)?Object.assign({},...value):value};
    export const useWindowDimensions=()=>({width:390,height:844});`,
  'react-native-fit-image': 'export default ()=>null;',
  './ui': `import React from 'react'; export const Button=()=>null; export const Label=({children})=>React.createElement('span',null,children); export const useUIStyles=()=>({});`,
  './icons':
    'export const IconCopy=()=>null; export const IconCheck=()=>null; export const IconX=()=>null;',
  '../theme':
    'export const useTheme=()=>({colors:{text:"#fff",primary:"#1d9bf0",surface:"#202327",border:"#2f3336"}});',
  'expo-clipboard':
    'export const setStringAsync=async value=>{globalThis.__snippetClipboard.push(value)};',
  'react-native-safe-area-context': 'export const useSafeAreaInsets=()=>({bottom:0});',
  'expo-router':
    'export const useLocalSearchParams=()=>({id:globalThis.__compose.id}); export const router={canGoBack:()=>false,replace(){},back(){}};',
  '@tanstack/react-query':
    'export const useQuery=()=>({data:globalThis.__compose.original}); export const useMutation=options=>({isPending:false,mutate:()=>Promise.resolve(options.mutationFn()).then(options.onSuccess)});',
  'expo-image-picker': 'export const launchImageLibraryAsync=async()=>({canceled:true});',
  '~/components/ui': `import React from 'react'; export const Screen=({children,actions})=>React.createElement('main',null,actions,children); export const Label=({children})=>React.createElement('span',null,children); export const Button=({label,onPress,disabled})=>React.createElement('button',{onClick:onPress,disabled},label); export const IconButton=({label,onPress})=>React.createElement('button',{'aria-label':label,onClick:onPress},label); export const Field=()=>null; export const Choice=()=>null; export const AsyncState=({children})=>children; export const Avatar=()=>null;`,
  '~/components/content': 'export const DraftConflict=()=>null;',
  '~/components/icons':
    'export const IconCode=()=>null; export const IconPhoto=()=>null; export const IconLetterT=()=>null; export const IconX=()=>null;',
  '~/lib/draft': `import {useState} from 'react'; export const useDraft=(key,initial)=>{const [value,setValue]=useState(globalThis.__compose.seed??initial); return {value,setValue,ready:true,status:'Salvo',sync(){},clear:async()=>{}}};`,
  '~/lib/api':
    'export const api=async()=>({}); export const send=async(path,body,method)=>{globalThis.__compose.requests.push({path,body,method});return {}}; export const errorMessage=error=>error.message;',
  '~/lib/query': 'export const queryClient={invalidateQueries:async()=>{}};',
  '~/lib/session':
    'export const useSession=()=>({isPreview:false}); export const useMe=()=>({data:{username:"Pedro"}});',
  '~/lib/config': 'export const config={apiUrl:"https://stacklyst.invalid"};',
  '~/theme':
    'export const useTheme=()=>({colors:{text:"#fff",muted:"#aaa",primary:"#1d9bf0",surface:"#202327",background:"#000"}});',
  'react-native-render-html': `import React from 'react'; import {TRenderEngine} from '@native-html/transient-render-engine';
    export {isDomElement,isDomText} from '@native-html/transient-render-engine';
    export default function HTML({source,renderers,tagsStyles}){const tree=new TRenderEngine({stylesConfig:{tagsStyles}}).buildTTree(source.html);const render=node=>node.type==='text'?node.data:node.tagName==='pre'?React.createElement(renderers.pre,{tnode:node}):React.createElement('div',null,node.children?.map((child,index)=>React.createElement(React.Fragment,{key:index},render(child))));return React.createElement('article',{'data-html':true},render(tree));}`,
};
let root;
try {
  await build({
    stdin: {
      contents:
        "export * from './src/lib/code-snippets'; export {RichText,CodeBlock} from './src/components/content'; export {SnippetComposer} from './src/components/SnippetComposer'; export {default as Compose} from './app/(app)/compose';",
      resolveDir: fileURLToPath(new URL('..', import.meta.url)),
      loader: 'tsx',
    },
    bundle: true,
    outfile: output,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    loader: { '.js': 'jsx' },
    logLevel: 'silent',
    plugins: [
      {
        name: 'native-boundary',
        setup(builder) {
          builder.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path }) => ({
            path: rootRequire.resolve(path),
            external: true,
          }));
          builder.onResolve({ filter: /.*/ }, ({ path }) =>
            Object.hasOwn(stubs, path) ? { path, namespace: 'stub' } : undefined
          );
          builder.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({
            contents: stubs[path],
            loader: 'tsx',
            resolveDir: fileURLToPath(new URL('..', import.meta.url)),
          }));
        },
      },
    ],
  });
  const {
    createCodeFence,
    fencedSnippets,
    appendCodeBlock,
    hasCodeBlock,
    hasHtmlContent,
    htmlWithCodeFences,
    RichText,
    CodeBlock,
    SnippetComposer,
    Compose,
    editableSnippets,
  } = require(output);
  const source = '  const template = "```";\nconsole.log("<div>literal</div>");\n\n';
  const serialized = createCodeFence(source, 'TS');
  assert.ok(serialized.startsWith('````ts\n'));
  assert.equal(fencedSnippets(serialized)[0].code, source);
  assert.equal(hasHtmlContent(serialized), false, 'HTML source in fences stays Markdown code');
  assert.equal(hasHtmlContent('`<div>literal</div>`'), false);
  assert.equal(hasHtmlContent('<p>Texto</p>\n' + serialized), true);
  assert.equal(hasCodeBlock(serialized, source), true);
  assert.equal(hasCodeBlock(serialized, 'different code'), false);
  assert.equal(appendCodeBlock('texto\n\n' + serialized, source, 'TS'), 'texto\n\n' + serialized);
  assert.equal(appendCodeBlock('texto', '', 'JS'), 'texto');
  assert.equal(hasCodeBlock('<pre><code>&lt;p&gt;&amp; &#65;</code></pre>', '<p>& A'), true);
  assert.equal(fencedSnippets('~~~python\r\n  print(1)\r\n~~~')[0].code, '  print(1)');
  assert.equal(fencedSnippets('```js\nlet n = 1;')[0].code, 'let n = 1;');
  assert.match(htmlWithCodeFences('<p>texto</p>\n' + serialized), /data-language="ts"/);

  root = createRoot(document.getElementById('app'));
  const render = async (element) => React.act(async () => root.render(element));
  await render(React.createElement(RichText, { body: serialized }));
  assert.equal(
    document.querySelector('article'),
    null,
    'literal HTML never selects the HTML renderer'
  );
  assert.equal(document.querySelector('[data-selectable="true"]').textContent, source);
  assert.match(document.body.textContent, /1\n2\n3\n4/);
  assert.ok(document.querySelector('[data-horizontal="true"]'));
  assert.match(document.body.textContent, /ts/);

  await render(React.createElement(RichText, { body: 'Texto normal\n\n    one();\n    two();' }));
  assert.equal(document.querySelector('[data-selectable="true"]').textContent, 'one();\ntwo();');
  await render(
    React.createElement(RichText, {
      body: '<p>Antes</p><pre><code class="language-python">  a = 1\nb = &lt;p&gt;</code></pre><p>Depois</p>',
    })
  );
  assert.match(document.body.textContent, /Antes/);
  assert.match(document.body.textContent, /Depois/);
  assert.match(document.body.textContent, /python/);
  assert.equal(document.querySelector('[data-selectable="true"]').textContent, '  a = 1\nb = <p>');
  await render(React.createElement(RichText, { body: '<p>Texto HTML</p>\n' + serialized }));
  assert.equal(document.querySelector('[data-selectable="true"]').textContent, source);

  await render(React.createElement(CodeBlock, { code: source, language: 'TypeScript' }));
  await React.act(async () => document.querySelector('[aria-label="Copiar código"]').click());
  assert.equal(
    globalThis.__snippetClipboard.at(-1),
    source,
    'copy excludes the line-number gutter'
  );
  assert.ok(document.querySelector('[aria-label="Código copiado"]'));

  let language = 'JS';
  await render(
    React.createElement(SnippetComposer, {
      value: 'one();\ntwo();\n',
      language,
      onChange() {},
      onLanguageChange: (value) => {
        language = value;
      },
    })
  );
  assert.match(document.body.textContent, /1\n2\n3/);
  await React.act(async () => document.querySelector('[aria-label="Linguagem Python"]').click());
  assert.equal(language, 'PYTHON');
  assert.equal(document.querySelector('textarea').value, 'one();\ntwo();\n');
  assert.ok(document.querySelector('[data-horizontal="true"]'));
  const submit = async (state, key, edit) => {
    globalThis.__compose = { ...state, requests: [] };
    await render(React.createElement(Compose, { key }));
    if (edit) await edit();
    const button = [...document.querySelectorAll('button')].find(
      (item) => item.textContent === (state.id ? 'Salvar' : 'Publicar')
    );
    assert.ok(button && !button.disabled);
    await React.act(async () => button.click());
    assert.equal(globalThis.__compose.requests.length, 1);
    return globalThis.__compose.requests[0];
  };
  const composition = {
    body: 'Aprendendo TypeScript hoje',
    title: 'Código de exemplo',
    code: source,
    type: 'discussion',
    image: 'https://example.com/image.jpg',
    language: 'TS',
  };
  const created = await submit({ seed: JSON.stringify(composition) }, 'create');
  assert.equal(created.method, 'POST');
  assert.equal(created.path, '/api/posts');
  assert.equal(created.body.code, source);
  assert.equal(created.body.language, 'TS');
  assert.equal(created.body.image_url, composition.image);
  assert.equal(created.body.title, composition.title);
  assert.equal(created.body.body, composition.body);
  const original = {
    id: 'post-1',
    body: 'Texto com código legado',
    code_snippet: source,
    language: 'TS',
  };
  const edited = await submit({ id: original.id, original }, 'edit');
  assert.equal(edited.method, 'PATCH');
  assert.equal(edited.path, '/api/posts/post-1');
  assert.equal(
    fencedSnippets(edited.body.body)[0].code,
    source,
    'editing retains legacy metadata as a body fence'
  );
  assert.ok(edited.body.body.startsWith(original.body));
  const oldDraft = '{ corpo editado do rascunho antigo }';
  const recovered = await submit({ id: original.id, original, seed: oldDraft }, 'legacy-edit');
  assert.ok(recovered.body.body.startsWith(oldDraft));
  assert.equal(fencedSnippets(recovered.body.body)[0].code, source);
  const fencedOriginal = { ...original, body: 'Texto existente\n\n' + serialized };
  const deduped = await submit({ id: original.id, original: fencedOriginal }, 'dedupe-edit');
  assert.equal(fencedSnippets(deduped.body.body).length, 1);
  const changeNumberedEditor = async (value) => {
    const input = document.querySelector('[aria-label="Editor de código com numeração de linhas"]');
    assert.ok(input, 'saved snippets reopen in a numbered editor');
    await React.act(async () => {
      input.value = value;
      input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
  };
  const reopened = await submit(
    { id: original.id, original: { ...original, body: edited.body.body } },
    'reopened-edit',
    () => changeNumberedEditor('const updated = 2;\n\n')
  );
  assert.equal(fencedSnippets(reopened.body.body)[0].code, 'const updated = 2;\n\n');
  const longCode = 'x'.repeat(6000);
  const secondCode = 'print("segundo")';
  const orderedBody =
    'Antes\n\n' +
    createCodeFence(longCode, 'JS') +
    '\n\nEntre os blocos\n\n' +
    createCodeFence(secondCode, 'PYTHON') +
    '\n\nDepois';
  const ordered = await submit(
    { id: original.id, original: { ...original, body: orderedBody, code_snippet: longCode } },
    'ordered-edit',
    () => changeNumberedEditor(longCode + 'updated();')
  );
  assert.ok(ordered.body.body.startsWith('Antes\n\n'));
  assert.ok(ordered.body.body.endsWith('\n\nDepois'));
  assert.ok(ordered.body.body.includes('\n\nEntre os blocos\n\n'));
  assert.equal(
    fencedSnippets(ordered.body.body)[0].code,
    longCode + 'updated();',
    'long saved code is editable without the prose input limit'
  );
  assert.equal(fencedSnippets(ordered.body.body)[1].code, secondCode);
  const removed = await submit(
    { id: original.id, original: { ...original, body: orderedBody, code_snippet: longCode } },
    'remove-block',
    async () => {
      const remove = document.querySelector('[aria-label="Remover bloco de código"]');
      assert.ok(remove);
      await React.act(async () => remove.click());
    }
  );
  assert.equal(fencedSnippets(removed.body.body).length, 1);
  assert.equal(fencedSnippets(removed.body.body)[0].code, secondCode);
  const firstRange = fencedSnippets(orderedBody)[0];
  assert.equal(
    removed.body.body,
    orderedBody.slice(0, firstRange.start) + orderedBody.slice(firstRange.end),
    'remove changes only the selected block'
  );
  const htmlBody =
    '<p>Primeiro</p><pre><code class="language-js">old();\nnext();</code></pre><p>Último</p>';
  const htmlEdited = await submit(
    { id: original.id, original: { ...original, body: htmlBody, code_snippet: 'old();\nnext();' } },
    'html-edit',
    () => changeNumberedEditor('const html = "<p>";\n')
  );
  assert.equal(editableSnippets(htmlEdited.body.body)[0].code, 'const html = "<p>";\n');
  assert.ok(htmlEdited.body.body.startsWith('<p>Primeiro</p>'));
  assert.ok(htmlEdited.body.body.endsWith('<p>Último</p>'));
  const htmlWithFenceLiteral = '<pre><code>```js\nconst x = 1;\n```</code></pre>';
  assert.equal(editableSnippets(htmlWithFenceLiteral).length, 1);
  assert.equal(editableSnippets(htmlWithFenceLiteral)[0].format, 'html');
  console.log(
    'Snippet serialization, Markdown/HTML rendering, line numbers, copy, language selection and compose POST/PATCH transport: passed.'
  );
} finally {
  if (root) await React.act(async () => root.unmount());
  dom.window.close();
  await rm(directory, { recursive: true, force: true });
}

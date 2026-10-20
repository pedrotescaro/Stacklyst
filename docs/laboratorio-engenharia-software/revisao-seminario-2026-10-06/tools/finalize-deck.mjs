import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SKILL='C:/Users/PEDRO/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const PY='C:/Users/PEDRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const candidate=path.join(R,'.build/candidate.pptx');const final=path.join(R,'apresentacao/Stacklyst-seminario-revisado.pptx');
await finalizePresentation({workspaceDir:R,candidatePath:candidate,finalPath:final,pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:path.join(R,'.build/presentation-validation-final.json'),requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
console.log('Final validation passed');
/**
 * dsh-jenkins 参数解析隔离测试（不依赖宿主 / 不联网）：
 *  - normalizeParamDef / extractParams：内置类型、uno-choice（Active Choices）、
 *    Extended Choice（含 multiSelect）、默认值来自 defaultValue / defaultParameterValue、
 *    空名分隔行（纯横线丢弃 / 有文字保留成虚线条）、同名去重；
 *  - parseBuildPageChoices：脚本生成的选项从构建页 HTML 解析（真实页面的结构）。
 *
 * 固件取自真实 Job（pro_system4_Front_docker2）的 /api/json 与构建页 HTML 片段。
 */
import { extractParams, normalizeParamDef, parseBuildPageChoices } from '../src/host/jenkins.ts'

const fail = (msg: string): never => { throw new Error('FAIL: ' + msg) }
const ok = (msg: string): void => console.log('ok -', msg)

const guard = setTimeout(() => { console.error('FAIL: timeout'); process.exit(1) }, 20000)
guard.unref?.()

/** 真实 job 的 property（含 uno-choice 的 project / 分隔行 / 内置 choice / text / string）。 */
const REAL_PROPERTY = [{
  _class: 'hudson.model.ParametersDefinitionProperty',
  parameterDefinitions: [
    { _class: 'org.biouno.unochoice.DynamicReferenceParameter', name: '', description: '', type: 'DynamicReferenceParameter', defaultParameterValue: { _class: 'hudson.model.StringParameterValue', name: '', value: '' } },
    { _class: 'org.biouno.unochoice.ChoiceParameter', name: 'project', description: null, type: 'ChoiceParameter', defaultParameterValue: { _class: 'hudson.model.StringParameterValue', name: 'project', value: 'boss_backend' } },
    { _class: 'org.biouno.unochoice.DynamicReferenceParameter', name: '', description: '-----', type: 'DynamicReferenceParameter', defaultParameterValue: { _class: 'hudson.model.StringParameterValue', name: '', value: '' } },
    { _class: 'hudson.model.TextParameterDefinition', name: 'branch', description: '', type: 'TextParameterDefinition', defaultValue: 'master5' },
    { _class: 'org.biouno.unochoice.DynamicReferenceParameter', name: '', description: '构建配置', type: 'DynamicReferenceParameter', defaultParameterValue: { _class: 'hudson.model.StringParameterValue', name: '', value: '' } },
    { _class: 'hudson.model.ChoiceParameterDefinition', name: 'NodeVersion', description: '指定node版本', type: 'ChoiceParameterDefinition', choices: ['v24.12.0', 'v20.16.0', 'v16.14.0'], defaultValue: 'v24.12.0' },
    { _class: 'hudson.model.StringParameterDefinition', name: 'INSTALL_COMMAND_ACTIVE', description: '', defaultValue: 'npm i --unsafe-perm' },
    { _class: 'hudson.model.BooleanParameterDefinition', name: 'DEPLOY', description: '', defaultValue: false },
    { _class: 'hudson.model.PasswordParameterDefinition', name: 'TOKEN', description: '', defaultValue: '' },
    { _class: 'hudson.model.ChoiceParameterDefinition', name: 'NodeVersion', description: '重复定义', choices: ['dup'] },
  ],
}]

try {
  /* ── 1) 真实 job：uno-choice 参数被识别成下拉（默认值来自 defaultParameterValue） ── */
  const params = extractParams(REAL_PROPERTY)
  const byName: Record<string, (typeof params)[number]> = {}
  for (const p of params) byName[p.name] = p
  if (params.some((p) => p.name === '')) fail('empty-name params leaked into the form: ' + JSON.stringify(params.map((p) => p.name)))
  const project = byName.project
  if (!project) fail('project param missing')
  if (project.type !== 'choice') fail('uno-choice project should be type=choice, got ' + project.type)
  if (project.defaultValue !== 'boss_backend') fail('uno-choice default (defaultParameterValue.value) lost: ' + JSON.stringify(project.defaultValue))
  if (project.choices !== null) fail('uno-choice choices should stay null (resolved from the build page)')
  ok('extractParams: uno-choice(Active Choices) 参数识别为下拉，默认值取自 defaultParameterValue')

  /* ── 2) 内置类型 + 默认值 ── */
  if (byName.NodeVersion.type !== 'choice' || (byName.NodeVersion.choices || []).length !== 3) fail('classic choice broken')
  if (byName.NodeVersion.defaultValue !== 'v24.12.0') fail('classic choice default lost')
  if ((byName.NodeVersion.choices || []).join(',') === 'dup') fail('duplicate param name should keep the first definition')
  if (byName.branch.type !== 'text' || byName.branch.defaultValue !== 'master5') fail('text param broken')
  if (byName.INSTALL_COMMAND_ACTIVE.type !== 'string' || byName.INSTALL_COMMAND_ACTIVE.defaultValue !== 'npm i --unsafe-perm') fail('string param broken')
  if (byName.DEPLOY.type !== 'boolean' || byName.DEPLOY.defaultValue !== false) fail('boolean param broken')
  if (byName.TOKEN.type !== 'password') fail('password param broken')
  ok('extractParams: 内置 text / string / boolean / password / choice 类型与默认值正确，同名只保留第一个')

  /* ── 3) 空名分隔行：纯横线丢弃，有文字保留成虚线条（唯一名字） ── */
  const dividers = params.filter((p) => /^[-—–]{3,}\d*$/.test(p.name))
  if (dividers.length !== 1) fail('expected exactly 1 labelled divider, got ' + dividers.length + ' → ' + JSON.stringify(dividers.map((d) => d.name)))
  if (dividers[0].description !== '构建配置') fail('divider text lost')
  if (!/^[-—–]{3,}\d*$/.test(dividers[0].name)) fail('divider synthetic name not dash-like: ' + dividers[0].name)
  ok('extractParams: 空名分隔行（纯横线丢弃 / 有文字 → 虚线条，名字唯一）')

  /* ── 4) Extended Choice：value 列表 + multiSelect 分隔符 ── */
  const extSingle = normalizeParamDef({
    _class: 'com.cwctravel.hudson.plugins.extended_choice_parameter.ExtendedChoiceParameterDefinition',
    name: 'ENV', description: '', type: 'PT_SINGLE_SELECT', value: 'uat,prod,pre', defaultValue: 'uat',
  })
  if (extSingle.type !== 'choice') fail('extended choice not recognized: ' + extSingle.type)
  if ((extSingle.choices || []).join('|') !== 'uat|prod|pre') fail('extended choice list parsed wrong: ' + JSON.stringify(extSingle.choices))
  const extMulti = normalizeParamDef({
    _class: 'com.cwctravel.hudson.plugins.extended_choice_parameter.ExtendedChoiceParameterDefinition',
    name: 'MODULES', description: '', type: 'PT_MULTI_SELECT', value: 'a\nb\nc', multiSelectDelimiter: '|', defaultValue: 'a|b',
  })
  if (extMulti.type !== 'choice' || extMulti.multiSelect !== true) fail('multiSelect not flagged')
  if ((extMulti.choices || []).join('|') !== 'a|b|c') fail('newline-separated list parsed wrong: ' + JSON.stringify(extMulti.choices))
  if (extMulti.delimiter !== '|') fail('multiSelectDelimiter lost')
  const uniMulti = normalizeParamDef({ _class: 'org.biouno.unochoice.MultiSelectParameter', name: 'SVC', description: '', defaultParameterValue: { value: 'x' } })
  if (uniMulti.multiSelect !== true || uniMulti.defaultValue !== 'x') fail('uno-choice MultiSelect broken: ' + JSON.stringify(uniMulti))
  ok('normalizeParamDef: Extended Choice（单/多选、逗号/换行、分隔符）与 uno-choice MultiSelect 识别正确')

  /* ── 5) 其它插件类型 ── */
  const cred = normalizeParamDef({ _class: 'com.cloudbees.plugins.credentials.CredentialsParameterDefinition', name: 'CRED', defaultValue: '' })
  if (cred.type !== 'credentials') fail('credentials type broken')
  const fileDef = normalizeParamDef({ _class: 'hudson.model.FileParameterDefinition', name: 'FILE', defaultValue: '' })
  if (fileDef.type !== 'file') fail('file type broken')
  const dynRef = normalizeParamDef({ _class: 'org.biouno.unochoice.DynamicReferenceParameter', name: '', description: '-----' })
  if (dynRef.type !== 'divider' || dynRef.description !== '') fail('dash-only divider should be dropped by extractParams')
  ok('normalizeParamDef: credentials / file / 无文字分隔行 处理正确')

  /* ── 6) 构建页 HTML → 脚本生成的选项（真实页面结构） ── */
  const html = [
    '<div class="jenkins-form-item tr ">',
    '<div class="jenkins-form-label help-sibling">project</div><div class="setting-main">',
    '<div name="parameter" id="choice-parameter-891145913130146" class="active-choice">',
    '<input name="name" type="hidden" value="project">',
    '<select name="value"><option value="boss_backend">boss_backend</option><option value="mls-fe-client">mls-fe-client</option>',
    '<option value="mls-fe-client-灰度推生产">mls-fe-client-灰度推生产</option><option value="a&amp;b">a&amp;b</option></select>',
    '</div></div></div>',
    '<div class="jenkins-form-item tr ">',
    '<div class="jenkins-form-label help-sibling">NodeVersion</div><div class="setting-main"><div class="jenkins-select" name="parameter">',
    '<input name="name" type="hidden" value="NodeVersion">',
    '<select class="jenkins-select__input" name="value"><option value="v24.12.0" selected="true">v24.12.0</option><option value="v20.16.0">v20.16.0</option></select>',
    '</div></div></div>',
    // 多选（multiple）与空名分隔行（不应产出选项）
    '<div class="jenkins-form-item"><input name="name" type="hidden" value="MODULES">',
    '<select name="value" multiple><option value="a" selected>a</option><option value="b">b</option></select></div>',
    '<div class="jenkins-form-item"><input name="name" type="hidden" value="">',
    '<select name="value"><option value="ignored">ignored</option></select></div>',
  ].join('\n')
  const page = parseBuildPageChoices(html)
  if ((page.project?.choices || []).join('|') !== 'boss_backend|mls-fe-client|mls-fe-client-灰度推生产|a&b') {
    fail('build-page project options wrong: ' + JSON.stringify(page.project))
  }
  if (page.NodeVersion?.defaultValue !== 'v24.12.0') fail('selected option not detected: ' + JSON.stringify(page.NodeVersion))
  if (page.MODULES?.multiSelect !== true) fail('multiple select not detected')
  if ('undefined' in page || page[''] !== undefined) fail('empty-name select should be skipped')
  ok('parseBuildPageChoices: 从构建页 HTML 解析脚本选项（含实体解码 / selected / multiple / 空名跳过）')

  /* ── 7) 无参数 / 异常输入 ── */
  if (extractParams(undefined).length !== 0) fail('undefined property should yield no params')
  if (extractParams([{ _class: 'hudson.model.ParametersDefinitionProperty', parameterDefinitions: [] }]).length !== 0) fail('empty definitions should yield no params')
  if (extractParams([{ _class: 'hudson.model.ParametersDefinitionProperty' }]).length !== 0) fail('missing parameterDefinitions should yield no params')
  if (Object.keys(parseBuildPageChoices('')).length !== 0) fail('empty html should yield no choices')
  ok('边界: 无参数 / 空定义 / 空 HTML 均安全返回空')

  console.log('\nALL PARAM PARSE TESTS PASSED')
} finally {
  clearTimeout(guard)
}

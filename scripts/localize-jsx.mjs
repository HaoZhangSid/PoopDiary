// Legacy one-off tool: rewrites root src/App.tsx. Not used by the Expo app.
import fs from 'node:fs/promises'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'

const file = 'src/App.tsx'
const source = await fs.readFile(file, 'utf8')
const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
const edits = []
const add = (start, end, value) => edits.push({ start, end, value })
const quote = (value) => JSON.stringify(value)
const between = (path, ancestor) => {
  const parents = []
  let current = path.parentPath
  while (current && current !== ancestor) {
    parents.push(current)
    current = current.parentPath
  }
  return parents
}
const renderLiteral = (path, container) => {
  const parents = between(path, container)
  if (parents.some((parent) => parent.isFunction() || parent.isCallExpression() || parent.isBinaryExpression() || parent.isMemberExpression() || parent.isAssignmentExpression())) return false
  const directParent = path.parentPath
  if (directParent.isArrayExpression() || directParent.isObjectProperty() || directParent.isObjectMethod()) return false
  return directParent.isConditionalExpression() || directParent.isLogicalExpression() || directParent.isJSXExpressionContainer()
}

traverse(ast, {
  JSXText(path) {
    const raw = path.node.value
    const value = raw.trim()
    if (!value || !/[\u3400-\u9fff]/u.test(value)) return
    const prefix = raw.slice(0, raw.indexOf(value))
    const suffix = raw.slice(raw.indexOf(value) + value.length)
    add(path.node.start, path.node.end, `${prefix}{tx(${quote(value)})}${suffix}`)
  },
  JSXAttribute(path) {
    const name = path.node.name.name
    const value = path.node.value
    if (!value || value.type !== 'StringLiteral' || !/[\u3400-\u9fff]/u.test(value.value)) return
    if (!['aria-label', 'placeholder', 'title', 'label', 'suffix', 'eyebrow'].includes(name)) return
    add(value.start, value.end, `{tx(${quote(value.value)})}`)
  },
  StringLiteral(path) {
    const value = path.node.value
    if (!/[\u3400-\u9fff]/u.test(value)) return
    const container = path.findParent((parent) => parent.isJSXExpressionContainer())
    if (!container || path.findParent((parent) => parent.isJSXAttribute())) return
    if (!renderLiteral(path, container)) return
    add(path.node.start, path.node.end, `tx(${quote(value)})`)
  },
})

const output = [...edits].sort((a, b) => b.start - a.start).reduce((text, edit) => `${text.slice(0, edit.start)}${edit.value}${text.slice(edit.end)}`, source)
await fs.writeFile(file, output)
console.log(`localized ${edits.length} JSX strings`)

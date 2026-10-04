// Legacy one-off tool: overwrites root Web locales. Not used by the Expo app.
import fs from 'node:fs/promises'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'

const source = await fs.readFile('src/App.tsx', 'utf8')
const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
const phrases = new Set()
const include = (value) => {
  const phrase = value.trim()
  if (phrase && /[\u3400-\u9fff]/u.test(phrase) && !phrase.startsWith('TEMPLATE:')) phrases.add(phrase)
}
traverse(ast, {
  StringLiteral(path) { include(path.node.value) },
  JSXText(path) { include(path.node.value) },
})

const translate = async (items, language) => {
  const input = items.join('\n')
  const url = new URL('https://translate.googleapis.com/translate_a/single')
  url.search = new URLSearchParams({ client: 'gtx', sl: 'zh-CN', tl: language, dt: 't', q: input }).toString()
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const json = await response.json()
      const output = json[0].map((segment) => segment[0]).join('').split('\n')
      if (output.length === items.length) return output.map((value) => value.trim())
      if (items.length === 1) return [json[0].map((segment) => segment[0]).join('').trim()]
      const midpoint = Math.ceil(items.length / 2)
      return [...await translate(items.slice(0, midpoint), language), ...await translate(items.slice(midpoint), language)]
    } catch (error) {
      if (attempt === 2) throw error
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
}

const sorted = [...phrases].sort((a, b) => a.localeCompare(b, 'zh-CN'))
await fs.mkdir('src/i18n/locales', { recursive: true })
for (const language of ['en', 'fi']) {
  const output = {}
  for (let index = 0; index < sorted.length; index += 10) {
    const batch = sorted.slice(index, index + 10)
    const translated = await translate(batch, language)
    batch.forEach((phrase, offset) => { output[phrase] = translated[offset] || phrase })
    if (index % 100 === 0) process.stdout.write(`${language}: ${index}/${sorted.length}\n`)
  }
  await fs.writeFile(`src/i18n/locales/${language}.json`, `${JSON.stringify(output, null, 2)}\n`)
}

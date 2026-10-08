import siteRaw from '../content/site.md?raw'

const roleFiles = import.meta.glob('../content/roles/*.md', { query: '?raw', import: 'default', eager: true })
const objectFiles = import.meta.glob('../content/objects/*.md', { query: '?raw', import: 'default', eager: true })

function parseMarkdown(source) {
  const normalized = source.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { attributes: {}, body: normalized.trim() }

  const attributes = {}
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    attributes[key] = value
  }
  return { attributes, body: match[2].trim() }
}

function collection(files) {
  return Object.values(files).reduce((items, source) => {
    const { attributes, body } = parseMarkdown(source)
    if (!attributes.id) return items
    items[attributes.id] = { ...attributes, body }
    return items
  }, {})
}

const parsedSite = parseMarkdown(siteRaw)

export const SITE = { ...parsedSite.attributes, body: parsedSite.body }
export const ROLES = collection(roleFiles)
export const FACTS = Object.fromEntries(
  Object.entries(collection(objectFiles)).map(([id, item]) => [id, {
    ...item,
    ref: item.reference,
  }]),
)


import fs from 'fs'
import path from 'path'

export function getSkillSchema(skillName: string, schemaName: string): string {
  const projectRoot = process.cwd()
  
  // 1. Try internal path (for production and tests)
  const internalPath = path.resolve(projectRoot, 'lib/skills/schemas', skillName, schemaName)
  
  // 2. Try parent .gemini path (for backward compatibility in local dev)
  const geminiPath = path.resolve(projectRoot, '../.gemini/skills', skillName, 'references', schemaName)
  
  // 3. Try local .gemini path (alternative local structure)
  const localGeminiPath = path.resolve(projectRoot, '.gemini/skills', skillName, 'references', schemaName)

  const pathsToTry = [internalPath, geminiPath, localGeminiPath]

  for (const p of pathsToTry) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8')
      }
    } catch (e) {
      // Continue to next path
    }
  }

  throw new Error(`Skill schema not found: ${skillName}/${schemaName}. Checked: ${pathsToTry.join(', ')}`)
}

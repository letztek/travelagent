import fs from 'fs'
import path from 'path'

export function getSkillSchema(skillName: string, schemaName: string): string {
  // In a real deployed environment (e.g. Vercel), accessing local files outside the project root might be tricky.
  // However, for this project structure and MVP, we can assume the skills folder is accessible or copied.
  // We will look for .gemini/skills relative to the project root.
  
  const projectRoot = process.cwd()
  // Adjust path to point to where .gemini folder is located relative to where nextjs is running
  // Assuming nextjs is running in 'travelagent' directory, and .gemini is in the parent.
  
  // STRATEGY: For now, to make it work in dev (and consistent with "Skill Driven"), 
  // we will try to read from the parent directory.
  
  const schemaPath = path.resolve(projectRoot, '../.gemini/skills', skillName, 'references', schemaName)
  
  try {
    return fs.readFileSync(schemaPath, 'utf-8')
  } catch (error) {
    console.error(`Failed to read skill schema at ${schemaPath}`, error)
    // Fallback for when running tests inside 'travelagent' directory where cwd is 'travelagent'
    const fallbackPath = path.resolve(projectRoot, '.gemini/skills', skillName, 'references', schemaName)
    try {
        return fs.readFileSync(fallbackPath, 'utf-8')
    } catch (e) {
        throw new Error(`Skill schema not found: ${skillName}/${schemaName}`)
    }
  }
}

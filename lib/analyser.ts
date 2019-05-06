import * as fs from 'fs'
import * as getBeautifulJson from 'json-beautify'
import * as path from 'path'
import {NodeModules} from './node-modules'

const WIX_UI_TPA_MODULE = 'wix-ui-tpa'

const COMPONENT_NAME_PLACEHOLDER = '{CMP}'

/**
 * Path in key defines where list of components can be found
 * Path in value defines how documentation stories can be found
 * {CMP} is used as a placeholder which is replaced with actual name
 */
const COMPONENT_SCAN_PATHS: {[listingPath: string]: string} = {
  'dist/stories': `${COMPONENT_NAME_PLACEHOLDER}`,
  'dist/src/components': `${COMPONENT_NAME_PLACEHOLDER}/docs`,
}

const COMPONENT_NAME_DIR_REGEXP = /^[A-Z][a-zA-Z0-9]*$/
const STYLABLE_FILE_NAME_REGEXP = /\.st\.css$/
const VARIABLES_FRAGMENT_REGEXP = /-st-mixin(.|[\n\r])*/m
const VARIABLE_NAMES_REGEXP = /^\s+[A-Za-z][A-Za-z0-9_-]*/gm
const VARIABLE_NAME_REGEXP = /[A-Za-z][A-Za-z0-9_-]*/

/**
 * Analyses content of WIX UI TPA library
 */
export class Analyser {
  private nodeModules: NodeModules
  private componentConfig: IComponentStructure = {}

  /**
   * Constructor
   * @param targetProjectRoot path to root of the project containing wix-ui-tpa node module
   */
  constructor(targetProjectRoot: string) {
    this.nodeModules = new NodeModules(targetProjectRoot)
  }

  /**
   * Exports components and their variables into JSON file
   * @param outputFile address of target JSON file
   */
  public exportComponentConfig(outputFile: string) {
    fs.writeFileSync(outputFile, getBeautifulJson(this.getComponentConfig(), null, 2, 80), {encoding: 'utf8'})
  }

  /**
   * Retrieves configuration of components and their variables
   */
  public getComponentConfig() {
    this.scanComponentNames()
    this.scanComponentVariables()
    return this.componentConfig
  }

  private walkDirRecursive(dir: string) {
    let files: string[] = []

    fs.readdirSync(dir).forEach(fileName => {
      const fullPath = path.resolve(dir, fileName)
      if (fs.statSync(fullPath).isDirectory()) {
        // istanbul ignore next
        files = files.concat(this.walkDirRecursive(fullPath))
      } else {
        files.push(fullPath)
      }
    })

    return files
  }

  private getWixUiTpaRoot() {
    return this.nodeModules.find(WIX_UI_TPA_MODULE)
  }

  private getComponentListBasePaths() {
    return Object.keys(COMPONENT_SCAN_PATHS).map(relative => ({
      relative,
      absolute: path.resolve(this.getWixUiTpaRoot(), relative),
    }))
  }

  private getComponentRoot(componentName: string) {
    for (const pathInfo of this.getComponentListBasePaths()) {
      const subPathTemplate = COMPONENT_SCAN_PATHS[pathInfo.relative]
      const subPath = subPathTemplate.replace(COMPONENT_NAME_PLACEHOLDER, componentName)
      const componentRoot = path.resolve(pathInfo.absolute, subPath)

      if (fs.existsSync(componentRoot)) {
        return componentRoot
      }
    }

    return null
  }

  private scanComponentNames() {
    const componentNames: string[] = []

    this.getComponentListBasePaths().forEach(basePath => {
      const pathComponentNames = fs.readdirSync(basePath.absolute).filter(item => item.match(COMPONENT_NAME_DIR_REGEXP))

      pathComponentNames.forEach(name => {
        if (!componentNames.includes(name)) {
          componentNames.push(name)
        }
      })
    })

    this.componentConfig = {}

    componentNames.forEach(componentName => {
      this.componentConfig[componentName] = []
    })
  }

  private scanComponentVariables() {
    Object.entries(this.componentConfig).forEach(([componentName]) => {
      this.componentConfig[componentName] = this.getSingleComponentVariables(componentName)
    })
  }

  private getStylableFiles(rootPath: string): string[] {
    return this.walkDirRecursive(rootPath).filter(file => file.match(STYLABLE_FILE_NAME_REGEXP))
  }

  private getFileOverridableVariables(stylableFilePath: string): string[] {
    const data = fs.readFileSync(stylableFilePath, {encoding: 'utf8'})

    const variablesCodeFragment = data.match(VARIABLES_FRAGMENT_REGEXP)

    if (!variablesCodeFragment) {
      // istanbul ignore next
      return []
    }

    const variableFragments = variablesCodeFragment[0].match(VARIABLE_NAMES_REGEXP)

    if (!variableFragments) {
      // istanbul ignore next
      return []
    }

    const vars = variableFragments.map(fragment => fragment.match(VARIABLE_NAME_REGEXP)[0])

    return vars
  }

  private getSingleComponentVariables(componentName: string): string[] {
    const componentRoot = this.getComponentRoot(componentName)

    if (!componentRoot) {
      return []
    }

    const stylableFiles = this.getStylableFiles(componentRoot)

    const vars: string[] = []

    stylableFiles.forEach(file => {
      const fileVars = this.getFileOverridableVariables(file)
      fileVars.forEach(variable => {
        if (!vars.includes(variable)) {
          vars.push(variable)
        }
      })
    })

    return vars
  }
}

/**
 * Component library components and their variables
 */
export interface IComponentStructure {
  /**
   * Variable names supported by a particular component
   */
  [componentName: string]: string[]
}

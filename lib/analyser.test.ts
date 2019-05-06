import * as fs from 'fs'
import * as path from 'path'
import {Analyser, IComponentStructure} from './analyser'

const analyser = new Analyser(__dirname)

const expectedComponentStructure: IComponentStructure = {
  Autocomplete: [],
  Button: [
    'MainTextColor',
    'MainBackgroundColor',
    'MainTextFont',
    'MainBorderWidth',
    'MainBorderRadius',
    'MainBorderColor',
    'margin-left',
  ],
  Card: ['MainInfoColor', 'MainMediaColor', 'MainBorderColor', 'MainBorderWidth'],
  Divider: ['MainDividerColor', 'MainDividerWidth'],
  Input: ['MainBackgroundColor', 'MainTextColor', 'MainBorderColor', 'MainTextFont'],
  OverlappingCard: ['MainInfoColor', 'MainMediaColor', 'MainBorderColor', 'MainBorderWidth'],
  Tabs: ['MainTextColor', 'MainTextFont', 'SelectedTabIndicatorColor', 'IndicatorColor'],
  Text: ['MainTextColor', 'MainTextFont'],
  ToggleSwitch: [
    'Selected',
    'Hover',
    'Disabled',
    'outerLabelBorderSize',
    'outerLabelBorderSizeChecked',
    'outerLabelBorderSizeDisabled',
    'outerLabelBorderSizeHover',
    'outerLabelBorderSizeHoverChecked',
    'outerLabelBorderColor',
    'outerLabelBorderColorChecked',
    'outerLabelBorderColorHover',
    'outerLabelBorderColorHoverChecked',
  ],
}

describe('Analyser', () => {
  describe('getComponentConfig', () => {
    it('returns supported variables for each existent component', () => {
      const actual = analyser.getComponentConfig()
      expect(actual).toEqual(expectedComponentStructure)
    })
  })

  describe('exportComponentConfig', () => {
    it('stores supported variables for each existent component into file', () => {
      const testFile = path.resolve('cache/test.json')
      analyser.exportComponentConfig(testFile)
      const jsonString = fs.readFileSync(testFile, {encoding: 'utf8'})
      const actual = JSON.parse(jsonString)
      expect(actual).toEqual(expectedComponentStructure)
    })
  })
})

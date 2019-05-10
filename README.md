# WIX UI TPA Connected Analyser

This is part of _Wix UI TPA Connected_ project.

In order for _Wix UI TPA Connected_ to generate wrappers for each _WIX UI TPA_ component, it needs to know what components exist inside the module and what variables are supported by each component. To avoid manual maintenance of this information, _WIX UI TPA Connected Analyser_ performs static analysis and retrieves required information.

## Usage

**CLI:**

Below command expects "wix-ui-tpa" to be available under "node_modules" of current working directory (or any parent directory of CWD)

```
analyse-wix-ui-tpa path/to/output.json
```

**Code**

To get object with component names and their variables:

```
import {Analyser} from 'wix-ui-tpa-connected-analyser'

const analyser = new Analyser(__dirname)
const components = analyser.getComponentConfig()
```

To generate beautified JSON file with same information:

```
import {Analyser} from 'wix-ui-tpa-connected-analyser'

const analyser = new Analyser(__dirname)
analyser.exportComponentConfig('someFile.json')
```

## Example output

```
{
  "Button": [
    "MainTextColor",
    "MainBackgroundColor",
    "MainTextFont",
    "MainBorderWidth",
    "MainBorderRadius",
    "MainBorderColor",
    "margin-left"
  ],
  "Divider": [ "MainDividerColor", "MainDividerWidth" ],
  "Input": [
    "MainBackgroundColor",
    "MainTextColor",
    "MainBorderColor",
    "MainTextFont"
  ],
  "Tabs": [
    "MainTextColor",
    "MainTextFont",
    "SelectedTabIndicatorColor",
    "IndicatorColor"
  ],
  "Text": [ "MainTextColor", "MainTextFont" ],
  "ToggleSwitch": [
    "Selected",
    "Hover",
    "Disabled",
    "outerLabelBorderSize",
    "outerLabelBorderSizeChecked",
    "outerLabelBorderSizeDisabled",
    "outerLabelBorderSizeHover",
    "outerLabelBorderSizeHoverChecked",
    "outerLabelBorderColor",
    "outerLabelBorderColorChecked",
    "outerLabelBorderColorHover",
    "outerLabelBorderColorHoverChecked"
  ],
  "Autocomplete": [],
  "Card": [ "MainInfoColor", "MainMediaColor", "MainBorderColor", "MainBorderWidth" ],
  "OverlappingCard": [ "MainInfoColor", "MainMediaColor", "MainBorderColor", "MainBorderWidth" ]
}
```

## Documentation

More detailed documentation is available under _./dist/docs_.

## Next Steps for Contributors

Currently this library optimistically uses regular expressions and conventions to extract information about components and their Stylable variables.

Better approach would be to use "css-tree" to convert Stylable files into AST. Then, code would need to follow imports and collect information about all existent variables. "wix-ui-tpa-connected-generator" module could then try injecting values into all variables and in this way would verify which variables are actually impacting CSS output.

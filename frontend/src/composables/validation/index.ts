import { useI18n } from 'vue-i18n'
import CustomValidations from './customValidations'
import { all as allVeeValidations } from '@vee-validate/rules'

const allValidations = Object.assign(allVeeValidations, CustomValidations)

export const useValidation = () => {
  const i18n = useI18n()

  function getTranslation (key: string, named: Record<string, string> = {}) {
    return i18n.t(key, named)
    // return i18n.global.t(key, named)
  }

  function getRuleTranslation (ruleName: string, ruleParams: any[], fieldName: string) {
    const translatedFieldName = !fieldName ? '-' : getTranslation(fieldName)
    const validationParamsForTranslation = getRuleParamsForTranslation(ruleName, ruleParams)
    const translationParams = { field: translatedFieldName, ...validationParamsForTranslation }
    return getTranslation('error.validation.' + ruleName, translationParams)
  }

  function getRuleParamsForTranslation (
    ruleName: string,
    ruleParams: any[]
  ): Record<string, string> {
    if (
      ruleName === 'digits' ||
      ruleName === 'length' ||
      ruleName === 'min' ||
      ruleName === 'max'
    ) {
      return { length: ruleParams[0] }
    }

    if (ruleName === 'between') {
      return { min: ruleParams[0], max: ruleParams[1] }
    }

    if (ruleName === 'dimensions') {
      return { width: ruleParams[0], height: ruleParams[1] }
    }

    if (ruleName === 'max_value') {
      return { max: ruleParams[0] }
    }

    if (ruleName === 'min_value') {
      return { min: ruleParams[0] }
    }

    if (ruleName === 'size') {
      return { size: ruleParams[0] }
    }

    if (
      ruleName === 'digits' ||
      ruleName === 'length' ||
      ruleName === 'min' ||
      ruleName === 'max'
    ) {
      return { length: ruleParams[0] }
    }

    return {}
  }

  function parseRule (rule: string) {
    let params: string[] = []
    const name = rule.split(':')[0]

    if (rule.includes(':')) {
      params = rule.split(':').slice(1).join(':').split(',')
    }

    return { name, params }
  }

  function buildParams (provided: unknown[] | Record<string, unknown>) {
    if (Array.isArray(provided)) {
      return provided
    }

    // #3073
    if (provided instanceof RegExp) {
      return [provided]
    }

    return Object.keys(provided).reduce(
      (prev, key) => {
        prev[key] = provided[key]

        return prev
      },
      {} as Record<string, unknown>
    )
  }

  function getNormalizeRules (
    rulesString: string
  ): Record<string, unknown[] | Record<string, unknown>> {
    const acc: Record<string, unknown[] | Record<string, unknown>> = {}

    const regexPattern = /regex:.*$/ // Match the regex rule starting with `regex:` till the end of the string
    const regexMatch = rulesString.match(regexPattern) // Find the regex rule
    let regexRule = ''

    if (regexMatch) {
      regexRule = regexMatch[0] // Extract the regex rule
      rulesString = rulesString.replace(regexPattern, '') // Remove the regex rule from the string
    }

    // Split the remaining rules and append the regex rule at the end
    const rulesArrayOfString = rulesString.split('|').filter(Boolean) // Split and remove empty entries
    if (regexRule) {
      rulesArrayOfString.push(regexRule)
    }

    return rulesArrayOfString.reduce((prev, rule) => {
      const parsedRule = parseRule(rule)
      if (!parsedRule.name) {
        return prev
      }

      prev[parsedRule.name] = buildParams(parsedRule.params)

      return prev
    }, acc)
  }

  function rules (targetRules: string, fieldName: string = '') {
    const normalizeRules = getNormalizeRules(targetRules)
    return Object.keys(normalizeRules).reduce(
      (accumulator, ruleName) => {
        const ruleParams = normalizeRules[ruleName] as Record<string, string>[]
        // Define the rule function
        const ruleFunction = function (inputValue: any) {
          const ruleFunction = allValidations[ruleName]
          if (typeof ruleFunction === 'function') {
            const ruleResult = ruleFunction(inputValue, ruleParams)

            // Handle synchronous results
            if (ruleResult instanceof Promise) {
              console.warn(`Validation rule "${ruleName}" is asynchronous and will be ignored.`)
              return false // Ignore asynchronous rules in this context
            }

            return ruleResult || getRuleTranslation(ruleName, ruleParams, fieldName)
          }
          return false
        }
        ruleFunction.ruleName = ruleName
        ruleFunction.ruleParams = ruleParams
        accumulator.push(ruleFunction)
        return accumulator
      },
      [] as ((inputValue: string | number) => boolean | string)[]
    )
  }

  return {
    rules
  }
}

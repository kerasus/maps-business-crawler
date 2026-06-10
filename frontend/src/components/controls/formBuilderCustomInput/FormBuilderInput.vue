<template>
  <div
    class="form-builder-input"
    :class="customClass">
    <div class="outsideLabel">
      {{ placeholder ? label : null }}
    </div>
    <q-input
      ref="input"
      v-model="inputData"
      :name="name"
      :filled="filled"
      :rules="rules"
      :lazy-rules="lazyRules"
      :label="placeholder ? undefined : label"
      :stack-label="!!placeholder"
      :type="localInputType"
      :error="error"
      :hint="computedHint ? $t(computedHint) : undefined"
      :error-message="errorMessage"
      :disable="disable"
      :mask="mask"
      :fill-mask="fillMask"
      :reverse-fill-mask="reverseFillMask"
      :clearable="clearable"
      :loading="loading"
      :readonly="readonly"
      :rounded="rounded"
      :outlined="outlined"
      :placeholder="placeholder"
      :class="customClass"
      :input-class="customClass"
      :autogrow="autogrow"
      @click="onClick"
      @keydown="onKeydown"
      @keypress="onKeyPress">
      <template #prepend>
        <q-icon
          v-if="props.inputType === 'iban'"
          name="payments" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import type { ValidationRule } from 'quasar'
import type { ComputedRef } from 'vue'
import { defineEmits, computed, type PropType } from 'vue'

defineOptions({
  name: 'FormBuilderInput'
})

const props = defineProps({
  name: {
    default: '',
    type: String
  },
  autogrow: {
    type: Boolean,
    default: false
  },
  preventPersian: {
    type: Boolean,
    default: false
  },
  preventEnglish: {
    type: Boolean,
    default: false
  },
  justNumber: {
    type: Boolean,
    default: false
  },
  mask: {
    type: String,
    default: undefined
  },
  fillMask: {
    type: String,
    default: undefined
  },
  reverseFillMask: {
    type: Boolean,
    default: undefined
  },
  inputType: {
    type: String,
    default: 'text',
    validator: (value: any) => {
      return [
        'text',
        'password',
        'textarea',
        'email',
        'search',
        'tel',
        'file',
        'number',
        'url',
        'time',
        'date',
        'datetime-local',
        'number+',
        'number-',
        'int',
        'int+',
        'int-',
        'phone',
        'persian',
        'iban'
      ].includes(value)
    }
  },
  maxlength: {
    type: [String, Number],
    default: undefined
  },
  hint: {
    type: String,
    default: undefined
  },
  value: {
    default: '',
    type: [String, Number, Boolean]
  },

  label: {
    default: '',
    type: String
  },
  class: {
    default: '',
    type: String
  },
  error: {
    default: false,
    type: Boolean
  },
  errorMessage: {
    default: '',
    type: String
  },
  disable: {
    default: false,
    type: Boolean
  },
  readonly: {
    default: false,
    type: Boolean
  },
  filled: {
    default: false,
    type: Boolean
  },
  color: {
    default: 'primary',
    type: String
  },
  type: {
    default: 'radio', // checkbox-toggle
    // Object type is for custom components
    type: [String, Object]
  },
  dense: {
    default: true,
    type: Boolean
  },
  rounded: {
    default: false,
    type: Boolean
  },
  responseKey: {
    default: () => {
      return {}
    },
    type: [String, Number, Boolean, Array, Boolean, Object]
  },
  outlined: {
    default: false,
    type: [Boolean]
  },
  flat: {
    default: false,
    type: [Boolean]
  },
  placeholder: {
    default: '',
    type: String
  },
  rules: {
    default: () => [] as ValidationRule[],
    type: Array as PropType<ValidationRule[]>
  },
  lazyRules: {
    default: false,
    type: [Boolean]
  },
  col: {
    default: '',
    type: String
  },
  clearable: {
    default: false,
    type: Boolean
  },
  loading: {
    default: false,
    type: Boolean
  }
})

const emits = defineEmits(['update:value', 'input', 'change', 'onClick', 'onKeyPress'])

const inputData: any = computed({
  get () {
    if (props.inputType === 'iban') {
      return typeof props.value === 'string' ? props.value.replace(/^IR/, '') : props.value
    }
    return props.value
  },
  set (newValue) {
    if (props.inputType === 'iban') {
      newValue = 'IR' + newValue
    }
    emits('update:value', newValue)
  }
})
const customClass = computed(() => {
  const preClass = localInputType.value === 'number' ? 'ltr ' : ''
  return preClass + props.class
})
const localInputType: any = computed(() => {
  return ['number+', 'number-', 'int', 'int+', 'int-', 'iban'].includes(props.inputType)
    ? 'number'
    : ['persian', 'phone', 'mobile'].includes(props.inputType)
        ? 'text'
        : props.inputType
})
const computedHint: ComputedRef<string | undefined> = computed(() => {
  if (props.inputType === 'phone' && !props.hint) {
    return 'inputHints.phone'
  }
  return props.hint
})

function onKeydown (event: KeyboardEvent) {
  // List of functional keys to allow
  const allowedKeys = [
    'Backspace',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Tab',
    'Shift',
    'Control',
    'Alt',
    'Escape',
    'End',
    'Home',
    'Delete'
  ]

  // Allow functional keys

  const isShortcutCombination =
    (event.ctrlKey || event.metaKey) &&
    ['c', 'v', 'x', 'a', 'z', 'y'].includes(event.key.toLowerCase())
  if (isShortcutCombination) {
    return
  }

  if (
    allowedKeys.includes(event.key) ||
    event.ctrlKey ||
    event.altKey ||
    isShortcutCombination
    // event.shiftKey
  ) {
    return
  }

  const inputElement = event.target as HTMLInputElement
  const maxLength = Number(props.maxlength)
  const inputValue = inputData.value.toString()
  const cursorPosition = inputElement.selectionStart
  const newValue =
    inputValue.slice(0, cursorPosition) + (event?.key || '') + inputValue.slice(cursorPosition)

  // handle maxLength
  if (maxLength && inputValue.length >= maxLength) {
    event?.preventDefault()
    return
  }

  // handle input type strategies
  const isValidKey = isValidInput(props.inputType, newValue)

  if (isValidKey) {
    // emits('update:value', newValue)
  } else {
    event?.preventDefault()
  }
}

function onClick (event: Event) {
  emits('onClick', event)
}

function onKeyPress (event: Event) {
  emits('onKeyPress', event)
}

function isValidInput (strategyType: string, inputValue: string): boolean {
  const numberRegexPatterns = {
    number: /^((-\d+\.)|(-)|(\d+\.?))\d*$/,
    //  cursorPosition is null in input type number sp we should can to put . (dot) in first
    'number+': /^\d*\.?\d*$/,
    'number-': /^-\d*\.?\d*$/,
    int: /^-?\d*$/,
    'int+': /^\d*$/,
    iban: /^\d*$/,
    // TODO: fix int- input type , where start with - (dash)
    // TODO: set a dash when the type is int -  and dont allow user to enter this dash
    'int-': /^-\d*$/,
    phone: /^\+?\d*$/
  }

  // number strategies
  if (Object.keys(numberRegexPatterns).includes(strategyType)) {
    const currentRegex = numberRegexPatterns[props.inputType as keyof typeof numberRegexPatterns]

    return currentRegex ? currentRegex.test(inputValue) : true
  }

  // force persian
  if (strategyType === 'persian') {
    const englishChars = /[a-zA-Z]/
    return !englishChars.test(inputValue)
  }

  return true
}
</script>

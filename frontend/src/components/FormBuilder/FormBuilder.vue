<template>
  <q-form
    ref="formRef"
    :autofocus="autofocus"
    @submit.prevent="onFormSubmit">
    <form-builder
      ref="formBuilderRef"
      v-model:value="inputs"
      :readonly="readonly"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="false"
      @update:value="onChangeInput" />
    <div
      class="form-action"
      :class="{ 'form-action--has-padding-top': actionPaddingTop }">
      <slot name="action">
        <template v-if="hasSubmit || hasCancel || hasSubmitAndNew">
          <div class="submit-new-btn">
            <q-btn
              v-if="hasSubmitAndNew"
              type="submit"
              flat
              name="submitAndNew"
              icon="add"
              :label="$t('general.submitAndNew')"
              color="secondary" />
          </div>
          <div class="submit-cancel-btn">
            <q-btn
              v-if="hasSubmit"
              type="submit"
              name="submit"
              :label="submitBtnLabel ? $t(submitBtnLabel) : $t('general.submit')"
              color="primary" />
            <q-btn
              v-if="hasCancel"
              :label="cancelBtnLabel ? $t(cancelBtnLabel) : $t('general.cancel')"
              :outline="cancelBtnOutline"
              :flat="cancelBtnFlat"
              :color="cancelBtnColor"
              @click="cancelForm" />
          </div>
        </template>
      </slot>
    </div>
    <q-inner-loading
      :showing="loading"
      color="primary" />
  </q-form>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { FormBuilderInputType } from 'src/types'
import type { ResponseErrorDetail } from 'src/boot/axios'
import { useValidation } from 'src/composables/validation'
import { FormBuilder, FormBuilderAssist } from 'quasar-form-builder'
import FormBuilderInput from 'components/controls/formBuilderCustomInput/FormBuilderInput.vue'
// import FormBuilderTime from 'src/components/controls/formBuilderCustomInput/FormBuilderTime.vue'
// import FormBuilderDate from 'src/components/controls/formBuilderCustomInput/FormBuilderDate.vue'
import FormBuilderFile from 'src/components/controls/formBuilderCustomInput/FormBuilderFile/index.vue'
// import FormBuilderDateTime from 'src/components/controls/formBuilderCustomInput/FormBuilderDateTime.vue'
// import FormBuilderCustomInput from 'components/controls/formBuilderCustomInput/FormBuilderCustomInput.vue'
import type { PropType } from 'vue'
import {
  ref,
  watch,
  computed,
  nextTick,
  onMounted,
  shallowRef,
  defineEmits,
  defineExpose
} from 'vue'

// export type SubmitterType = 'submitAndNew' | 'submit';

const inputs = defineModel('inputs', {
  type: Array as PropType<FormBuilderInputType[]>,
  default: () => []
})
const formData = defineModel('formData', {
  type: Object,
  required: true
})
const i18nManager = useI18n()

const props = defineProps({
  submitBtnLabel: {
    type: String,
    default: null
  },
  cancelBtnLabel: {
    type: String,
    default: null
  },
  cancelBtnOutline: {
    type: Boolean,
    default: true
  },
  cancelBtnFlat: {
    type: Boolean,
    default: false
  },
  cancelBtnColor: {
    type: String,
    default: 'secondary'
  },
  autofocus: {
    type: Boolean,
    default: true
  },
  hasCancel: {
    type: Boolean,
    default: true
  },
  hasSubmitAndNew: {
    type: Boolean,
    default: true
  },
  hasSubmit: {
    type: Boolean,
    default: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  focusOnMounted: {
    type: Boolean,
    default: true
  },
  actionPaddingTop: {
    type: Boolean,
    default: true
  }
})

interface InputRef {
  type?: string;
  $refs: {
    input?: {
      hasError?: boolean;
      validate?: () => void;
      resetValidation?: () => void;
    };
    [key: string]: any;
  };
}

interface InputRefs {
  [key: string]: InputRef[];
}

// const FormBuilderDateComponent = shallowRef(FormBuilderDate)
const FormBuilderFileComponent = shallowRef(FormBuilderFile)
// const FormBuilderTimeComponent = shallowRef(FormBuilderTime)
const FormBuilderInputComponent = shallowRef(FormBuilderInput)
// const FormBuilderDateTimeComponent = shallowRef(FormBuilderDateTime)
// const FormBuilderCustomInputComponent = shallowRef(FormBuilderCustomInput)

const validation = useValidation()
const formRef = ref<any>(null)
const formBuilderRef = ref<InstanceType<typeof FormBuilder> | null>(null)
const emit = defineEmits(['submit', 'cancel', 'on-failed-validation', 'mounted'])

function onChangeInput () {
  formData.value = Object.assign(formData.value, FormBuilderAssist.getFormData(inputs.value))
}

function onFormSubmit (event: Event | SubmitEvent) {
  submitForm(event)
}

function submitForm (event: Event | SubmitEvent) {
  validate()
  if (!hasError()) {
    emit('submit', event)
  } else {
    emit('on-failed-validation')
  }
}

function cancelForm () {
  emit('cancel')
}

function loadFormDataFromProps () {
  FormBuilderAssist.setInputValues(formData.value, inputs.value)
}

function hasError () {
  let hasError = false
  function checkInputs (refs: InputRefs) {
    if (Array.isArray(inputs)) {
      Object.keys(refs).forEach((inputKey) => {
        const inputs = refs[inputKey]
        if (inputs) {
          inputs.forEach((input) => {
            if (input.type === 'formBuilder') {
              checkInputs(input.$refs as InputRefs)
            } else if (input.$refs?.input?.hasError === true) {
              hasError = true
            }
          })
        }
      })
    }
  }

  if (formBuilderRef.value?.$refs) {
    checkInputs(formBuilderRef.value.$refs as InputRefs)
  }

  return hasError
}

function validate () {
  callInputFunction('validate')
}

function resetValidations () {
  callInputFunction('resetValidation')
}

function callInputFunction (functionName: 'validate' | 'resetValidation') {
  function checkInputs (refs: InputRefs) {
    Object.keys(refs).forEach((inputKey) => {
      const inputs = refs[inputKey]
      if (Array.isArray(inputs)) {
        inputs.forEach((input) => {
          const inputFunction = input.$refs?.input?.[functionName]
          if (typeof inputFunction === 'function') {
            inputFunction()
          } else if (input.$refs) {
            checkInputs(input.$refs as InputRefs)
          }
        })
      }
    })
  }

  if (formBuilderRef.value?.$refs) {
    checkInputs(formBuilderRef.value.$refs as InputRefs)
  }
}

function addRuleAsClass (targetInputs: Array<any>, ruleName: string) {
  targetInputs.forEach((input) => {
    if (input.type === 'formBuilder') {
      addRuleAsClass(input.value, ruleName)
    } else {
      if (
        Array.isArray(input.rules) &&
        input.rules.length > 0 &&
        input.rules.map((rule: { ruleName?: string }) => rule.ruleName).includes(ruleName)
      ) {
        input.class += ' ' + ruleName + ' '
      }
    }
  })
}

function readonlyAllInputs (newState: boolean) {
  if (!formBuilderRef.value) {
    return
  }
  formBuilderRef.value?.readonlyAllInputs(newState)
}

function focus (): void {
  if (formBuilderRef.value?.focus) {
    formBuilderRef.value.focus()
  }
}

function setInputsTranslationAndValidation (inputs: FormBuilderInputType[]) {
  inputs.forEach((input, index) => {
    if (input.type === 'formBuilder') {
      setInputsTranslationAndValidation(inputs[index]?.value || [])
    } else {
      const inputLabel = input.label
      const inputRules = input.rules
      if (typeof inputLabel === 'string' && !inputs[index]?.labelTranslated && inputs[index]) {
        inputs[index].label = i18nManager.t(inputLabel)
        inputs[index].labelTranslated = true
      }
      if (typeof inputRules === 'string' && inputs[index]) {
        inputs[index].rules = validation.rules(inputRules, inputLabel)
      }
    }
  })
}

function setErrors (errors: ResponseErrorDetail[]) {
  errors.forEach((item) => {
    FormBuilderAssist.setAttributeByName(inputs.value, item.loc, 'error', true)
    FormBuilderAssist.setAttributeByName(
      inputs.value,
      item.loc,
      'errorMessage',
      i18nManager.t(item.type)
    )
  })
}

function loadCustomInputs (inputs: FormBuilderInputType[]) {
  inputs.forEach((input, index) => {
    if (input.type === 'formBuilder') {
      loadCustomInputs(inputs[index]?.value || [])
    } else if (inputs[index]) {
      if (input.type === 'file') {
        inputs[index].type = FormBuilderFileComponent
      } else if (input.type === 'date') {
        // inputs[index].type = FormBuilderDateComponent
      } else if (input.type === 'time') {
        // inputs[index].type = FormBuilderTimeComponent
      } else if (input.type === 'dateTime') {
        // inputs[index].type = FormBuilderDateTimeComponent
      } else if (input.type === 'input') {
        inputs[index].type = FormBuilderInputComponent
      } else if (input.type === 'commission') {
        // inputs[index].type = FormBuilderCustomInputComponent
      }
    }
  })
}

function hasFile (inputs: FormBuilderInputType[]) {
  let hasFileInput = false
  inputs.forEach((input, index) => {
    if (input.type === 'formBuilder' && inputs[index]) {
      hasFile(inputs[index].value || [])
    } else {
      if (isFileInput(input)) {
        hasFileInput = true
      }
    }
  })

  return hasFileInput
}

function isFileInput (input: FormBuilderInputType) {
  if (typeof input.type === 'string' && input.type === 'file') {
    return true
  }

  return typeof input.type !== 'string' && input.type?.name === 'FormBuilderFile'
}

function convertJSONToFormData (jsonData: Record<string, any>): FormData {
  const formData = new FormData()
  Object.keys(jsonData).forEach((key) => {
    const input = FormBuilderAssist.getInputsByName(inputs.value, key)
    if (
      typeof jsonData[key] !== 'undefined' &&
      (!input || !isFileInput(input) || (isFileInput(input) && typeof jsonData[key] === 'object'))
    ) {
      formData.append(key, jsonData[key])
    }
  })

  return formData
}

function getNormalizedFormData (inputs: FormBuilderInputType[]): FormData | Record<string, any> {
  if (hasFile(inputs)) {
    return convertJSONToFormData(formData.value)
  } else {
    return formData.value
  }
}

function prepareInputs () {
  loadCustomInputs(inputs.value)
  setInputsTranslationAndValidation(inputs.value)
  addRuleAsClass(inputs.value, 'required')
}

const inputNames = computed(() => inputs.value.map((input) => input.name))

prepareInputs()

watch(
  formData,
  () => {
    loadFormDataFromProps()
  },
  {
    deep: true
  }
)

watch(
  inputs,
  () => {
    loadFormDataFromProps()
  },
  {
    deep: true
  }
)

watch(
  inputNames,
  () => {
    prepareInputs()
  },
  {
    deep: true
  }
)

watch(
  () => ({ readonly: props.readonly }),
  ({ readonly }) => {
    readonlyAllInputs(readonly)
  },
  {
    immediate: true
  }
)

onMounted(async () => {
  await nextTick(async () => {
    loadFormDataFromProps()
    await nextTick(async () => {
      resetValidations()
      readonlyAllInputs(props.readonly)
      if (props.focusOnMounted) {
        focus()
      }
      await nextTick(() => {
        emit('mounted')
      })
    })
  })
})

defineExpose({
  focus,
  hasFile,
  hasError,
  validate,
  setErrors,
  submitForm,
  resetValidations,
  getNormalizedFormData,
  convertJSONToFormData
})
</script>

<style scoped lang="scss">
.form-action {
  display: flex;
  justify-content: space-between;
  gap: $space-4;
  padding-top: $spacing-none;
  &.form-action--has-padding-top {
    padding-top: $space-8;
  }
  .submit-cancel-btn {
    display: flex;
    gap: $space-4;
  }
}
</style>

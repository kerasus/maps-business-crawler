<template>
  <q-dialog
    v-model="showDialog"
    :persistent="loading">
    <confirmation
      :title="selectedRowForChangeStatus.title"
      :message="selectedRowForChangeStatus.message"
      submit-label="general.agree"
      cancel-label="general.cancel"
      :icon="selectedRowForChangeStatus.icon"
      :title-color="selectedRowForChangeStatus.titleColor"
      :loading="loading"
      @submit="onChangeStatus"
      @cancel="hideDialog" />
  </q-dialog>
  <template v-if="row && row[stateKey]">
    <q-btn
      v-if="!readOnly"
      color="neutral-40"
      dense
      outline
      :loading="loading"
      class="full-width icon-button"
      @click="onClickStatusBtn(row)">
      <q-icon
        name="oms:dot"
        :color="row[stateKey].active ? activeIconColor : deactiveIconColor" />
      {{ row[stateKey].active ? $t(activeLabel) : $t(deactiveLabel) }}
    </q-btn>
    <q-chip
      v-else
      class="tag"
      :class="row[stateKey].active ? 'text-success-dark' : 'text-neutral-40'">
      {{ row[stateKey].active ? $t(activeLabel) : $t(deactiveLabel) }}
    </q-chip>
  </template>
</template>

<script setup lang="ts">
import type BaseAPI from 'src/repositories/BaseAPI'
import { ref, type Ref, defineEmits } from 'vue'
import type { ConfirmationProps } from 'src/components/cards/confirmation.vue'
import Confirmation from 'src/components/cards/confirmation.vue'

export interface ExtendedConfirmationProps extends Omit<ConfirmationProps, 'message'> {
  message?: string | ((data: unknown) => string) | undefined;
}

interface RowData {
  [key: string]: any; // Allow dynamic keys for flexibility
  flagStates?: {
    active: boolean;
  };
}

interface StatusBtnProps {
  row?: RowData | null;
  api: BaseAPI<unknown>;
  stateKey?: string;
  entityIdKey?: string;
  activeConfirmationOptions?: ExtendedConfirmationProps;
  deactiveConfirmationOptions?: ExtendedConfirmationProps;
  activeLabel?: string;
  deactiveLabel?: string;
  activeIconColor?: string;
  deactiveIconColor?: string;
  readOnly?: boolean;
}

const defaultActiveTitleColor = 'success-dark'
const defaultDeactiveTitleColor = 'error'
const defaultActiveIcon = 'oms:unlock'
const defaultDeactiveIcon = 'oms:lock'

const props = withDefaults(defineProps<StatusBtnProps>(), {
  row: null,
  entityIdKey: 'id',
  stateKey: 'flagStates',
  activeLabel: 'general.active',
  deactiveLabel: 'general.deActive',
  activeIconColor: 'success',
  deactiveIconColor: 'error',
  readOnly: false,
  activeConfirmationOptions: () => ({
    title: 'dialog.activeCustomerTitle',
    message: 'dialog.activeCustomerMessage',
    icon: 'oms:unlock',
    titleColor: defaultActiveTitleColor,
    submitLabel: 'general.agree',
    cancelLabel: 'general.cancel'
  }),
  deactiveConfirmationOptions: () => ({
    title: 'dialog.deactiveCustomerTitle',
    message: 'dialog.deactiveCustomerMessage',
    icon: 'oms:lock',
    titleColor: defaultDeactiveTitleColor,
    submitLabel: 'general.agree',
    cancelLabel: 'general.cancel'
  })
})

const emits = defineEmits(['change', 'changing'])

const showDialog = ref(false)
const loading = ref(false)

const selectedRowForChangeStatus: Ref<{
  title?: string;
  message?: string;
  row: RowData | null;
  icon?: string | null;
  titleColor?: string;
}> = ref({
  title: '',
  message: '',
  row: null,
  icon: null,
  titleColor: 'neutral-0'
})

function getDialogActiveMessage (row: RowData): string | undefined {
  if (typeof props.activeConfirmationOptions.message === 'function') {
    return props.activeConfirmationOptions.message(row)
  }
  return props.activeConfirmationOptions.message
}

function getDialogDeactiveMessage (row: RowData): string | undefined {
  if (typeof props.deactiveConfirmationOptions.message === 'function') {
    return props.deactiveConfirmationOptions.message(row)
  }
  return props.deactiveConfirmationOptions.message
}

function onClickStatusBtn (row: RowData) {
  selectedRowForChangeStatus.value.row = row
  showDialog.value = true
  selectedRowForChangeStatus.value.title = row[props.stateKey].active
    ? props.deactiveConfirmationOptions.title
    : props.activeConfirmationOptions.title

  selectedRowForChangeStatus.value.message = row[props.stateKey].active
    ? getDialogDeactiveMessage(row)
    : getDialogActiveMessage(row)

  selectedRowForChangeStatus.value.icon = row[props.stateKey].active
    ? props.deactiveConfirmationOptions.icon || defaultDeactiveIcon
    : props.activeConfirmationOptions.icon || defaultActiveIcon

  selectedRowForChangeStatus.value.titleColor = row[props.stateKey].active
    ? props.deactiveConfirmationOptions.titleColor || defaultDeactiveTitleColor
    : props.activeConfirmationOptions.titleColor || defaultActiveTitleColor
}

function hideDialog () {
  showDialog.value = false
}

function onChangeStatus () {
  loading.value = true
  emits('changing')

  const entityId = selectedRowForChangeStatus.value.row?.[props.entityIdKey]

  if (!entityId) {
    return
  }

  const promise = selectedRowForChangeStatus.value.row?.[props.stateKey].active
    ? props.api.delete(entityId)
    : props.api.activate(entityId)
  promise.finally(() => {
    showDialog.value = false
    loading.value = false
    emits('change')
  })
}
</script>

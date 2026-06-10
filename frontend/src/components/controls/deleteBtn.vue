<template>
  <q-dialog
    v-model="showDialog"
    :persistent="loading">
    <confirmation
      :title="selectedRowForChangeStatus.title"
      :message="selectedRowForChangeStatus.message"
      submit-label="بله"
      cancel-label="انصراف"
      :icon="selectedRowForChangeStatus.icon"
      :title-color="selectedRowForChangeStatus.titleColor"
      :loading="loading"
      @submit="onChangeStatus"
      @cancel="hideDialog" />
  </q-dialog>

  <q-btn
    icon="delete"
    class="icon-button"
    color="red"
    :loading="loading"
    flat
    dense
    @click="onClickDeleteBtn(row)" />
</template>

<script setup lang="ts">
import type BaseAPI from 'src/repositories/BaseAPI'
import Confirmation from 'src/components/cards/confirmation.vue'
import { ref, type Ref, defineEmits } from 'vue'
import type { ConfirmationProps } from 'src/components/cards/confirmation.vue'

interface ConfirmationData {
  row: any;
  title: string;
  message: string;
  icon: string;
  titleColor: string;
}

const defaultActiveTitleColor = 'success-dark'
const defaultDeactiveTitleColor = 'error'

const selectedRowForChangeStatus: Ref<{
  title?: string;
  message?: string;
  row: any | null;
  icon?: string | null;
  titleColor?: string;
}> = ref({
  title: '',
  message: '',
  row: null,
  icon: null,
  titleColor: defaultDeactiveTitleColor
})

interface ExtendedConfirmationProps extends Omit<ConfirmationProps, 'message'> {
  message: string | ((data: unknown) => string);
}

const props = withDefaults(
  defineProps<{
    row?: any;
    api?: BaseAPI<unknown>;
    entityIdKey?: string;
    changeStatusPromise?: (row: any) => Promise<void | Error>;
    getConfirmationData?: (row: any) => ConfirmationData;
    activeConfirmationOptions?: ExtendedConfirmationProps;
    deactiveConfirmationOptions?: ExtendedConfirmationProps;
  }>(),
  {
    row: null,
    api: undefined,
    entityIdKey: 'id',
    changeStatusPromise: undefined,
    getConfirmationData: undefined,
    activeConfirmationOptions: () => ({
      title: 'dialog.activeCustomerTitle',
      message: 'dialog.activeCustomerMessage',
      icon: 'oms:unlock',
      titleColor: defaultActiveTitleColor,
      submitLabel: 'بله',
      cancelLabel: 'انصراف'
    }),
    deactiveConfirmationOptions: () => ({
      title: 'توجه',
      message: 'آیا از حذف این مورد اطمینان داریم؟',
      icon: 'dangerous',
      titleColor: defaultDeactiveTitleColor,
      submitLabel: 'بله',
      cancelLabel: 'انصراف'
    })
  }
)

const emits = defineEmits(['change', 'delete', 'changing'])

const showDialog = ref(false)
const loading = ref(false)

// function getDialogActiveMessage(row: any): string {
//   if (typeof props.activeConfirmationOptions.message === 'function') {
//     return props.activeConfirmationOptions.message(row);
//   }
//   return props.activeConfirmationOptions.message;
// }

function getDialogDeactiveMessage (row: any) {
  if (typeof props.deactiveConfirmationOptions.message === 'function') {
    return props.deactiveConfirmationOptions.message(row)
  }
  return props.deactiveConfirmationOptions.message
}

function onClickDeleteBtn (row: any) {
  showDialog.value = true

  const updatedData = getUpdatedSelectedRowForChangeStatus(row)
  selectedRowForChangeStatus.value.row = updatedData.row
  selectedRowForChangeStatus.value.title = updatedData.title
  selectedRowForChangeStatus.value.message = updatedData.message
  selectedRowForChangeStatus.value.icon = updatedData.icon
  selectedRowForChangeStatus.value.titleColor = updatedData.titleColor
}

function getUpdatedSelectedRowForChangeStatus (row: any) {
  if (typeof props.getConfirmationData === 'function') {
    return props.getConfirmationData(row)
  }

  return {
    row,
    icon: props.deactiveConfirmationOptions.icon,
    title: props.deactiveConfirmationOptions.title,
    message: getDialogDeactiveMessage(row),
    titleColor: props.deactiveConfirmationOptions.titleColor || defaultDeactiveTitleColor
  }
}

function hideDialog () {
  showDialog.value = false
}

async function onChangeStatus () {
  loading.value = true
  emits('changing')

  if (typeof props.changeStatusPromise === 'function') {
    try {
      await props.changeStatusPromise(selectedRowForChangeStatus.value.row)
      onDelete()
    } finally {
      afterChangeStatus()
    }
    return
  }

  if (!props.api) {
    return
  }
  const entityId = selectedRowForChangeStatus.value.row[props.entityIdKey]

  if (!entityId) {
    showDialog.value = false
    return
  }

  try {
    await props.api.delete(entityId)
    onDelete()
  } finally {
    afterChangeStatus()
  }
}

function onDelete () {
  emits('delete')
}

function afterChangeStatus () {
  showDialog.value = false
  loading.value = false
  emits('change')
}
</script>

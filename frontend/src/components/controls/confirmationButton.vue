<script setup lang="ts">
import { defineEmits, ref } from 'vue'
import Confirmation from 'src/components/cards/confirmation.vue'

export interface ConfirmationButtonProps {
  btnTitle: string;
  btnColor?: string;
  confirmationTitle: string;
  confirmationMessage: string;
  confirmationSubmitLabel?: string;
  confirmationCancelLabel?: string;
  confirmationIcon?: string | null;
  confirmationTitleColor?: string;
  loading?: boolean | undefined;
}

withDefaults(defineProps<ConfirmationButtonProps>(),
  {
    btnColor: 'primary',
    confirmationIcon: 'dangerous',
    confirmationTitleColor: 'error',
    confirmationSubmitLabel: 'بله',
    confirmationCancelLabel: 'انصراف'
  })

const emit = defineEmits(['accept', 'cancel', 'click'])

const showDialog = ref(false)

function hideDialog () {
  showDialog.value = false
}

function onClickConfirmationButton () {
  showDialog.value = true
  emit('click')
}

function onAccept () {
  hideDialog()
  emit('accept')
}

async function onCancel () {
  hideDialog()
  emit('cancel')
}

</script>

<template>
  <q-btn
    :color="btnColor"
    :label="btnTitle"
    :loading="loading"
    @click="onClickConfirmationButton" />
  <q-dialog
    v-model="showDialog"
    :persistent="loading">
    <confirmation
      :title="confirmationTitle"
      :message="confirmationMessage"
      :submit-label="confirmationSubmitLabel"
      :cancel-label="confirmationCancelLabel"
      :icon="confirmationIcon"
      :title-color="confirmationTitleColor"
      :loading="loading"
      @submit="onAccept"
      @cancel="onCancel" />
  </q-dialog>
</template>

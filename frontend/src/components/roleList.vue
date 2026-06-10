<script setup lang="ts">
import { defineEmits, ref } from 'vue'
import { useUser } from 'src/stores/user'
import DeleteBtn from 'src/components/controls/deleteBtn.vue'
import UserAPI, { type UserType, type RoleType, userRoleOptions, getUserRoleLabel } from 'src/repositories/user'

const props = defineProps<{
  user: UserType,
  editMode: boolean,
}>()

const emits = defineEmits(['change'])

const userManager = useUser()
const userAPI = new UserAPI()
const loading = ref(false)
const selectedRole = ref<string | null>(null)

async function assignRole () {
  if (!props.user?.id || !selectedRole.value) {
    return
  }

  try {
    loading.value = true
    await userAPI.assignRole(props.user.id, selectedRole.value)
  } finally {
    loading.value = false
    emits('change')
  }
}

async function removeRole (role: RoleType) {
  if (!props.user?.id || !role.name) {
    return
  }

  try {
    loading.value = true
    await userAPI.removeRole(props.user.id, role.name)
  } finally {
    loading.value = false
    emits('change')
  }
}
</script>

<template>
  <q-list
    bordered
    separator
    class="role-list">
    <q-item>
      <q-item-section>
        <q-item-label>نقش‌ها</q-item-label>
      </q-item-section>
      <q-item-section
        v-if="userManager.isAdmin && editMode"
        side>
        <div>
          <q-select
            v-model="selectedRole"
            :loading="loading"
            emit-value
            map-options
            :options="userRoleOptions"
            label="نقش"
            style="width: 200px">
            <template #after>
              <q-btn
                color="primary"
                flat
                icon="add"
                :loading="loading"
                @click="assignRole" />
            </template>
          </q-select>
        </div>
      </q-item-section>
    </q-item>
    <q-linear-progress
      v-if="loading"
      indeterminate />
    <template v-else>
      <q-item
        v-for="(role, roleIndex) in user.roles"
        :key="roleIndex"
        v-ripple
        clickable
        class="role-item">
        <q-item-section>
          <q-item-label v-if="role.name">{{ getUserRoleLabel(role.name) }}</q-item-label>
        </q-item-section>
        <q-item-section
          v-if="userManager.isAdmin"
          side>
          <delete-btn
            v-if="editMode"
            :row="role"
            :loading="loading"
            :change-status-promise="removeRole"
            :use-flag="false" />
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

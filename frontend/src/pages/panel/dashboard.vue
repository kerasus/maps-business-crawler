<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">داشبورد</div>
    <div class="row q-col-gutter-md">
      <div class="col-md-4 col-12">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">اماکن</div>
            <div class="text-caption q-mt-sm">مشاهده و مدیریت نقاط جمع‌آوری‌شده</div>
          </q-card-section>
          <q-card-actions>
            <q-btn
              flat
              color="primary"
              label="رفتن به لیست"
              :to="{ name: 'Panel.Place.List' }" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-md-4 col-12">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">برچسب‌ها</div>
            <div class="text-caption q-mt-sm">دسته‌بندی اماکن با tag</div>
          </q-card-section>
          <q-card-actions>
            <q-btn
              flat
              color="primary"
              label="رفتن به لیست"
              :to="{ name: 'Panel.Tag.List' }" />
          </q-card-actions>
        </q-card>
      </div>
      <div
        v-if="userManager.isAdmin || userManager.isManager"
        class="col-md-4 col-12">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">کاربران</div>
            <div class="text-caption q-mt-sm">مدیریت کاربران و نقش‌ها</div>
          </q-card-section>
          <q-card-actions>
            <q-btn
              flat
              color="primary"
              label="رفتن به لیست"
              :to="{ name: 'Panel.User.List' }" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useUser } from 'src/stores/user'

const userManager = useUser()
</script>

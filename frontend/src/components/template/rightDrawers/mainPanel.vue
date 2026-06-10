<script setup lang="ts"></script>

<template>
  <div class="right-drawer">
    <q-list
      bordered
      class="rounded-borders"
      style="max-width: 350px">
      <q-item-label header> اعلان ها </q-item-label>

      <q-item
        v-ripple
        clickable>
        <q-item-section avatar>
          <q-avatar
            color="red"
            text-color="white"
            icon="warning" />
        </q-item-section>

        <q-item-section>
          <q-item-label lines="1"> توقف نمادهاي معاملاتي(سارومح)،(کمنگنزح) </q-item-label>
          <q-item-label
            caption
            lines="2">
            <q-badge rounded> 1 دقیقه پیش </q-badge>
            به اطلاع می رساند،در پایان معاملات امروز نماد معاملاتی حق تقدم شرکت سیمان
            ارومیه(سارومح)، حق تقدم استفاده نشده شرکت معادن منگنز ایران(کمنگنزح) با توجه به پایان
            مهلت پذیره نویسی، متوقف خواهند شد. مدیریت عملیات بازار شرکت بورس اوراق بهادار تهران
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item
        v-ripple
        clickable>
        <q-item-section avatar>
          <q-avatar
            color="primary"
            text-color="white"
            icon="clock" />
        </q-item-section>

        <q-item-section>
          <q-item-label lines="1">
            وقفه معاملاتي نماد (ساروم1) به علت تغييرات بيش از 20 درصدي قيمت
          </q-item-label>
          <q-item-label
            caption
            lines="2">
            <q-badge rounded> 2 دقیقه پیش </q-badge>
            به اطلاع مي رساند نماد معاملاتي شركت سيمان‌اروميه‌ (ساروم1) با توجه به تغييرات بيش از 20
            درصدي قيمت سهام، به مدت 60 دقيقه در وضعيت سفارش گيري قرار مي گيرد و سپس معاملات در دامنه
            نوسان فعلي ادامه خواهد يافت. ضروري است سرمايه گذاران محترم علاوه بر توجه به اين موضوع،
            اطلاعات منتشره شده بر روي تارنماي كدال (codal.ir) و ساير عوامل موثر بر قيمت سهام را در
            تصميم گيري هاي خود لحاظ نمايند. مديريت عمليات بازار شركت بورس اوراق بهادار تهران
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped lang="scss">
.right-drawer {
  color: #515768;
}
</style>

<template>
    <v-main class="d-flex align-center justify-center bg-grey-lighten-4">
      <v-card
        class="pa-8 mx-auto"
        width="100%"
        max-width="420"
        elevation="0"
        style="border: 0.5px solid #58111A; border-radius: 2px;"
      >
        <!-- Icon -->
        <div class="text-center mb-4">
          <v-icon color="#58111A" size="64">mdi-emoticon-sad-outline</v-icon>
        </div>
        <!-- Title -->
         <h2 class="text-h6 font-weight-bold text-center">404</h2>
        <h2 class="text-h6 font-weight-bold text-center mb-4 mt-n6">Page NOT FOUND</h2>
        <!-- Back Home Button -->
        <v-btn
          variant="flat"
          block
          color="#58111A"
          rounded="pill"
          elevation="0"
          class="py-5"
          @click="() => $router.push('/')"
        >
          Back to Home
        </v-btn>
      </v-card>
    </v-main>
</template>

<script setup>

</script>

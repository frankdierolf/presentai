import PocketBase from 'pocketbase';

export default defineNuxtPlugin((nuxtApp) => {
  const pocketbaseUrl = useRuntimeConfig().public.pocketbaseUrl;
  const pb = new PocketBase(pocketbaseUrl as string);
  nuxtApp.provide('pb', pb);
});

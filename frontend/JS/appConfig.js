const appConfig = {
  USE_PRODUCTION_API: false,
  // Using relative path so calls go to the same origin (served by backend)
  LOCAL_API_BASE: "/api",
  PROD_API_BASE: "/api",

  get API_BASE() {
    return this.USE_PRODUCTION_API ? this.PROD_API_BASE : this.LOCAL_API_BASE;
  },
};

export default appConfig;

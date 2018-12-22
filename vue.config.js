module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/scss/_variables.scss";
          @import "@/scss/_layout.scss";
          @import "@/scss/_global.scss";
        `
      }
    }
  }
};

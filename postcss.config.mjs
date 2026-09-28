const config = {
  plugins: {
    "@csstools/postcss-global-data": { files: ["./src/styles/media.css"] },
    "postcss-custom-media": {},
    autoprefixer: {},
  },
};

export default config;

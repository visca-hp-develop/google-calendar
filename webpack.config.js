const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isPropduction = process.env.NODE_ENV !== "development";

module.exports = {
  mode: isPropduction ? "production" : "development",
  devtool: isPropduction ? false : "source-map",
  entry: "./src/main.ts",
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: "json-loader",
        type: "javascript/auto",
      },
      {
        test: /\.s?css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: "css-loader",
            options: { importLoaders: 2, sourceMap: true },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  output: {
    filename: "google-calendar.js",
    path: path.join(__dirname, "dist"),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "google-calendar.css",
    }),
  ],
};

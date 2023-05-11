const supportsContainerQueries = "container" in document.documentElement.style;
if (!supportsContainerQueries) {
  import("container-query-polyfill");
}

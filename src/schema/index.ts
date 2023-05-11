import i18next from "i18next";
import { z } from "zod";
import { makeZodI18nMap } from "zod-i18n-map";
import translation from "zod-i18n-map/locales/ja/zod.json";
import { iframeSchema } from "./iframe";
import * as argumentsSchema from "./arguments";

translation.errors.invalid_type_received_undefined = "必須項目です。";

i18next.init({
  lng: "ja",
  resources: {
    ja: { zod: translation },
  },
});
z.setErrorMap(makeZodI18nMap({ t: i18next.t, ns: "zod" }));

export { iframeSchema, argumentsSchema };

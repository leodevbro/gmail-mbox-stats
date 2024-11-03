import { getSlimDateTime } from "./utils/mainUtils";

export const str = {
  authoringText: `gmail-mbox-stats v1.1.0
Created by leodevbro (Levan Katsadze)
* leodevbro@gmail.com
* linkedin.com/in/leodevbro
* github.com/leodevbro
* facebook.com/leodevbro`,

  donationText: `If you feel like donating
* buymeacoffee.com/leodevbro
* ko-fi.com/leodevbro`,

  EMPTY_ADDR: "(-)",
  EMPTY_NAME: "{=}",
  STRANGE: "STRANGE-->",
} as const;

const startDateTime = {
  v: new Date(),
} as const;

export const slimStartDateTime = {
  v: getSlimDateTime(startDateTime.v),
};

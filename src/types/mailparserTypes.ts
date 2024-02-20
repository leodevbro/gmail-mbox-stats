const exampleOfOneValueOfFromOrTo = {
  address: "leodevbro@gmail.com" as `${string}@${string}.${string}`,
  name: "Levan Katsadze" as string,
} as const;

const exampleOfFromOrTo = {
  value: [
    exampleOfOneValueOfFromOrTo,
  ] as (typeof exampleOfOneValueOfFromOrTo)[],
  html: '<span class="mp_address_group"><span class="mp_address_name">Levan Katsadze</span> &lt;<a href="mailto:leodevbro@gmail.com" class="mp_address_email">leodevbro@gmail.com</a>&gt;</span>' as string,
  text: '"Levan Katsadze" <leodevbro@gmail.com>' as string,
} as const;

const exampleObjOfHeaders = {
  "x-gm-thrid": "1786467213154837659" as string,
  "x-gmail-labels": "Sent,Opened" as string,
  "mime-version": "1.0" as string,
  date: "2023-12-30T01:01:24.000Z" as string,
  references: [
    "<CAKQNcJcvLk-8O0X36+v1xQW3AzMgaKP9o_6XPMdzvfO+jeKsnw@mail.gmail.com>",
    "<C01B40B9-2E0B-4EF5-BC80-7CD20E769218@gmail.com>",
  ] as string[],
  "in-reply-to": "<C01B40B9-2E0B-4EF5-BC80-7CD20E769218@gmail.com>" as string,
  "message-id":
    "<CAKQNcJf6xnUS+B4jEgnQr1psUXWXZbsH-G2f9T8d01XO8FrfvQ@mail.gmail.com>" as string,
  subject: "Re: Find the most sender - gmail" as string,
  from: exampleOfFromOrTo,
  to: exampleOfFromOrTo,
  "content-type": {
    value: "multipart/alternative" as string,
    params: { boundary: "000000000000100d3c060dafb0ca" as string },
  },
} as const;

export type TyExampleObjOfHeaders = typeof exampleObjOfHeaders;
export type TyKeyOfMboxMailHeaders = keyof TyExampleObjOfHeaders;

export type TyValueOfMboxMailHeaders =
  TyExampleObjOfHeaders[TyKeyOfMboxMailHeaders];

type TyDeepHintsOfHeadersMap = {
  get: <
    TKey extends TyKeyOfMboxMailHeaders,
    TVal = TyExampleObjOfHeaders[TKey],
  >(
    key: TKey,
  ) => TVal;
};

export type TyMboxMailHeaders = TyDeepHintsOfHeadersMap &
  Map<TyKeyOfMboxMailHeaders, TyValueOfMboxMailHeaders>;

const dsfsdf = new Map() as TyMboxMailHeaders;

export const qqqqq = dsfsdf.get("from");

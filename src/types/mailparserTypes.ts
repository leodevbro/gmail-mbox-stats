export type TyMailDomain = `@${string}.${string}`;
export type TyMailAddress = `${string}${TyMailDomain}`;

export type TyParticipant = {
  address?: TyMailAddress; // "leodevbro@gmail.com"
  name?: string; // "Levan Katsadze"
  group?: any[];
};

export type TyParticipationFamilyInfo = {
  html: string; // '<span class="mp_address_group"><span class="mp_address_name">Levan Katsadze</span> &lt;<a href="mailto:leodevbro@gmail.com" class="mp_address_email">leodevbro@gmail.com</a>&gt;</span>'
  text: string; // generalInfo // '"Levan Katsadze" <leodevbro@gmail.com>'
  value?: TyParticipant[];
};

export type TyGmailMailHeadersAsObj = {
  "x-gm-thrid"?: string; // "1786467213154837659"
  "x-gmail-labels"?: string; // "Sent,Opened"
  "mime-version"?: string; // "1.0"
  references?: string[]; // ["<CAKQNcJcvLk-8O0X36+v1xQW3AzMgaKP9o_6XPMdzvfO+jeKsnw@mail.gmail.com>", "<C01B40B9-2E0B-4EF5-BC80-7CD20E769218@gmail.com>", ]
  "in-reply-to"?: string; // "<C01B40B9-2E0B-4EF5-BC80-7CD20E769218@gmail.com>"
  "content-type"?: {
    value: string; // "multipart/alternative"
    params: {
      boundary: string; // "000000000000100d3c060dafb0ca"
    };
  };

  subject?: string; // "Re: Find the most frequent sender - gmail"

  //

  "message-id": `${"<"}${string}${">"}`; // "<CAKQNcJf6xnUS+B4jEgnQr1psUXWXZbsH-G2f9T8d01XO8FrfvQ@mail.gmail.com>"
  date?: Date; // Date object which can be converted to ISO format string: "2023-12-30T01:01:24.000Z",
  //
  from?: TyParticipationFamilyInfo;
  to?: TyParticipationFamilyInfo;
  "delivered-to"?: TyParticipationFamilyInfo;
  cc?: TyParticipationFamilyInfo;
  bcc?: TyParticipationFamilyInfo;
};

export type TyKeyOfMboxMailHeaders = keyof TyGmailMailHeadersAsObj;

export type TyValueOfMboxMailHeaders =
  TyGmailMailHeadersAsObj[TyKeyOfMboxMailHeaders];

type TyDeepHintsOfHeadersMap = {
  get: <
    TKey extends TyKeyOfMboxMailHeaders,
    TVal = TyGmailMailHeadersAsObj[TKey],
  >(
    key: TKey,
  ) => TVal;
};

export type TyMboxMailHeaders = TyDeepHintsOfHeadersMap &
  Map<TyKeyOfMboxMailHeaders, TyValueOfMboxMailHeaders>;

type TyParticipationData = Pick<
  TyGmailMailHeadersAsObj,
  "from" | "to" | "delivered-to" | "cc" | "bcc"
>;

export type TyFamilyKind = keyof TyParticipationData;

type TyMajorData = Pick<TyGmailMailHeadersAsObj, "date" | "message-id">;

export type TyMainInfoForMail = TyParticipationData & TyMajorData;

// zen/Zen means normalized, simplified, cleaned, to avoid runtime errors
export type TyZenParticipant = {
  address: string; // "leodevbro@gmail.com" | "()" as empty
  name: string; // "Levan Katsadze" | "()" as empty
};

// zen/Zen means normalized, simplified, cleaned, to avoid runtime errors
export type TyZenParticipationData = {
  from: TyZenParticipant[];
  zenTo: TyZenParticipant[]; // combination of "to" and "delivered-to"
  cc: TyZenParticipant[];
  bcc: TyZenParticipant[];
};

export type TyZenFamilyKind = keyof TyZenParticipationData;

export type TyZenMainInfoForMail = TyZenParticipationData & TyMajorData;

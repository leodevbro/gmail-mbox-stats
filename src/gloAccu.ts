export const step: {
  v: number; // This is count of all mails, not only succesfuly proccessed mails.
  succeededV: number; // count of mails which are processed successfully
  //
  countOfFullCountCheckForTimer: number;
  //
  countOfMessagesWithSenderCategory: {
    me: number;
    notMe: number;
    empty: number;
    hidden: number;
  };

  totalSizeOfAttachmentsWithSenderCategory: {
    // number in bytes
    me: number;
    notMe: number;
    empty: number;
    hidden: number;
  };
} = {
  v: 0,
  succeededV: 0,
  //
  countOfFullCountCheckForTimer: 0,
  //
  countOfMessagesWithSenderCategory: {
    me: 0,
    notMe: 0,
    empty: 0,
    hidden: 0,
  },

  totalSizeOfAttachmentsWithSenderCategory: {
    me: 0,
    notMe: 0,
    empty: 0,
    hidden: 0,
  },
};

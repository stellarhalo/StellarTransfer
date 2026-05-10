import Config from "../types/config.type";

const defaultConfigVariables: Config[] = [
  {
    key: "general.appName",
    defaultValue: "StellarTransfer",
    value: "StellarTransfer",
    type: "string",
  },
  {
    key: "general.appUrl",
    defaultValue: "http://localhost:3000",
    value: "http://localhost:3000",
    type: "string",
  },
  {
    key: "general.showHomePage",
    defaultValue: "true",
    value: "true",
    type: "boolean",
  },
  {
    key: "share.allowRegistration",
    defaultValue: "true",
    value: "true",
    type: "boolean",
  },
  {
    key: "share.allowUnauthenticatedShares",
    defaultValue: "true",
    value: "true",
    type: "boolean",
  },
  {
    key: "share.maxExpiration",
    defaultValue: "0 days",
    value: "0 days",
    type: "timespan",
  },
  {
    key: "share.shareIdLength",
    defaultValue: "8",
    value: "8",
    type: "number",
  },
  {
    key: "share.maxSize",
    defaultValue: "0",
    value: "0",
    type: "filesize",
  },
  {
    key: "share.chunkSize",
    defaultValue: "10000000",
    value: "10000000",
    type: "filesize",
  },
  {
    key: "share.autoOpenShareModal",
    defaultValue: "false",
    value: "false",
    type: "boolean",
  },
  {
    key: "email.enableShareEmailRecipients",
    defaultValue: "false",
    value: "false",
    type: "boolean",
  },
  {
    key: "smtp.enabled",
    defaultValue: "false",
    value: "false",
    type: "boolean",
  },
  {
    key: "oauth.disablePassword",
    defaultValue: "false",
    value: "false",
    type: "boolean",
  },
  {
    key: "legal.enabled",
    defaultValue: "true",
    value: "true",
    type: "boolean",
  },
  {
    key: "legal.imprintText",
    defaultValue:
      "StellarTransfer / 星闪包 is a private file transfer workspace. Configure your company imprint in the admin panel when the backend service is available.",
    value:
      "StellarTransfer / 星闪包 is a private file transfer workspace. Configure your company imprint in the admin panel when the backend service is available.",
    type: "text",
  },
  {
    key: "legal.imprintUrl",
    defaultValue: "",
    value: "",
    type: "string",
  },
  {
    key: "legal.privacyPolicyText",
    defaultValue:
      "StellarTransfer / 星闪包 only uses the information required to upload, receive, and manage shared files. Replace this placeholder with your production privacy policy in the admin panel.",
    value:
      "StellarTransfer / 星闪包 only uses the information required to upload, receive, and manage shared files. Replace this placeholder with your production privacy policy in the admin panel.",
    type: "text",
  },
  {
    key: "legal.privacyPolicyUrl",
    defaultValue: "",
    value: "",
    type: "string",
  },
];

export default defaultConfigVariables;

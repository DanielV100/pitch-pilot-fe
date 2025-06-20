export interface StartRes {
  prefix: string;
  urls: string[];
}
export interface FinishRes {
  object: string;
  url: string;
}
export interface PresignRes {
  signedUrl: string;
}

declare type CB = (err?: null | Error, result?: string) => any;
declare const writeSnapshot: (filename: string | undefined | CB, cb?: CB | undefined) => boolean;
export { writeSnapshot };

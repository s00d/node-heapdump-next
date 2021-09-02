declare type CB = (err?: null | Error, result?: string) => any;
declare class Heapdump {
    private addon;
    private errno;
    constructor();
    writeSnapshot(filename: string | undefined | CB, cb?: CB): boolean;
}
export { Heapdump };

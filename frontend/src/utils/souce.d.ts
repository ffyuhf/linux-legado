import type { BookSoure, RssSource, Source } from '../source';
export declare const isInvaildSource: (source: Source) => boolean;
export declare const getSourceUniqueKey: (source: Source) => string;
export declare const getSourceName: (source: Source) => string;
export declare const isSourceMatches: (source: Source, searchKey: string) => boolean;
export declare const convertSourcesToMap: (sources: Source[]) => Map<string, Source>;
export declare const normalizeSource: (source: any) => void;
export declare const emptyBookSource: BookSoure;
export declare const emptyRssSource: RssSource;

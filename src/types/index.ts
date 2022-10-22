// @flow

export type ID = number | string;

export type URL = string;

export type Story = {
    id: ID;
    title: string;
    by: string;
    time: number | string;
    score: number | string;
    kids?: Array<number | string>;
    text?: string;
    url?: string;
    descendants?: number | string;
}
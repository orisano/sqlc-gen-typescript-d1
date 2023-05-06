import { Account } from "./models"

const getAccountQuery = `-- name: GetAccount :one
SELECT pk, id, display_name, email FROM account WHERE id = ?1`;

export type GetAccountParams = {
  accountId: string;
};

export type GetAccountRow = {
  pk: number;
  id: string;
  displayName: string;
  email: string | null;
};

type RawGetAccountRow = {
  pk: number;
  id: string;
  display_name: string;
  email: string | null;
};

export async function getAccount(
  d1: D1Database,
  args: GetAccountParams
): Promise<GetAccountRow | null> {
  return await d1
    .prepare(getAccountQuery)
    .bind(args.accountId)
    .first<RawGetAccountRow | null>()
    .then((raw: RawGetAccountRow | null) => raw ? {
      pk: raw.pk,
      id: raw.id,
      displayName: raw.display_name,
      email: raw.email,
    } : null);
}

const listAccountsQuery = `-- name: ListAccounts :many
SELECT account.pk AS account_pk, account.id AS account_id, account.display_name AS account_display_name, account.email AS account_email FROM account`;

export type ListAccountsRow = {
  account: Account;
};

type RawListAccountsRow = {
  account_pk: number;
  account_id: string;
  account_display_name: string;
  account_email: string | null;
};

export async function listAccounts(
  d1: D1Database
): Promise<D1Result<ListAccountsRow>> {
  return await d1
    .prepare(listAccountsQuery)
    .all<RawListAccountsRow>()
    .then((r: D1Result<RawListAccountsRow>) => { return {
      ...r,
      results: r.results ? r.results.map((raw: RawListAccountsRow) => { return {
        account: {
          pk: raw.account_pk,
          id: raw.account_id,
          displayName: raw.account_display_name,
          email: raw.account_email,
        },
      }}) : undefined,
    }});
}

const createAccountQuery = `-- name: CreateAccount :exec
INSERT INTO account (id, display_name, email)
VALUES (?1, ?2, ?3)`;

export type CreateAccountParams = {
  id: string;
  displayName: string;
  email: string | null;
};

export async function createAccount(
  d1: D1Database,
  args: CreateAccountParams
): Promise<D1Result> {
  return await d1
    .prepare(createAccountQuery)
    .bind(args.id, args.displayName, args.email)
    .run();
}

const updateAccountDisplayNameQuery = `-- name: UpdateAccountDisplayName :one
UPDATE account
SET display_name = ?1
WHERE id = ?2
RETURNING pk, id, display_name, email`;

export type UpdateAccountDisplayNameParams = {
  displayName: string;
  id: string;
};

export type UpdateAccountDisplayNameRow = {
  pk: number;
  id: string;
  displayName: string;
  email: string | null;
};

type RawUpdateAccountDisplayNameRow = {
  pk: number;
  id: string;
  display_name: string;
  email: string | null;
};

export async function updateAccountDisplayName(
  d1: D1Database,
  args: UpdateAccountDisplayNameParams
): Promise<UpdateAccountDisplayNameRow | null> {
  return await d1
    .prepare(updateAccountDisplayNameQuery)
    .bind(args.displayName, args.id)
    .first<RawUpdateAccountDisplayNameRow | null>()
    .then((raw: RawUpdateAccountDisplayNameRow | null) => raw ? {
      pk: raw.pk,
      id: raw.id,
      displayName: raw.display_name,
      email: raw.email,
    } : null);
}

const getAccountsQuery = `-- name: GetAccounts :many
SELECT pk, id, display_name, email FROM account WHERE id IN (?1)`;

export type GetAccountsParams = {
  ids: string[];
};

export type GetAccountsRow = {
  pk: number;
  id: string;
  displayName: string;
  email: string | null;
};

type RawGetAccountsRow = {
  pk: number;
  id: string;
  display_name: string;
  email: string | null;
};

export async function getAccounts(
  d1: D1Database,
  args: GetAccountsParams
): Promise<D1Result<GetAccountsRow>> {
  let query = getAccountsQuery;
  const params: any[] = [args.ids[0]];
  query = query.replace("(?1)", expandedParam(1, args.ids.length, params.length));
  params.push(...args.ids.slice(1));
  return await d1
    .prepare(query)
    .bind(...params)
    .all<RawGetAccountsRow>()
    .then((r: D1Result<RawGetAccountsRow>) => { return {
      ...r,
      results: r.results ? r.results.map((raw: RawGetAccountsRow) => { return {
        pk: raw.pk,
        id: raw.id,
        displayName: raw.display_name,
        email: raw.email,
      }}) : undefined,
    }});
}

function expandedParam(n: number, len: number, last: number): string {
    const params: number[] = [n];
    for (let i = 1; i < len; i++) {
        params.push(last + i);
    }
    return "(" + params.map((x: number) => "?" + x).join(", ") + ")"
}

import { TableContext, ContainsAll } from "@/cql/types";
import { UnionToTuple } from "type-fest";

// ---------------------------------------------------------------------------
// Column deletion targets
// ---------------------------------------------------------------------------

/** Delete an entire column's value (sets it to null). */
export type ColumnDeletion = {
  kind: "column";
  column: string;
};

/** Delete a single field inside a UDT column: `udt_col.field_name`. */
export type FieldDeletion = {
  kind: "field";
  column: string;
  field: string;
};

/** Delete a single entry from a map by key: `map_col[key]`. */
export type IndexDeletion = {
  kind: "index";
  column: string;
  key: unknown;
};

export type Deletion = ColumnDeletion | FieldDeletion | IndexDeletion;

// ---------------------------------------------------------------------------
// Builder state
// ---------------------------------------------------------------------------

export interface DeleteBuilderInput {
  /** Columns / fields / map entries to delete. Empty means full-row delete. */
  deletions?: readonly Deletion[];
  whereConditions: readonly [string, string, unknown][];
  ifConditions?: readonly [string, string, unknown][];
  ifExists?: boolean;
  timestamp?: number;
}

// ---------------------------------------------------------------------------
// Type-level validation helpers
// ---------------------------------------------------------------------------

/**
 * True when every partition key and every clustering key of the table appears
 * at least once as the first element of a WHERE condition tuple.
 */
export type HasFullPrimaryKey<
  WhereConditions extends readonly [string, string, unknown][] | undefined,
  TContext extends TableContext,
> = WhereConditions extends readonly [string, string, unknown][]
  ? ContainsAll<
      UnionToTuple<WhereConditions[number][0]>,
      [...TContext["partitionKeys"], ...TContext["clusteringKeys"]]
    >
  : false;

import { WithOption } from "../types";

export const clusteringOrderBy = (
  fieldName: string,
  orderType: "asc" | "desc",
): WithOption => ({
  type: "clustering_order_by",
  value: `CLUSTERING ORDER BY (${fieldName} ${orderType.toUpperCase()})`,
});

export const id = (id: string): WithOption => ({
  type: "id",
  value: `ID = ${id}`,
});

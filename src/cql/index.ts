/* eslint-disable @typescript-eslint/no-unused-vars */

import { CQL } from "./builder/cql";
import { cql } from "./cql-types";
import { withOptions } from "./with-options";

const db = new CQL({});

const userByUsernameAndId = db
  .create()
  .table("MyTable")
  .ifNotExists()
  .schema({
    id: cql.scalar.uuid,
    username: cql.scalar.text,
    firstName: cql.scalar.text,
    email: cql.scalar.text,
    phone: cql.scalar.text,
  })
  .primaryKey(["username", "id"], "first_name") // partition = username + id
  .clusteringOrderBy({ first_name: "asc" })
  .with(withOptions.id("some-id"), withOptions.compactStorage());

const userContext = userByUsernameAndId.build();

const user = userContext
  .select("*")
  .where("first_name", "=", "some-value")
  .where("username", "=", "some-value") // partition keys are required
  .where("id", "=", "some-value") // partition keys are required
  .build();

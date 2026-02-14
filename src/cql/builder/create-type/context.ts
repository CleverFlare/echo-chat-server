import { Client } from "cassandra-driver";
import { CreateTypeBuilderInput } from "./types";
import { InferTs } from "@/cql/with-options/types";
import { CqlType, UdtMeta } from "@/cql/cql-types/types";
import { DropTypeBuilder } from "../drop-type/builder";

export class CreateTypeContext<TContext extends CreateTypeBuilderInput> {
  drop;

  protected constructor(
    private client: Client,
    private statement: string,
    public readonly context: TContext,
  ) {
    const dropBinding = DropTypeBuilder.create(client)
      .type(context.type)
      .ifExists();

    if (context.keyspace) dropBinding.keyspace(context.keyspace);

    this.drop = () =>
      dropBinding as DropTypeBuilder<{
        type: TContext["type"];
        keyspace: TContext["keyspace"];
        ifExists: true;
      }>;
  }

  static create<T extends CreateTypeBuilderInput>(
    client: Client,
    statement: string,
    context: T,
  ): CreateTypeContext<T> {
    return new CreateTypeContext<T>(client, statement, context);
  }

  getContext() {
    return this.context;
  }

  toCQL() {
    return this.statement;
  }

  asType() {
    return {
      cql: this.context.type,
      _meta: {
        kind: "udt" as const,
        ts: undefined as unknown as {
          [K in keyof TContext["schema"]]: InferTs<TContext["schema"][K]>;
        },
        name: this.context.type,
        schema: this.context.schema,
      },
    } satisfies CqlType<
      { [K in keyof TContext["schema"]]: InferTs<TContext["schema"][K]> },
      "udt",
      UdtMeta<TContext["schema"]>
    >;
  }

  async execute(): Promise<void> {
    await this.client.execute(this.statement);
  }
}

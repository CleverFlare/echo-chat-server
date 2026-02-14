import { Client } from "cassandra-driver";
import { CreateTypeBuilderInput } from "./types";
import { InferTs } from "@/cql/with-options/types";
import { CqlType, UdtMeta } from "@/cql/cql-types/types";

export class CreateTypeContext<TContext extends CreateTypeBuilderInput> {
  protected constructor(
    private client: Client,
    private statement: string,
    public readonly context: TContext,
  ) {}

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

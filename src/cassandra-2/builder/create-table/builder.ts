class CreateTableBuilder {
  parts: {
    keyspace?: string;
    table?: string;
    ifNotExists?: boolean;
    columns?: string;
    primaryKey?: string;
    width?: string[];
  } = {
    ifNotExists: false,
    width: [],
  };

  constructor() {}

  keyspace(name: string) {
    this.parts.keyspace = name;

    return this;
  }

  table(name: string) {
    this.parts.table = name;

    return this;
  }

  ifNotExists(option?: boolean) {
    this.parts.ifNotExists = option !== undefined ? option : true;

    return this;
  }

  columns() {}

  primaryKey() {}

  with() {}

  build() {}
}

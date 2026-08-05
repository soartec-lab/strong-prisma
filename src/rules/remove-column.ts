import type { ParsedStatement } from "../parser/types";
import type { CheckContext, Rule } from "./types";

const detect = (statement: ParsedStatement, _context: CheckContext): boolean => {
  return statement.type === "alterTable" && statement.action === "dropColumn";
};

const message = (statement: ParsedStatement): string => {
  return `Removing column "${statement.column}" from table "${statement.table}" may cause errors in running application`;
};

const suggestion = (statement: ParsedStatement): string => {
  return `
❌ Bad: Removing a column immediately can cause errors if the application still references it

✅ Good: Follow these steps:
   1. Add @ignore to the '${statement.column}' field in schema.prisma so Prisma Client
      stops reading/writing it, and remove remaining usages from your code:
         ${statement.column} <type> @ignore
   2. Run 'npx prisma generate' and deploy the application
   3. Then apply this migration to drop the column

To approve this operation (reviewed and intentional), add above the statement:
   -- prisma-strong-migrations-approve-next-line removeColumn

Or to skip this check, add above the statement:
   -- prisma-strong-migrations-disable-next-line removeColumn
`.trim();
};

export const removeColumnRule: Rule = {
  name: "removeColumn",
  severity: "error",
  description: "Removing a column may cause application errors",
  detect,
  message,
  suggestion,
};

import {
  Table as TiptapTable,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";

export const Table = TiptapTable.extend({
  addExtensions() {
    return [TableRow, TableHeader, TableCell];
  },
}).configure({
  cellMinWidth: 35,
  resizable: true,
});

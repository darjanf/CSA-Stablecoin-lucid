//./components/UserColumnDefs.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { VaultUTxO } from "../types/vaultUTxO";

// createColumnHelper helps us create columns with maximum type safety.
const columnHelperUTxO = createColumnHelper<VaultUTxO>();

export const userColumnDefsUTxO = [
    columnHelperUTxO.accessor((row) => row.address, {
      id: "address",
      cell: (info) => info.getValue(),
      header: (info) => <span>Address</span>,
    }),
    columnHelperUTxO.accessor((row) => row.lovelace, {
      id: "lovelace",
      cell: (info) => <span>{info.getValue()}</span>,
      header: () => <span>Lovelace</span>,
    }),
    columnHelperUTxO.accessor((row) => row.collRatio, {
      id: "collRatio",
      cell: (info) => <span>{info.getValue()}</span>,
      header: () => <span>Collateral Ratio</span>,
    }),
    columnHelperUTxO.accessor((row) => row.stablecoinAmount, {
      id: "stablecoinAmount",
      cell: (info) => <span>{info.getValue()}</span>,
      header: () => <span>Stablecoin Amount</span>,
    }),
    columnHelperUTxO.accessor((row) => row.txHash, {
      id: "txHash",
      cell: (info) => <span>{info.getValue()}</span>,
      header: () => <span>TxHash</span>,
      enableHiding: true
    }),
    columnHelperUTxO.accessor((row) => row.outputIndex, {
      id: "outputIndex",
      cell: (info) => <span>{info.getValue()}</span>,
      header: () => <span>OutputIndex</span>,
    })
  ];

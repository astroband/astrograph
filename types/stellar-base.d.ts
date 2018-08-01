declare module "stellar-base";
declare module "graphql-sequelize";
declare module "dataloader-sequelize";

// {
//   namespace stellar {
//     namespace xdr {
//       interface IXDRStruct {
//         toXDR(): Buffer;
//       }
//
//       interface ILedgerHeader extends IXDRStruct {
//         ledgerSeq(): number;
//
//         ledgerHash(): string;
//
//         ledgerVersion(): number;
//
//         baseFee(): number;
//
//         baseReserve(): number;
//
//         maxTxSetSize(): number;
//
//         totalCoins(): number;
//       }
//
//       export type LedgerHeader = ILedgerHeader;
//     }
//   }
//
//   export = stellar;
// }

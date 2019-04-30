import { IAssetInput } from "../../../model/asset_input";
import { PagingParams } from "../../../util/paging";
import { IHorizonAssetData } from "../../types";

export class HorizonAssetsDataSource {
  public all(criteria: IAssetInput, pagingParams: PagingParams): IHorizonAssetData[] {
    return [
      {
        asset_type: "credit_alphanum4",
        asset_code: "ZZZ",
        asset_issuer: "GCLCYDPGX7YBYMV627KV2GAXFEYYKJYZBCZEFVKELIHJ62SLKFAREUWH",
        paging_token: "ZZZ_GCLCYDPGX7YBYMV627KV2GAXFEYYKJYZBCZEFVKELIHJ62SLKFAREUWH_credit_alphanum4",
        amount: "922337203684.7500000",
        num_accounts: 18,
        flags: {
          auth_required: true,
          auth_revocable: true,
          auth_immutable: false
        }
      },
      {
        asset_type: "credit_alphanum4",
        asset_code: "ZZZ",
        asset_issuer: "GBYMZE2O2CCLYVZKDBSE4SBWYSMFGYSAX3QN5KY4EV32ADEKVY5WIXWC",
        paging_token: "ZZZ_GBYMZE2O2CCLYVZKDBSE4SBWYSMFGYSAX3QN5KY4EV32ADEKVY5WIXWC_credit_alphanum4",
        amount: "922337203685.0000000",
        num_accounts: 3,
        flags: {
          auth_required: true,
          auth_revocable: true,
          auth_immutable: false
        }
      },
      {
        asset_type: "credit_alphanum4",
        asset_code: "ZZZ",
        asset_issuer: "GBKSCKCMFEIZSELRVTYO5XWGSEYURZY7AEV35MYW65DBS6FT6OHKP5IZ",
        paging_token: "ZZZ_GBKSCKCMFEIZSELRVTYO5XWGSEYURZY7AEV35MYW65DBS6FT6OHKP5IZ_credit_alphanum4",
        amount: "398.0000000",
        num_accounts: 1,
        flags: {
          auth_required: false,
          auth_revocable: false,
          auth_immutable: false
        }
      }
    ];
  }
}

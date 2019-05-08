import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("accounts")
/* tslint:disable */
export class Account {

    @PrimaryColumn({ name: "accountid" })
    id: string;

    @Column("bigint")
    balance: string;

    @Column({ name: "seqnum", type: "bigint" })
    sequenceNumber: string;

    @Column({ name: "numsubentries" })
    numSubentries: number;

    @Column({ name: "inflationdest" })
    inflationDestination: string;

    @Column({ name: "homedomain" })
    homeDomain: string;

    @Column("text")
    thresholds: string;

    @Column()
    flags: number;

    @Column({ name: "lastmodified" })
    lastModified: number;

    @Column({ name: "buyingliabilities" })
    buyingLiabilities: string;

    @Column({ name: "sellingliabilities" })
    sellingLiabilities: string;

    @Column("text")
    signers: string;
}

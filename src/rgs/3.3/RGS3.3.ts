import { WorkSheet } from "xlsx"
import assert from "assert"
import { RGS, RGSConfig } from "../RGS"
import { MKB } from "../mkb"

export class RGS3_3 extends RGS {
    private static _instance: RGS3_3 | null = null

    public static get instance() {
        if (!this._instance) {
            console.log("Loading RGS 3.3 ...")
            this._instance = new RGS3_3()
        }
        return this._instance
    }

    private static readonly Config: RGSConfig = {
        version: "3.3",
        filename: "../data/Defversie RGS 3.3-8-dec-2020.xlsx",
        sheetname: "RGS3.3def",
        fields: [
            'Referentiecode',           // Primary Key
            'ReferentieOmslagcode',
            'Sortering',
            'Referentienummer',
            'OmschrijvingKort',
            'Omschrijving',
            'DC',
            'Nivo',
        ],
        primaryFilters: [
            'ZZPBelastingdienst',
            'Basis',
            'Uitgebreid',
            'EZ_VOF',
            'ZZP',
            'WoCo',
        ],
        secondaryFilters: [
            'BeginBalans',
            'Agro',
            'WKR',
            'EZ_VOF',
            'BV',
            'WoCo',
            'Bank',
            'OZWCoopStichtFWO',
            'AfrekSyst',
            'Nivo5',
            'Uitbreiding5'
        ],
        customFilters: [
            MKB.id
        ]
    }

    constructor() {
        super(RGS3_3.Config);
    }

    protected dataRange(workSheet: WorkSheet): string {
        assert(workSheet['!ref'])
        return workSheet['!ref'].replace("A1:", "A3:")  // Skip first and second row (version specification, header)
    }

    protected get dataHeader(): string[] {
        return [
            ...RGS3_3.Config.fields,
            ...RGS3_3.Config.primaryFilters,
            ...RGS3_3.Config.secondaryFilters
        ]
    }

    private async readMKBFilters() {
        const mkb = new MKB()

        for (const item of mkb.read()) {
            const rgsData = this.data.find(el => el['Referentiecode'] === item.Referentiecode)
            if (rgsData) {
                rgsData[MKB.id] = true
            } else {
                console.error(`ERROR: Custom filter for ${item.Referentiecode} can not be applied`)
            }
        }

        // Also include base level
        this.data.filter(el => el['Nivo'] === 1).forEach(el => el[MKB.id] = true)
    }

    protected addCustomFilters() {
        console.log("Loading Custom Filters ...")
        this.readMKBFilters()
    }
}
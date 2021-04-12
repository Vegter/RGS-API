import * as fs from "fs"
import path from "path"
import { decode } from 'iconv-lite'
import parse from 'csv-parse/lib/sync'

export class MKBData {
    constructor(private data: any) {}

    get Referentiecode()        { return this.data['RGS-code'] }
    get ReferentieOmslagcode()  { return this.data.Omslagcode }
    get Sortering()             { return this.data.Sortering }
    get Referentienummer()      { return this.data.RefNr }
    get OmschrijvingKort()      { return this.Omschrijving }
    get Omschrijving()          { return this.data['Omschrijving lang'] }
    get DC()                    { return this.data.DC }
    get Nivo()                  { return this.data.Nivo }
}

export class MKB {
    static id = "MKB_ZZP"

    read(): MKBData[] {
        const filename = path.join(__dirname, '../../data/rgs_schema_ZZP.csv')
        const encoding = 'iso-8859-3'

        const data = decode(fs.readFileSync(filename), encoding)

        return parse(data, {
            columns: true,
            delimiter: ";"
        }).map((result: any) => new MKBData(result))

        // Async streaming alternative
        // Using import csv from 'csv-parser'
        // for await (const item of fs.createReadStream(filename)
        //     .pipe(decodeStream('iso-8859-3'))
        //     .pipe(csv({separator: ";"}))) {
        //     yield new MKBData(item)
        // }
    }
}
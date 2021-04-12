import { read, utils, WorkBook, WorkSheet } from "xlsx"
import path from "path"

export interface RGSConfig {
    version: string,
    filename: string,
    sheetname: string,
    fields: string[],
    primaryFilters: string[],
    secondaryFilters: string[],
    customFilters?: string[]
}

export type RGSDataValue = string | number | boolean | null
export type RGSData = Record<string, RGSDataValue>
export type RGSFilter = [string, number[] | RegExp | string | boolean]

export abstract class RGS {
    private readonly config: RGSConfig
    protected data: RGSData[] = []

    constructor(config: RGSConfig) {
        this.config = config
        this.read()
    }

    protected abstract dataRange(worksheet: WorkSheet): string

    protected abstract get dataHeader(): string[]

    public get fields(): string[] {
        return this.config.fields
    }

    public get primaryFilters(): string[] {
        return this.config.primaryFilters
    }

    public get secondaryFilters(): string[] {
        return this.config.secondaryFilters
    }

    public get customFilters(): string[] {
        return this.config.customFilters || []
    }

    public get allFilters(): string[] {
        return [...this.primaryFilters, ...this.secondaryFilters, ...this.customFilters]
    }

    public get allFields(): string[] {
        return [...this.fields, ...this.allFilters]
    }

    protected addCustomFilters() {
        // Default implementation is not to have any custom filters
    }

    public *streamData(filters: RGSFilter[]) {
        // get RGS data
        // returns the RGS data fields as specified in fields, eg: ["Referentiecode", "Omschrijving"]
        // Filtered on the specified filters, eg [ ["Omschrijving", /omzet/], ["Basis", true], ["Nivo", [2, 3]] ]
        for (let data of this.data) {
            let include = true
            for (let [key, values] of filters) {
                // data should pass all filters
                let value: RGSDataValue = data[key]
                include = false
                if (typeof value === "string") {
                    if (values instanceof RegExp) {
                        // eg ["Omschrijving", /omzet/]
                        include = value.match(values) !== null
                    } else if (typeof  values === "string") {
                        // eg ["DC", "D"]
                        include = value === values
                    }
                } else if (typeof value === "number") {
                    if (Array.isArray(values)) {
                        // eg ["Nivo", [2, 3]]
                        include = values.includes(value)
                    }
                } else if (typeof value === "boolean") {
                    // eg ["Basis", true]
                    include = value
                }
                if (!include) {
                    // Any failing filter skips the data
                    break
                }
            }
            if (include) {
                // data passes all filters, return data with requested fields
                yield this.fields.reduce((result, field) => {
                    result[field] = data[field]
                    return result
                }, {} as Record<string, RGSDataValue>)
            }
        }
    }

    private read() {
        const filename = path.join(__dirname, this.config.filename)
        const workBook: WorkBook = read(filename,{ type: "file" });
        const workSheet: WorkSheet = workBook.Sheets[this.config.sheetname]
        const data: RGSData[] = utils.sheet_to_json(workSheet,
            {
                range: this.dataRange(workSheet),
                defval: null,
                header: this.dataHeader
            })

        // Convert filter values to boolean values
        data.forEach(item => {
            this.allFilters.forEach(filter => {
                item[filter] = Boolean(item[filter])
            })
        })

        this.data = data

        this.addCustomFilters()
    }
}

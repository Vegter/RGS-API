import { Request, Response } from "express"

import { RGS, RGSFilter } from "./RGS"
import { RGS3_3 } from "./3.3/RGS3.3"
import { RGSLint } from "./rgslint"

const DEFAULT_RGS_VERSION = "3.3"

const RGSVersion: Record<string, () => RGS> = {
    [DEFAULT_RGS_VERSION]: () => RGS3_3.instance
}

function *RGSBuilder(data: Generator<any>): Generator {
    let i = 0

    yield "["
    for (let item of data) {
        if (i++ > 0) yield ","
        yield JSON.stringify(item)
    }
    yield "]"
}

function RGSWrite(data: Generator, res: Response): void {
    // Stream the RGS data to the client
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    for (let chunk of data) {
        res.write(chunk)
    }
    res.end()
}

export function RGSHandler(request: Request, response: Response): void {
    // Check requested RGS version
    const version = request.params.version || DEFAULT_RGS_VERSION
    if (! (version in RGSVersion)) {
        response.status(404).send(`RGS Version ${version} not implemented`)
        return
    }

    // Instantiate version (if this is the first request for this version)
    const rgs = RGSVersion[version]()

    // Parse any filters
    const filters = rgs.allFields.reduce((result, filter) => {
        const filterValue = request.query[filter]
        if (typeof filterValue === 'string') {
            if (filter === "Nivo") {
                // n,m,... where n, m, ... are valid numbers
                result.push([filter, filterValue.split(",").map(v => +v).filter(v => !isNaN(v))])
            } else if (rgs.fields.includes(filter)) {
                // field filter, eg DC=D
                result.push([filter, filterValue])
            } else {
                // plain filter, eg Agro or ZZP
                result.push([filter, true])
            }
        }
        return result
    }, [] as RGSFilter[])

    // Build the response and stream it to the client
    const data = rgs.streamData(filters)
    RGSWrite(RGSBuilder(data), response)
}

export function RGSLintHandler(request: Request, response: Response): void {
    // Check requested RGS version
    const version = request.params.version || DEFAULT_RGS_VERSION
    if (! (version in RGSVersion)) {
        response.status(404).send(`RGS Version ${version} not implemented`)
        return
    }

    // Instantiate version (if this is the first request for this version)
    const rgs = RGSVersion[version]()

    const scheme = request.query["scheme"] as string
    if (scheme && !rgs.allFilters.includes(scheme)) {
        response.status(404).send(`RGS Scheme ${scheme} not found`)
        return
    }

    // Build the response and stream it to the client
    const data = RGSLint(rgs, scheme)
    RGSWrite(RGSBuilder(data), response)
}

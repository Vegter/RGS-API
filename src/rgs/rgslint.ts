import { RGS, RGSData } from "./RGS"

/**
 * Checks REGS for:
 *
 * - Ledgeraccounts without parent
 *   Example: BLimBan exists but BLim not
 *
 * - Filters with ledgeraccounts without parent
 *   Example: BLimBan has filter ZZP but its parent BLim has not
 *
 * - Missing field values
 *   Example: Sortering: ""
 *
 */
export function *RGSLint(rgs: RGS, scheme: string = "") {
    // Shortcuts for fields
    const nivo = (account: RGSData) => account['Nivo'] as number
    const code = (account: RGSData) => account['Referentiecode'] as string

    // Sort accounts highest nivo to lowest nivo to be able to find parent by first match
    const accounts = [...rgs.accounts].sort((account1, account2) =>
        nivo(account2) - nivo(account1))
    const fields = rgs.fields

    // Parent logic
    const getParent = (account: RGSData) =>
        accounts.find(parent => account !== parent &&
            nivo(account) === nivo(parent) + 1 &&
            code(account).indexOf(code(parent)) === 0)
    const shouldHaveParent = (account: RGSData) => nivo(account) > 1

    // Field logic
    const isEmptyField = (account: RGSData, field: string) => account[field] === null || account[field] === ""
    const allowedToBeEmpty = (account: RGSData, field: string) =>
        field === 'ReferentieOmslagcode' ||
        (nivo(account) === 1 && ["Sortering", "Referentienummer", "DC"].includes(field))
    const missingData = (account: RGSData, field: string) =>
        isEmptyField(account, field) && !allowedToBeEmpty(account, field)

    // Checks per account
    for (const account of accounts) {

        // Check if all fields have data
        for (const field of fields) {
            if (missingData(account, field)) {
                yield `Value expected for ${code(account)}.${field}`
            }
        }

        // Check if a parent can be found
        const parent = getParent(account)
        if (!parent && shouldHaveParent(account)) {
            yield `Parent expected for ${code(account)}`
        }

        // Check scheme parent
        if (parent && scheme && account[scheme] && !parent[scheme]) {
            // If a filter is active for an account then the parent is expected to have the same filter active
            yield `Parent expected in scheme ${scheme} for ${code(account)}` +
                  ` (${code(parent)}.${scheme} = ${parent[scheme]})`
        }
    }

}

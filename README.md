# RGS REST API

A REST API for the Referentie Grootboek Schema

The RGS versions that are served by this API is currently version
[Referentie GrootboekSchema 3.3](https://referentiegrootboekschema.nl/definitieve-versie-rgs-33)

To further reduce the number of ledger accounts for ZZP-ers,
the version 3.3 specification has been extended with the MKB filter of
[BoekhoudPlaza](https://www.boekhoudplaza.nl/cmm/rgs/decimaal_rekeningschema_rgs.php?kznivo34=2&brancheid=1&rgsvarzoek=&kzBedrijf=ZZP)

## Usage

Swagger documentation will be added on short terms

Basic API usage is:

- /rgs
  
  Returns all RGS ledger accounts
  

- /rgs/3.3/
  
  Same as /rgs, 3.3 is the default version
  

- /rgs/?Basis
  
  Returns the RGS ledger accounts that are marked as Basis account
  The complete list of available filters is:
  - ZZPBelastingdienst 
  - Basis
  - Uitgebreid
  - EZ_VOF
  - ZZP
  - WoCo

    
- /rgs/?Nivo=3

  Returns the RGS ledger accounts that have Nivo 2
  Other fields that can be selected are:
  - Referentiecode
  - ReferentieOmslagcode
  - Sortering
  - Referentienummer
  - OmschrijvingKort
  - Omschrijving
  - DC
  - Nivo


- /rgs/?MKB_ZZP

  Returns the RGS ledger accounts that are marked by BoekhoudPlaza as MKB ZZP account


All API results are streamed in order to limit API latency.

Support for filtering results on the basis of regular expressions is foreseen but not yet implemented.

## Scripts

`yarn`

Initialize the project

`yarn dev`

Run the RGS API in development mode.

Run `http://localhost:8000/rgs` to view the output in your browser.

`yarn build`

Build the API for production usage

`yarn start`

Serve the production API



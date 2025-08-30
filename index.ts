import {getWsProvider} from "polkadot-api/ws-provider/web";
import type {JsonRpcProvider} from "@polkadot-api/ws-provider/web";
import {createClient, type PolkadotClient, type SS58String} from "polkadot-api";
import {collectives, dot, paseo, people} from "@polkadot-api/descriptors";

const POLKADOT_RPC_ENDPOINT = 'wss://rpc.polkadot.io';
const PEOPLE_RPC_ENDPOINT = "wss://polkadot-people-rpc.polkadot.io";
const COLLECTIVES_RPC_ENDPOINT = "wss://polkadot-collectives-rpc.polkadot.io";
const PASEO_RPC_ENDPOINT = "wss://paseo.rpc.amforc.com";

const DEFAULT_ADDRESS = "15DCZocYEM2ThYCAj22QE4QENRvUNVrDtoLBVbCm5x4EQncr";

async function getSudoAccountFreeBalance(paseoClient) {
    const paseoApi = paseoClient.getTypedApi(paseo);

    //   - Call `dotApi.query.System.Account.getValue(address)`.
    const accountInfo =
        await paseoApi.query.System.Account.getValue(DEFAULT_ADDRESS);

    console.log(accountInfo);
}

async function main(): Promise<void> {
    const polkadotClient: PolkadotClient = makeClient(POLKADOT_RPC_ENDPOINT);
    console.log(polkadotClient);
    await printChainInfo(polkadotClient);

    const peopleClient = makeClient(PEOPLE_RPC_ENDPOINT);
    await printChainInfo(peopleClient);

    const collectivesClient = makeClient(
        COLLECTIVES_RPC_ENDPOINT,
    );
    await printChainInfo(collectivesClient);

    const paseoClient = makeClient(PASEO_RPC_ENDPOINT);
    await printChainInfo(paseoClient);

    const balance = await getBalance(polkadotClient, DEFAULT_ADDRESS);
    console.log("Address: " + DEFAULT_ADDRESS);
    console.log("Balance: ", balance);

    const displayName = await getDisplayName(peopleClient, DEFAULT_ADDRESS);
    console.log(`Balance(${displayName}): `, balance);

    const members: FellowshipMember[] = await getFellowshipMembers(collectivesClient);

    console.log("Generating table...");

    const membersInfoTable: FellowshipMemberInfo[] = await Promise.all(members
        .map(async m => ({
            address: m.address,
            rank: m.rank,
            displayName: await getDisplayName(peopleClient, m.address),
            balance: await getBalance(polkadotClient, m.address)
        } as FellowshipMemberInfo)));

    console.table(membersInfoTable);

    await getSudoAccountFreeBalance(paseoClient);
}

interface FellowshipMemberInfo {
    address: SS58String;
    rank: number;
    displayName: string | undefined;
    balance: BigInt;
}

// - Create a new function `makeClient`
//   - Function accepts a parameter `endpoint` with type `string`.
//   - Function returns the `PolkadotClient` type we imported above.
function makeClient(endpoint: string): PolkadotClient {
    // - Import `getWsProvider` from `polkadot-api/ws-provider/web`.
    // - import `createClient` and `type PolkadotClient` from `polkadot-api`;

    console.info("Creating Client for: ", endpoint);
    // @ts-ignore
    return createClient(getWsProvider(endpoint) as JsonRpcProvider);
}

// - Create a new `async` function` named `printChainInfo`.
//   - It should accept a parameter `client` of type `PolkadotClient`.
// - Write the logic for `printChainInfo`.
async function printChainInfo(client: PolkadotClient) {
    // getChainSpecData() should not be used in mainnet apps

    //   - Call the `getChainSpecData` method, which is exposed on `client`. **IMPORTANT NOTE:** This method is used in this tutorial, but it should not be used in production apps.
    //   - `await` the result, and assign the output to a new constant `chainSpec`.
    const chainSpecData = await client.getChainSpecData();

    //   - Call the `getFinalizedBlock` method, which is exposed on `client`.
    //   - `await` the result, and assign the output to a new constant `finalizedBlock`.
    const finalizedBlock = await client.getFinalizedBlock();

    //   - Print `chainSpec.name` and `finalizedBlock.number` with a friendly message.
    console.log("Chain Specification: ", chainSpecData);
    console.log("Finalized Block # ", finalizedBlock);
}

// - Create a new `async` function called `getBalance`:
//   - It accepts two parameters:
//     - A parameter named `polkadotClient` which is of type `PolkadotClient`.
//     - A parameter named `address` which is of type `SS58String` which we imported above.
//   - It returns a `Promise<BigInt>`.
// - Write the logic of the `getBalance` function:
async function getBalance(client: PolkadotClient,
                          address: SS58String): Promise<BigInt> {

    //   - Call the `getTypedApi` method on the `polkadotClient` variable.
    //     - The `getTypedApi` method should include the parameter `dot`, which we imported above.
    //     - Assign the result to a new constant `dotApi`.
    const dotApi = client.getTypedApi(dot);

    //   - Call `dotApi.query.System.Account.getValue(address)`.
    const accountInfo =
        await dotApi.query.System.Account.getValue(address);

    //   - `await` the result, and assign it to a new constant `accountInfo`.
    //   - Extract the `free` and `reserved` balance from `accountInfo.data`.
    const free = accountInfo.data.free;
    const reserved = accountInfo.data.reserved;

    //   - Return the sum of `free` and `reserved`.
    return free + reserved;
}

// - Create a new `async` function called `getDisplayName`:
//   - It accepts two parameters:
//     - `peopleClient` which is of type `PolkadotClient`.
//     - `address` which is of type `SS58String`.
//   - It returns a `Promise<string | undefined>`.
// - Write the logic of the `getDisplayName` function:
async function getDisplayName(peopleClient: PolkadotClient,
                              address: SS58String): Promise<string | undefined> {

    try {
        //   - Call the `getTypedApi` method on the `peopleClient` variable.
        //     - The `getTypedApi` method should include the parameter `people`, which we imported above.
        //     - Assign the result to a new constant `peopleApi`.
        const peopleApi = peopleClient.getTypedApi(people);

        //   - Call `peopleApi.query.Identity.IdentityOf.getValue(address)`.
        //   - `await` the result, and assign it to a new constant `accountInfo`.
        const {info}: any = await peopleApi.query.Identity.IdentityOf.getValue(address);

        //   - Extract the display name with: `accountInfo?.[0].info.display.value?.asText()`
        //     - Assign the result to a new constant `displayName`.
        //   - Return the `displayName` constant.
        return info.display.value?.asText();
    } catch (error) {
        return "Display Name Missing";
    }
}

interface FellowshipMember {
    address: SS58String;
    rank: number;
}

// - Create a new `async` function `getFellowshipMembers`:
//   - It has a single parameter `collectivesClient` of type `PolkadotClient`.
//   - It returns an array of fellowship members: `Promise<FellowshipMember[]>`.
// - Write the logic of the `getFellowshipMembers` function:
async function getFellowshipMembers(
    collectivesClient: PolkadotClient,
): Promise<FellowshipMember[]> {

    //   - Call the `getTypedApi` method on the `collectivesClient` variable.
    //     - The `getTypedApi` method should include the parameter `collectives`, which we imported above.
    //     - Assign the result to a new constant `collectivesApi`.
    const collectivesApi =
        collectivesClient.getTypedApi(collectives);

    //   - Call `collectivesApi.query.FellowshipCollective.Members.getEntries()`.
    //   - `await` the result, and assign it to a new constant `rawMembers`.
    const rawMembers =
        await collectivesApi.query.FellowshipCollective.Members.getEntries();

    //   - Extract the `address` and `rank` from `rawMembers`:
    //     - `map` the items of `rawMembers` to access the individual members `m`.
    //     - Access the `address` of the member by calling `m.keyArgs[0]`.
    //     - Access the `rank` of the member by calling `m.value`.
    //       - Make sure the data is in the structure of `FellowshipMember`.
    //   - Return the `fellowshipMembers` constant.
    return rawMembers
        .filter(m =>
            m.keyArgs[0] !== null && m.value !== null)
        .sort((a, b) =>
            b.value - a.value)
        .map<FellowshipMember>(m =>
            ({
                address: m.keyArgs[0],
                rank: m.value
            } as FellowshipMember));
}

// Invoke main function
main()
    .catch(error => {
        console.error(error);
    })
    .then(() => {
        console.log("\n Execution complete \n");
    })
    .finally(() => {
        process.exit(0);
    });
import {getWsProvider} from "polkadot-api/ws-provider/web";
import type {JsonRpcProvider} from "@polkadot-api/ws-provider/web";
import {createClient, type PolkadotClient, type SS58String} from "polkadot-api";
import {dot} from "@polkadot-api/descriptors";

const POLKADOT_RPC_ENDPOINT = 'wss://rpc.polkadot.io';

async function main(): Promise<void> {
    const polkadotClient: PolkadotClient = makeClient(POLKADOT_RPC_ENDPOINT);
    console.log(polkadotClient);

    await printChainInfo(polkadotClient);

    // TODO:
    // - Create a new constant `address` with value .

    const address = `"15DCZocYEM2ThYCAj22QE4QENRvUNVrDtoLBVbCm5x4EQncr"`;

    const balance = await getBalance(polkadotClient, address);

    console.log("Address: " + address);
    console.log("Balance: ", balance);

    // - Call `getBalance`, using the constants `polkadotClient` and `address`.
    // - `await` the result, and assign it to a constant named `balance`.
    // - Print a friendly message to display the `address` and their `balance`.
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
async function getBalance(client: PolkadotClient, address: SS58String): Promise<BigInt> {
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


// Invoke main function
main()
    .catch(error => {
        console.error(error);
    })
    .then(() => {
        console.log("Execution complete");
    })
    .finally(() => {
        process.exit(0);
    });
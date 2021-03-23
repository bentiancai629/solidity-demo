
import {DydxClient} from '@dydxprotocol/v3-client'

const client = new DydxClient(
    'host',
    {
        apiTimeout: 3000,
        starkPrivateKey: '01234abcd...',
    },
);

console.log(`client:${client}`);


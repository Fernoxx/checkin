// @vitest-environment clarinet
import { describe, it, expect } from 'vitest';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const contracts = [
    { name: "sunday", day: 0 },
    { name: "monday", day: 1 },
    { name: "tuesday", day: 2 },
    { name: "wednesday", day: 3 },
    { name: "thursday", day: 4 },
    { name: "friday", day: 5 },
    { name: "saturday", day: 6 },
];

describe('Daily Checkin V3 Contracts', () => {

    contracts.forEach(({ name, day }) => {
        describe(`${name}.clar`, () => {

            it(`should enforce fee and reward values`, () => {
                // Check read-only params
                const res = simnet.callReadOnlyFn(name, "get-fee-rates", [], deployer);
                // Expect 1 STX (1000000) fee, 1.5 STX (1500000) reward
                expect(res.result).toBeOk(types.tuple({
                    "check-in-fee": types.uint(1000000),
                    "claim-fee": types.uint(100000),
                    "score-fee": types.uint(100000),
                    "reward-amount": types.uint(1500000)
                }));
            });

        });
    });
});

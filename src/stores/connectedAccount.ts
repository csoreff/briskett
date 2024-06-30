import { atom } from "nanostores";
import dayjs from "dayjs";
import TezosAddressPaths from "../assets/js/tezosAddressPaths.ts";
import { $tzProKey } from "../stores/externalServices.ts";
import { getAccountRevelation, getContract } from "../assets/js/util.ts";

// default to first path
export const $connectedAccountPath = atom<string>(TezosAddressPaths[0]);
export const $connectedAddress = atom<string>(
	import.meta.env.PUBLIC_INITIAL_CONNECTED_ADDRESS || "",
);
export const $connectedAddressBalance = atom<number>(0.0);
export const $connectedAccountOperations = atom<Array<Operation>>([]);
export const $connectedAddressBaker = atom<string>("");
export const $connectedAccountIsRevealed = atom<boolean>(false);

export function loadConnectedAccountData() {
	getContract($connectedAddress.get()).then((contract) => {
		$connectedAddressBalance.set(contract.balance);
		$connectedAddressBaker.set(contract.delegate);
	});

	getAccountRevelation($connectedAddress.get()).then((isRevealed) => {
		$connectedAccountIsRevealed.set(isRevealed);
	});

	fetch(
		`https://api.tzpro.io/explorer/account/${$connectedAddress.get()}/operations?order=desc`,
		{
			headers: {
				"X-API-Key": $tzProKey.get() || "8KH89EH6WDLFBSZR4KQODW1F5KZFTPC",
			},
		},
	)
		.then((r) => r.json())
		.then((payload) => {
			if (Object.hasOwnProperty.call(payload, "errors")) {
				return;
			}

			const formattedOperations: Array<Operation> = payload.map(
				(operation: Operation) => {
					return {
						...operation,
						time: dayjs(operation?.time).format("ddd, MMM DD, YYYY HH:mm:ss"),
					};
				},
			);

			$connectedAccountOperations.set(formattedOperations);
		});
}

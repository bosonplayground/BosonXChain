# BosonXChain

## Description

Boson Protocol allows decentralized commerce using NFTs encoded with game theory.

When a seller deploys the same offer on different Layer 2 chains, the supply quantity of items for sale needs to be managed across multiple chains.

This supply quantity is represented by the balance of the seller for a given ERC1155 token.

So we need a cross-chain inventory synchronization mechanism, that allows to "transfer" a given quantity of ERC1155 token from the chain with the lowest demand to another chain with higher demand

## Details of the solution
A subset of the Boson Protocol contracts was deployed to both the Polygon Mumbai testnet and the Arbitrum testnet. The contract addresses are as follows:

Polygon Mumbai
* ERC1155ERC721 deployed to: 0xEd008860a5319b7E88E1203A1a9FB37c4016b221
* BosonRouter deployed to: 0xa58a33aE4eF4F267c0580C609166259E72F9565c
* LocalOracle deployed to: 0x841E6A492eDc0EC6dAB8Cfa0D6173Ad56b8A136c

Arbitrum Testnet
* ERC1155ERC721 deployed to: 0x46326b2d7ea8e32aFC9a4e6bD583AF993827Dd6C
* BosonRouter deployed to: 0x8C49ef50160104b02C95f7e4d4e8d60C97Fcd459
* LocalOracle deployed to: 0xBa573Ff56Ba32c4ee1D4d8EF16337504Db5938d6

In order to interconnect these 2 chains, we have deployed Chainlink nodes (one on each chain) each coupled with a Chainlink External Initiator.
(https://github.com/smartcontractkit/external-initiator)

The External Initiators allow the nodes to capture events from the other chain. To link the Boson Protocol with the Chainlink nodes, we have added another contract called LocalOracle, deployed on each chain

![BosonXChain 4](https://user-images.githubusercontent.com/7184124/117544975-adb72a80-b01b-11eb-8ac0-fca8d119ffe0.png)

### Chainlink Jobs

(For the purpose of the demo, the Arbitrum chain has been replaced with the Goerli testnet, because we had a few problems when transacting on Arbitrum that could not be fixed in time.)

* CHAINLINK JOB SPEC on GOERLI Instance

This job is triggered by the external initiator running on Mumbai (ei_mumbai) that captures the event HelpMe (signature: 0x6f0b3adf1da16b986ff9549d7dfa3777deee211dea7f5e58b2e57c121a6c0e71) from the LocalOracle contract deployed on Mumbai at 0x841E6A492eDc0EC6dAB8Cfa0D6173Ad56b8A136c.

This job calls the method provideHelp (selector 0x589d93d8) of the LocalOracle contract deployed on Goerli at 0x697d96F5C2f3DFCC8A0361070f19BE6eFDDEC0f7.

```
{
    "name": "EI Mumbai LocalOracle HelpMe > Goerli LocalOracle provideHelp",
    "initiators": [
        {
            "type": "external",
            "params": {
                "name": "ei_mumbai",
                "body": {
                    "endpoint": "ei_mumbai",
                    "addresses": ["0x841E6A492eDc0EC6dAB8Cfa0D6173Ad56b8A136c"],
                    "topics": ["0x6f0b3adf1da16b986ff9549d7dfa3777deee211dea7f5e58b2e57c121a6c0e71"]
                }![image_2021-05-08_163228](https://user-images.githubusercontent.com/7184124/117544809-fb7f6300-b01a-11eb-977f-74c48610c073.png)

            }
        }
    ],
    "tasks": [
        {
          "type": "Copy",
          "params": {
            "copyPath": [
              "data"
            ]
          }
        },
        {
            "type": "ethuint256"
        },
        {
            "type": "ethtx",
            "params": {
                "address": "0x697d96F5C2f3DFCC8A0361070f19BE6eFDDEC0f7",
                "functionSelector": "0x589d93d8"
            }
        }
    ]
}
```

* CHAINLINK JOB SPEC on MUMBAI Instance

This job is triggered by the external initiator running on Goerli (ei_g) that captures the event ProvideHelp (signature: 0x40def615caa1787c2c23d86d84df9630acbb81284cf943d8735d9dbaec2fdb52) from the LocalOracle contract deployed on Goerli at 0x697d96F5C2f3DFCC8A0361070f19BE6eFDDEC0f7.

This job calls the method helpReceived (selector 0xa56e71a1) of the LocalOracle contract deployed on Mumbai at 0x841E6A492eDc0EC6dAB8Cfa0D6173Ad56b8A136c.

```
{
    "name": "EI Goerli LocalOracle ProvideHelp > Mumbai LocalOracle helpReceived",
    "initiators": [
        {
            "type": "external",
            "params": {
                "name": "ei_g",
                "body": {
                    "endpoint": "ei_g",
                    "addresses": ["0x697d96F5C2f3DFCC8A0361070f19BE6eFDDEC0f7"],
                    "topics": ["0x40def615caa1787c2c23d86d84df9630acbb81284cf943d8735d9dbaec2fdb52"]
                }
            }
        }
    ],
    "tasks": [
        {
          "type": "Copy",
          "params": {
            "copyPath": [
              "data"
            ]
          }
        },
        {
            "type": "ethuint256"
        },
        {
            "type": "ethtx",
            "params": {
                "address": "0x841E6A492eDc0EC6dAB8Cfa0D6173Ad56b8A136c",
                "functionSelector": "0xa56e71a1"
            }
        }
    ]
}
```

## Demo

![2021_05_08_13_35_15_](https://user-images.githubusercontent.com/7184124/117544828-18b43180-b01b-11eb-8414-155a779c30e7.png)

![2021-05-08 16_02_06-Job run details](https://user-images.githubusercontent.com/7184124/117544932-8b251180-b01b-11eb-9280-77e85d46bf22.png)


## References

[Boson Protocol](https://www.bosonprotocol.io)

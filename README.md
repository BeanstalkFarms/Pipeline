<img src="https://github.com/BeanstalkFarms/Beanstalk-Brand-Assets/blob/main/pipeline/pipeline.svg" alt="Pipeline logo" align="right" width="120" />

# Pipeline

Perform an arbitrary series of actions in the EVM in a single transaction: [evmpipeline.org](https://evmpipeline.org)

Code Version: `1.0.1` <br>
Whitepaper Version: `1.0.2`

Pipeline is a standalone contract that creates a sandbox to execute an arbitrary composition of valid
actions within the EVM in a single transaction using Ether. Depot is a wrapper for Pipeline that
supports (1) loading Ether and non-Ether assets into Pipeline, (2) using them and (3) unloading
them from Pipeline, in a single transaction.

## Documentation

* [Pipeline Whitepaper](https://evmpipeline.org/pipeline.pdf) ([Version History](https://github.com/BeanstalkFarms/Pipeline-Whitepaper/tree/main/version-history)).

## Audits

Read Halborn's final audit report [here](https://bean.money/11-15-22-pipeline-halborn-report).

## Bug Bounty Program

Pipeline and Depot are both considered in-scope of the Beanstalk Immunefi Bug Bounty Program.

You can find the program and submit bug reports [here](https://immunefi.com/bounty/beanstalk).

## Contracts

### V1.0.1 (Current):
|  Contract  |              Address 
|:-----------|:-----------------------------------------------------------------------------------------------------------------------|
|  Pipeline  | [0xb1bE0000C6B3C62749b5F0c92480146452D15423](https://etherscan.io/address/0xb1bE0000C6B3C62749b5F0c92480146452D15423)  |
|  Depot     | [0xDEb0f00071497a5cc9b4A6B96068277e57A82Ae2](https://etherscan.io/address/0xDEb0f00071497a5cc9b4A6B96068277e57A82Ae2)  |

#### Changelog
- Add `receive` function fallback to Depot and Pipeline.
- Add `version` function to Depot and Pipeline.
- Update `transferDeposit(s)` to Depot to account for BIP-36.

### V1.0.0
|  Contract  |              Address 
|:-----------|:-----------------------------------------------------------------------------------------------------------------------|
|  Pipeline  | [0xb1bE0000bFdcDDc92A8290202830C4Ef689dCeaa](https://etherscan.io/address/0xb1bE0000bFdcDDc92A8290202830C4Ef689dCeaa)  |
|  Depot     | [0xDEb0f000082fD56C10f449d4f8497682494da84D](https://etherscan.io/address/0xDEb0f000082fD56C10f449d4f8497682494da84D)  |

## License

[MIT](https://github.com/BeanstalkFarms/Pipeline/blob/master/LICENSE)
